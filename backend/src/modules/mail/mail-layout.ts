export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const formatDateBr = (date: string | null) =>
  date ? date.split('-').reverse().join('/') : '-';

export const renderMailLayout = (title: string, body: string) => `
  <div style="font-family:Arial,sans-serif;color:#12231c;max-width:640px;">
    <h2 style="color:#16302a;">${escapeHtml(title)}</h2>
    ${body}
    <p style="color:#6b7a73;font-size:12px;margin-top:24px;">Este é um e-mail automático do sistema Versatti. Não responda.</p>
  </div>`;

export const renderTable = (headers: string[], rows: string[][]) => `
  <table style="border-collapse:collapse;width:100%;font-size:14px;">
    <thead>
      <tr style="background:#f7f9f8;text-align:left;">
        ${headers.map((h) => `<th style="padding:8px;">${escapeHtml(h)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (cells) =>
            `<tr>${cells
              .map(
                (c) =>
                  `<td style="padding:8px;border-bottom:1px solid #eef0ef;">${c}</td>`,
              )
              .join('')}</tr>`,
        )
        .join('')}
    </tbody>
  </table>`;
