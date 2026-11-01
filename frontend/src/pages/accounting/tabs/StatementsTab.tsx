import {
  CheckCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Alert, Button, DatePicker, Segmented, Spin, Table, Typography } from "antd";
import ptBR from "antd/es/date-picker/locale/pt_BR";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useEffect, useState } from "react";
import EmptyState from "../../../components/empty/Empty";
import {
  exportToExcel,
  exportToPdf,
  type ExportOptions,
} from "../../../functions/exportReport";
import { maskCnpj } from "../../../functions/maskCnpj";
import {
  getBalanceSheet,
  getIncomeStatement,
  getTrialBalance,
} from "../../../service/accounting/integration";
import type {
  Account,
  BalanceSheet,
  IncomeStatement,
  StatementLine,
  TrialBalance,
  TrialBalanceRow,
} from "../../../service/accounting/types";
import {
  API_FORMAT,
  DATE_FORMAT,
  formatDate,
  formatMoney,
  notifyError,
} from "../shared";
import * as S from "../styles";

const { Text } = Typography;
const { RangePicker } = DatePicker;

type Props = {
  clientId: string;
  accounts: Account[];
  refreshKey: number;
};

type Kind = "trial" | "income" | "balance";

type FlatRow = { conta: string; valor: string; bold?: boolean };

const indent = (level: number) => " ".repeat(Math.max(0, level - 1));

const signed = (value: number, side: string) =>
  value === 0 ? "-" : `${formatMoney(Math.abs(value))} ${side}`.trim();

const StatementsTab = ({ clientId, refreshKey }: Props) => {
  const [kind, setKind] = useState<Kind>("income");
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf("year"), dayjs()]);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [trial, setTrial] = useState<TrialBalance | null>(null);
  const [income, setIncome] = useState<IncomeStatement | null>(null);
  const [balance, setBalance] = useState<BalanceSheet | null>(null);

  const generate = useCallback(async () => {
    const period = { from: range[0].format(API_FORMAT), to: range[1].format(API_FORMAT) };
    try {
      setLoading(true);
      if (kind === "trial") setTrial(await getTrialBalance(clientId, period));
      if (kind === "income") setIncome(await getIncomeStatement(clientId, period));
      if (kind === "balance") setBalance(await getBalanceSheet(clientId, { date: date.format(API_FORMAT) }));
    } catch (e) {
      notifyError("Falha ao gerar a demonstração", e);
    } finally {
      setLoading(false);
    }
  }, [clientId, kind, range, date]);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, refreshKey]);

  const current = kind === "trial" ? trial : kind === "income" ? income : balance;
  const company = current ? `${current.client.name} - ${maskCnpj(current.client.cnpj)}` : "";

  const runExport = async <T,>(format: "excel" | "pdf", options: ExportOptions<T>) => {
    try {
      setExporting(format);
      if (format === "excel") await exportToExcel(options);
      else await exportToPdf(options);
    } catch (e) {
      notifyError("Falha ao exportar", e);
    } finally {
      setExporting(null);
    }
  };

  const handleExport = (format: "excel" | "pdf") => {
    if (kind === "trial" && trial) {
      return runExport<TrialBalanceRow>(format, {
        fileName: `balancete_${trial.from}_${trial.to}`,
        title: "Balancete de verificação",
        subtitle: `${company} · ${formatDate(trial.from)} a ${formatDate(trial.to)}`,
        rows: trial.rows,
        columns: [
          { header: "Código", value: (r) => r.code, width: 14 },
          { header: "Conta", value: (r) => `${indent(r.level)}${r.name}`, width: 42 },
          { header: "Saldo anterior", value: (r) => signed(r.opening, r.openingSide), width: 18 },
          { header: "Débitos", value: (r) => formatMoney(r.debit), width: 16 },
          { header: "Créditos", value: (r) => formatMoney(r.credit), width: 16 },
          { header: "Saldo atual", value: (r) => signed(r.closing, r.closingSide), width: 18 },
        ],
      });
    }

    const flat: FlatRow[] = [];
    const pushLines = (lines: StatementLine[]) =>
      lines.forEach((l) => flat.push({ conta: `${indent(l.level - 1)}${l.code} ${l.name}`, valor: formatMoney(l.value) }));

    if (kind === "income" && income) {
      income.sections.forEach((section) => {
        if (!section.subtotal && section.lines.length === 0 && section.total === 0) return;
        flat.push({ conta: section.label, valor: formatMoney(section.total), bold: true });
        pushLines(section.lines);
      });
      return runExport<FlatRow>(format, {
        fileName: `dre_${income.from}_${income.to}`,
        title: "Demonstração do Resultado do Exercício (DRE)",
        subtitle: `${company} · ${formatDate(income.from)} a ${formatDate(income.to)}`,
        rows: flat,
        columns: [
          { header: "Descrição", value: (r) => r.conta, width: 60 },
          { header: "Valor", value: (r) => r.valor, width: 20 },
        ],
      });
    }

    if (kind === "balance" && balance) {
      flat.push({ conta: "ATIVO", valor: formatMoney(balance.assets.total), bold: true });
      pushLines(balance.assets.lines);
      flat.push({ conta: "PASSIVO", valor: formatMoney(balance.liabilities.total), bold: true });
      pushLines(balance.liabilities.lines);
      flat.push({ conta: "PATRIMÔNIO LÍQUIDO", valor: formatMoney(balance.equity.total), bold: true });
      pushLines(balance.equity.lines);
      flat.push({ conta: "TOTAL DO PASSIVO + PL", valor: formatMoney(balance.liabilitiesAndEquity), bold: true });
      return runExport<FlatRow>(format, {
        fileName: `balanco_${balance.date}`,
        title: "Balanço Patrimonial",
        subtitle: `${company} · em ${formatDate(balance.date)}`,
        rows: flat,
        columns: [
          { header: "Descrição", value: (r) => r.conta, width: 60 },
          { header: "Valor", value: (r) => r.valor, width: 20 },
        ],
      });
    }
  };

  const trialColumns: ColumnsType<TrialBalanceRow> = [
    {
      title: "Conta",
      key: "account",
      render: (_, r) => (
        <span style={{ paddingLeft: (r.level - 1) * 16, fontWeight: r.analytic ? 400 : 600 }}>
          <Text type="secondary" style={{ marginRight: 8 }}>{r.code}</Text>
          {r.name}
        </span>
      ),
    },
    { title: "Saldo anterior", key: "opening", align: "right", width: 160, render: (_, r) => <S.Money>{signed(r.opening, r.openingSide)}</S.Money> },
    { title: "Débitos", key: "debit", align: "right", width: 140, render: (_, r) => <S.Money>{formatMoney(r.debit)}</S.Money> },
    { title: "Créditos", key: "credit", align: "right", width: 140, render: (_, r) => <S.Money>{formatMoney(r.credit)}</S.Money> },
    { title: "Saldo atual", key: "closing", align: "right", width: 160, render: (_, r) => <S.Money style={{ fontWeight: 600 }}>{signed(r.closing, r.closingSide)}</S.Money> },
  ];

  const renderLines = (lines: StatementLine[]) =>
    lines.map((l) => (
      <tr key={`${l.code}-${l.name}`}>
        <td style={{ paddingLeft: 8 + (l.level - 2) * 18 }}>
          {l.code && <Text type="secondary" style={{ marginRight: 8 }}>{l.code}</Text>}
          {l.name}
        </td>
        <td><S.Money $negative={l.value < 0}>{formatMoney(l.value)}</S.Money></td>
      </tr>
    ));

  const renderIncome = (data: IncomeStatement) => (
    <S.StatementTable>
      <tbody>
        {data.sections.map((section) => {
          if (!section.subtotal && section.lines.length === 0 && section.total === 0) return null;
          const isResult = section.key === "result";
          return [
            <tr key={section.key} className={isResult ? "total" : section.subtotal ? "subtotal" : "section"}>
              <td>{section.label}</td>
              <td>
                <S.Money $negative={!isResult && section.total < 0}>{formatMoney(section.total)}</S.Money>
              </td>
            </tr>,
            ...renderLines(section.lines),
          ];
        })}
      </tbody>
    </S.StatementTable>
  );

  const renderSide = (title: string, groups: { label: string; data: { lines: StatementLine[]; total: number } }[], total: number) => (
    <S.StatementTable>
      <tbody>
        {groups.map((g) => [
          <tr key={g.label} className="section">
            <td>{g.label}</td>
            <td><S.Money>{formatMoney(g.data.total)}</S.Money></td>
          </tr>,
          ...renderLines(g.data.lines),
        ])}
        <tr className="total">
          <td>{title}</td>
          <td>{formatMoney(total)}</td>
        </tr>
      </tbody>
    </S.StatementTable>
  );

  const content = () => {
    if (loading && !current) return <div style={{ padding: 48, textAlign: "center" }}><Spin /></div>;
    if (!current) return <EmptyState title="Clique em Gerar" />;

    if (kind === "trial" && trial) {
      return (
        <>
          <S.Summary>
            <span>
              Débitos <S.Money>{formatMoney(trial.totals.debit)}</S.Money> · Créditos{" "}
              <S.Money>{formatMoney(trial.totals.credit)}</S.Money>
            </span>
            {trial.totals.balanced ? (
              <Text type="success"><CheckCircleOutlined /> Débitos e créditos conferem</Text>
            ) : (
              <Text type="danger"><WarningOutlined /> Débitos e créditos não conferem</Text>
            )}
          </S.Summary>
          <Table
            dataSource={trial.rows}
            columns={trialColumns}
            rowKey="id"
            size="small"
            loading={loading}
            pagination={false}
            scroll={{ x: 900, y: 600 }}
            locale={{ emptyText: <EmptyState title="Sem movimento no período" /> }}
          />
        </>
      );
    }

    if (kind === "income" && income) {
      return (
        <Spin spinning={loading}>
          {renderIncome(income)}
        </Spin>
      );
    }

    if (kind === "balance" && balance) {
      return (
        <Spin spinning={loading}>
          {!balance.balanced && (
            <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Ativo e Passivo + PL não conferem. Verifique os lançamentos." />
          )}
          <S.SheetGrid>
            {renderSide("TOTAL DO ATIVO", [{ label: "ATIVO", data: balance.assets }], balance.assets.total)}
            {renderSide(
              "TOTAL DO PASSIVO + PL",
              [
                { label: "PASSIVO", data: balance.liabilities },
                { label: "PATRIMÔNIO LÍQUIDO", data: balance.equity },
              ],
              balance.liabilitiesAndEquity,
            )}
          </S.SheetGrid>
        </Spin>
      );
    }

    return null;
  };

  return (
    <>
      <S.Toolbar>
        <Segmented<Kind>
          value={kind}
          onChange={setKind}
          options={[
            { value: "income", label: "DRE" },
            { value: "balance", label: "Balanço Patrimonial" },
            { value: "trial", label: "Balancete" },
          ]}
        />
        {kind === "balance" ? (
          <S.Field>
            Posição em
            <DatePicker
              locale={ptBR}
              format={DATE_FORMAT}
              allowClear={false}
              value={date}
              onChange={(value) => value && setDate(value)}
            />
          </S.Field>
        ) : (
          <S.Field>
            Período
            <RangePicker
              locale={ptBR}
              format={DATE_FORMAT}
              allowClear={false}
              value={range}
              onChange={(value) => value?.[0] && value?.[1] && setRange([value[0], value[1]])}
            />
          </S.Field>
        )}
        <S.Actions>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={generate}
            loading={loading}
            style={{ backgroundColor: "#16302A" }}
          >
            Gerar
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={() => handleExport("excel")} disabled={!current} loading={exporting === "excel"}>
            Excel
          </Button>
          <Button icon={<FilePdfOutlined />} onClick={() => handleExport("pdf")} disabled={!current} loading={exporting === "pdf"}>
            PDF
          </Button>
        </S.Actions>
      </S.Toolbar>

      {content()}
    </>
  );
};

export default StatementsTab;
