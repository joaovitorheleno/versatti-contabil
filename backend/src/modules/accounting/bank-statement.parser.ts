import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';

export interface ParsedTransaction {
  date: string;
  amountCents: number;
  description: string;
  fitid: string;
}

export interface ParsedStatement {
  format: 'OFX' | 'CSV';
  transactions: ParsedTransaction[];
}

const decode = (buffer: Buffer) => {
  const head = buffer.subarray(0, 600).toString('latin1');
  if (/CHARSET:\s*1252|ENCODING:\s*USASCII|encoding="(windows-1252|iso-8859-1)"/i.test(head)) {
    return buffer.toString('latin1');
  }
  const utf8 = buffer.toString('utf8');
  return utf8.includes('�') ? buffer.toString('latin1') : utf8;
};

const parseAmount = (raw: string) => {
  let value = raw.trim().replace(/[R$\s]/g, '');
  const negative = /^\(.*\)$/.test(value) || value.endsWith('-');
  value = value.replace(/[()]/g, '').replace(/-$/, '');

  if (value.includes(',') && value.lastIndexOf(',') > value.lastIndexOf('.')) {
    value = value.replace(/\./g, '').replace(',', '.');
  } else {
    value = value.replace(/,/g, '');
  }

  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round((negative ? -Math.abs(number) : number) * 100);
};

const parseDate = (raw: string) => {
  const value = raw.trim();
  let match = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  match = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (match) {
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  }
  return null;
};

const clean = (text: string) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 255);

const hashId = (parts: string[]) =>
  'h_' + createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 32);

const parseOfx = (text: string): ParsedTransaction[] => {
  const blocks = text.match(/<STMTTRN>[\s\S]*?(?=<\/STMTTRN>|<STMTTRN>|<\/BANKTRANLIST>)/gi) ?? [];
  const field = (block: string, tag: string) =>
    block.match(new RegExp(`<${tag}>([^<\\r\\n]*)`, 'i'))?.[1]?.trim() ?? '';

  const seen = new Map<string, number>();

  return blocks.flatMap((block) => {
    const date = parseDate(field(block, 'DTPOSTED'));
    const amountCents = parseAmount(field(block, 'TRNAMT'));
    if (!date || amountCents === null) return [];

    const memo = field(block, 'MEMO');
    const name = field(block, 'NAME');
    const description =
      clean([name, memo].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' - ')) ||
      'Sem descrição';

    let fitid = field(block, 'FITID');
    if (!fitid) {
      const key = `${date}|${amountCents}|${description}`;
      const occurrence = (seen.get(key) ?? 0) + 1;
      seen.set(key, occurrence);
      fitid = hashId([key, String(occurrence)]);
    }

    return [{ date, amountCents, description, fitid: fitid.slice(0, 120) }];
  });
};

const splitCsvLine = (line: string, delimiter: string) => {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(current);
      current = '';
    } else current += char;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
};

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const parseCsv = (text: string): ParsedTransaction[] => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) {
    throw new BadRequestException('O CSV precisa ter um cabeçalho e ao menos uma linha');
  }

  const delimiter = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const header = splitCsvLine(lines[0], delimiter).map(normalize);

  const find = (...names: string[]) =>
    header.findIndex((h) => names.some((name) => h === name || h.startsWith(name)));

  const dateCol = find('data', 'date', 'dt');
  const descCol = find('descricao', 'historico', 'description', 'memo', 'lancamento');
  const amountCol = find('valor', 'amount', 'value', 'montante');
  const creditCol = find('credito', 'entrada', 'credit');
  const debitCol = find('debito', 'saida', 'debit');

  if (dateCol < 0 || (amountCol < 0 && creditCol < 0 && debitCol < 0)) {
    throw new BadRequestException(
      'Não reconheci as colunas do CSV. Use um cabeçalho com "Data", "Descrição" e "Valor" (ou "Crédito" e "Débito").',
    );
  }

  const seen = new Map<string, number>();
  const result: ParsedTransaction[] = [];

  lines.slice(1).forEach((line, index) => {
    const cells = splitCsvLine(line, delimiter);
    const date = parseDate(cells[dateCol] ?? '');
    if (!date) return;

    let amountCents: number | null = null;
    if (amountCol >= 0 && cells[amountCol]) {
      amountCents = parseAmount(cells[amountCol]);
    } else {
      const credit = creditCol >= 0 && cells[creditCol] ? parseAmount(cells[creditCol]) : 0;
      const debit = debitCol >= 0 && cells[debitCol] ? parseAmount(cells[debitCol]) : 0;
      if (credit === null || debit === null) amountCents = null;
      else amountCents = Math.abs(credit) - Math.abs(debit);
    }
    if (amountCents === null || amountCents === 0) return;

    const description = clean(descCol >= 0 ? cells[descCol] ?? '' : '') || `Linha ${index + 2}`;
    const key = `${date}|${amountCents}|${description}`;
    const occurrence = (seen.get(key) ?? 0) + 1;
    seen.set(key, occurrence);

    result.push({ date, amountCents, description, fitid: hashId([key, String(occurrence)]) });
  });

  return result;
};

export const parseBankStatement = (buffer: Buffer, fileName: string): ParsedStatement => {
  const text = decode(buffer);
  const isOfx = /\.ofx$/i.test(fileName) || /<OFX>|OFXHEADER/i.test(text.slice(0, 2000));

  const transactions = isOfx ? parseOfx(text) : parseCsv(text);
  if (transactions.length === 0) {
    throw new BadRequestException('Nenhum lançamento encontrado no arquivo');
  }

  return { format: isOfx ? 'OFX' : 'CSV', transactions };
};
