import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, DatePicker, Table, Tabs, Tag, Typography } from "antd";
import ptBR from "antd/es/date-picker/locale/pt_BR";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { isAdmin } from "../../common/auth/user-is-admin";
import {
  DocumentCategoryEnum,
  documentCategoryLabels,
} from "../../common/enum/document-category.enum";
import EmptyState from "../../components/empty/Empty";
import { openErrorNotification } from "../../components/notification/error";
import SelectComponent, {
  type SelectOption,
} from "../../components/selectButton/SelectComponent";
import {
  exportToExcel,
  exportToPdf,
  type ExportOptions,
} from "../../functions/exportReport";
import { maskCnpj } from "../../functions/maskCnpj";
import useReport from "../../hooks/reports/useReport";
import { listClients, listUserClients } from "../../service/client/integration";
import type { ClientsResponse } from "../../service/client/types";
import {
  getComplianceReport,
  getExpirationReport,
  getUploadReport,
} from "../../service/reports/integration";
import type {
  ComplianceReport,
  ComplianceStatus,
  DocumentStatus,
  ExpirationReportRow,
  ReportFilters,
  UploadReportRow,
} from "../../service/reports/types";
import * as S from "./styles";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const DATE_FORMAT = "DD/MM/YYYY";
const API_FORMAT = "YYYY-MM-DD";

// Status sempre com ícone + rótulo, nunca só cor
const statusConfig: Record<
  DocumentStatus | ComplianceStatus,
  { label: string; color: string; icon: ReactNode }
> = {
  EXPIRED: { label: "Vencido", color: "red", icon: <CloseCircleOutlined /> },
  EXPIRING: {
    label: "Vence em breve",
    color: "orange",
    icon: <ExclamationCircleOutlined />,
  },
  VALID: { label: "Em dia", color: "green", icon: <CheckCircleOutlined /> },
  NO_EXPIRATION: {
    label: "Sem vencimento",
    color: "default",
    icon: <MinusCircleOutlined />,
  },
  MISSING: {
    label: "Faltando",
    color: "default",
    icon: <QuestionCircleOutlined />,
  },
};

const StatusTag = ({ status }: { status: DocumentStatus | ComplianceStatus }) => (
  <Tag color={statusConfig[status].color} icon={statusConfig[status].icon}>
    {statusConfig[status].label}
  </Tag>
);

const formatDate = (date: string | null) =>
  date ? dayjs(date).format(DATE_FORMAT) : "-";

const categoryOptions: SelectOption[] = Object.values(DocumentCategoryEnum).map(
  (category) => ({ label: documentCategoryLabels[category], value: category }),
);

const describeFilters = (filters: ReportFilters, clients: ClientsResponse[]) => {
  const parts: string[] = [];
  if (filters.from && filters.to) {
    parts.push(`${formatDate(filters.from)} a ${formatDate(filters.to)}`);
  }
  const client = clients.find((c) => c.id === filters.clientId);
  parts.push(client ? client.name : "Todas as empresas");
  if (filters.category) parts.push(documentCategoryLabels[filters.category]);
  return parts.join(" · ");
};

// ---------- barra de filtros compartilhada ----------

type FiltersBarProps = {
  filters: ReportFilters;
  onChange: (partial: Partial<ReportFilters>) => void;
  onGenerate: () => void;
  onExport: (format: "excel" | "pdf") => void;
  loading: boolean;
  canExport: boolean;
  clientOptions: SelectOption[];
  showPeriod: boolean;
  periodLabel?: string;
};

const FiltersBar = ({
  filters,
  onChange,
  onGenerate,
  onExport,
  loading,
  canExport,
  clientOptions,
  showPeriod,
  periodLabel = "Período",
}: FiltersBarProps) => {
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  const handleExport = async (format: "excel" | "pdf") => {
    setExporting(format);
    try {
      await onExport(format);
    } finally {
      setExporting(null);
    }
  };

  return (
    <S.FiltersBar>
      {showPeriod && (
        <S.FilterField>
          {periodLabel}
          <RangePicker
            locale={ptBR}
            format={DATE_FORMAT}
            allowClear={false}
            value={[
              filters.from ? dayjs(filters.from) : null,
              filters.to ? dayjs(filters.to) : null,
            ]}
            onChange={(range) =>
              onChange({
                from: (range?.[0] as Dayjs | null)?.format(API_FORMAT),
                to: (range?.[1] as Dayjs | null)?.format(API_FORMAT),
              })
            }
          />
        </S.FilterField>
      )}

      <S.FilterField>
        Empresa
        <SelectComponent
          placeholder="Todas as empresas"
          options={clientOptions}
          value={filters.clientId}
          onChange={(value) => onChange({ clientId: value ?? undefined })}
        />
      </S.FilterField>

      <S.FilterField>
        Categoria
        <SelectComponent
          placeholder="Todas as categorias"
          options={categoryOptions}
          value={filters.category}
          onChange={(value) => onChange({ category: value ?? undefined })}
        />
      </S.FilterField>

      <S.FilterActions>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={onGenerate}
          loading={loading}
          style={{ backgroundColor: "#16302A" }}
        >
          Gerar
        </Button>
        <Button
          icon={<FileExcelOutlined />}
          onClick={() => handleExport("excel")}
          disabled={!canExport}
          loading={exporting === "excel"}
        >
          Excel
        </Button>
        <Button
          icon={<FilePdfOutlined />}
          onClick={() => handleExport("pdf")}
          disabled={!canExport}
          loading={exporting === "pdf"}
        >
          PDF
        </Button>
      </S.FilterActions>
    </S.FiltersBar>
  );
};

const runExport = async <T,>(
  format: "excel" | "pdf",
  options: ExportOptions<T>,
) => {
  try {
    if (format === "excel") await exportToExcel(options);
    else await exportToPdf(options);
  } catch (e: any) {
    openErrorNotification({
      title: "Falha ao exportar",
      description: e?.message || String(e),
    });
  }
};

// ---------- 1. Vencimentos por período ----------

const ExpirationsReport = ({
  clients,
  clientOptions,
}: {
  clients: ClientsResponse[];
  clientOptions: SelectOption[];
}) => {
  const { filters, updateFilters, data, loading, generate } = useReport(
    getExpirationReport,
    {
      from: dayjs().format(API_FORMAT),
      to: dayjs().add(90, "day").format(API_FORMAT),
    },
  );

  const rows = data ?? [];

  const columns: ColumnsType<ExpirationReportRow> = [
    {
      title: "Vencimento",
      dataIndex: "expirationDate",
      key: "expirationDate",
      sorter: (a, b) => a.expirationDate.localeCompare(b.expirationDate),
      render: (date: string, record) => (
        <S.CellStack>
          <Text strong>{formatDate(date)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.daysLeft < 0
              ? `há ${Math.abs(record.daysLeft)} dia(s)`
              : record.daysLeft === 0
                ? "hoje"
                : `em ${record.daysLeft} dia(s)`}
          </Text>
        </S.CellStack>
      ),
    },
    {
      title: "Empresa",
      key: "client",
      sorter: (a, b) => a.client.name.localeCompare(b.client.name),
      render: (_, record) => (
        <S.CellStack>
          <Text>{record.client.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {maskCnpj(record.client.cnpj)}
          </Text>
        </S.CellStack>
      ),
    },
    {
      title: "Documento",
      key: "title",
      render: (_, record) => (
        <S.CellStack>
          <Text>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.documentType}
            {record.number ? ` · ${record.number}` : ""}
          </Text>
        </S.CellStack>
      ),
    },
    {
      title: "Categoria",
      key: "category",
      render: (_, record) => <Tag>{documentCategoryLabels[record.category]}</Tag>,
    },
    {
      title: "Situação",
      dataIndex: "status",
      key: "status",
      render: (status: DocumentStatus) => <StatusTag status={status} />,
    },
  ];

  const handleExport = (format: "excel" | "pdf") =>
    runExport(format, {
      fileName: `vencimentos_${filters.from}_${filters.to}`,
      title: "Relatório de vencimentos",
      subtitle: describeFilters(filters, clients),
      rows,
      columns: [
        { header: "Vencimento", value: (r) => formatDate(r.expirationDate), width: 14 },
        { header: "Dias", value: (r) => r.daysLeft, width: 8 },
        { header: "Empresa", value: (r) => r.client.name, width: 36 },
        { header: "CNPJ", value: (r) => maskCnpj(r.client.cnpj), width: 20 },
        { header: "Documento", value: (r) => r.title, width: 36 },
        { header: "Tipo", value: (r) => r.documentType, width: 26 },
        { header: "Número", value: (r) => r.number ?? "", width: 18 },
        { header: "Categoria", value: (r) => documentCategoryLabels[r.category], width: 18 },
        { header: "Situação", value: (r) => statusConfig[r.status].label, width: 16 },
      ],
    });

  const count = (status: DocumentStatus) =>
    rows.filter((row) => row.status === status).length;

  return (
    <>
      <FiltersBar
        filters={filters}
        onChange={updateFilters}
        onGenerate={generate}
        onExport={handleExport}
        loading={loading}
        canExport={rows.length > 0}
        clientOptions={clientOptions}
        showPeriod
        periodLabel="Vencimento entre"
      />

      {data && (
        <S.SummaryRow>
          <span>{rows.length} documento(s) no período</span>
          {(["EXPIRED", "EXPIRING"] as DocumentStatus[])
            .filter((status) => count(status) > 0)
            .map((status) => (
              <Tag
                key={status}
                color={statusConfig[status].color}
                icon={statusConfig[status].icon}
              >
                {count(status)} {statusConfig[status].label.toLowerCase()}
              </Tag>
            ))}
        </S.SummaryRow>
      )}

      <Table
        dataSource={rows}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, simple: true }}
        scroll={{ x: 900 }}
        showSorterTooltip={false}
        locale={{
          emptyText: (
            <EmptyState
              title="Nenhum documento vence neste período"
              description="Ajuste o período ou os filtros e clique em Gerar."
            />
          ),
        }}
      />
    </>
  );
};

// ---------- 2. Situação documental por empresa ----------

type ComplianceRow = ComplianceReport["clients"][number];

const ComplianceReportTab = ({
  clients,
  clientOptions,
}: {
  clients: ClientsResponse[];
  clientOptions: SelectOption[];
}) => {
  const { filters, updateFilters, data, loading, generate } = useReport(
    getComplianceReport,
    {},
  );

  const rows = data?.clients ?? [];

  const columns: ColumnsType<ComplianceRow> = [
    {
      title: "Empresa",
      key: "client",
      sorter: (a, b) => a.client.name.localeCompare(b.client.name),
      render: (_, record) => (
        <S.CellStack>
          <Text strong>{record.client.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {maskCnpj(record.client.cnpj)}
          </Text>
        </S.CellStack>
      ),
    },
    ...(["VALID", "EXPIRING", "EXPIRED", "MISSING"] as ComplianceStatus[]).map(
      (status) => {
        const field = {
          VALID: "valid",
          EXPIRING: "expiring",
          EXPIRED: "expired",
          MISSING: "missing",
        }[status] as "valid" | "expiring" | "expired" | "missing";

        return {
          title: statusConfig[status].label,
          dataIndex: field,
          key: field,
          align: "center" as const,
          sorter: (a: ComplianceRow, b: ComplianceRow) => a[field] - b[field],
          render: (value: number) =>
            value > 0 && status !== "VALID" ? (
              <Tag color={statusConfig[status].color} icon={statusConfig[status].icon}>
                {value}
              </Tag>
            ) : (
              <Text type={value > 0 ? undefined : "secondary"}>{value}</Text>
            ),
        };
      },
    ),
  ];

  const handleExport = (format: "excel" | "pdf") =>
    runExport(format, {
      fileName: `situacao_documental_${dayjs().format(API_FORMAT)}`,
      title: "Situação documental por empresa",
      subtitle: describeFilters(filters, clients),
      rows: rows.flatMap((row) =>
        row.items.map((item) => ({ client: row.client, ...item })),
      ),
      columns: [
        { header: "Empresa", value: (r) => r.client.name, width: 36 },
        { header: "CNPJ", value: (r) => maskCnpj(r.client.cnpj), width: 20 },
        { header: "Tipo de documento", value: (r) => r.documentType, width: 30 },
        { header: "Categoria", value: (r) => documentCategoryLabels[r.category], width: 18 },
        { header: "Situação", value: (r) => statusConfig[r.status].label, width: 16 },
        { header: "Vencimento", value: (r) => formatDate(r.expirationDate), width: 14 },
        { header: "Documento", value: (r) => r.documentTitle ?? "", width: 36 },
      ],
    });

  return (
    <>
      <FiltersBar
        filters={filters}
        onChange={updateFilters}
        onGenerate={generate}
        onExport={handleExport}
        loading={loading}
        canExport={rows.length > 0}
        clientOptions={clientOptions}
        showPeriod={false}
      />

      {data && (
        <S.SummaryRow>
          <span>
            Checklist dos {data.types.length} tipo(s) que exigem vencimento.
            Clique em uma empresa para ver o detalhe.
          </span>
        </S.SummaryRow>
      )}

      <Table
        dataSource={rows}
        columns={columns}
        rowKey={(record) => record.client.id}
        loading={loading}
        pagination={{ pageSize: 15, simple: true }}
        scroll={{ x: 700 }}
        showSorterTooltip={false}
        expandable={{
          expandRowByClick: true,
          expandedRowRender: (record) => (
            <S.ChecklistGrid>
              {record.items.map((item) => (
                <S.ChecklistItem key={item.documentType}>
                  <div>
                    {item.documentType}
                    <small>
                      {item.expirationDate
                        ? `Vence em ${formatDate(item.expirationDate)}`
                        : "Nenhum documento enviado"}
                    </small>
                  </div>
                  <StatusTag status={item.status} />
                </S.ChecklistItem>
              ))}
            </S.ChecklistGrid>
          ),
        }}
        locale={{
          emptyText: (
            <EmptyState
              title={
                data?.types.length === 0
                  ? "Nenhum tipo de documento exige vencimento"
                  : "Nenhuma empresa encontrada"
              }
              description={
                data?.types.length === 0
                  ? 'Em Tipos de Documento, ative "Exige vencimento" nos tipos que devem entrar no checklist.'
                  : undefined
              }
            />
          ),
        }}
      />
    </>
  );
};

// ---------- 3. Documentos enviados ----------

const UploadsReport = ({
  clients,
  clientOptions,
}: {
  clients: ClientsResponse[];
  clientOptions: SelectOption[];
}) => {
  const { filters, updateFilters, data, loading, generate } = useReport(
    getUploadReport,
    {
      from: dayjs().startOf("month").format(API_FORMAT),
      to: dayjs().format(API_FORMAT),
    },
  );

  const rows = data ?? [];

  const uploaderLabel = (row: UploadReportRow) =>
    row.uploadedBy
      ? `${row.uploadedBy} (${row.uploadedByOffice ? "Escritório" : "Cliente"})`
      : "-";

  const columns: ColumnsType<UploadReportRow> = [
    {
      title: "Enviado em",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Empresa",
      key: "client",
      sorter: (a, b) => a.client.name.localeCompare(b.client.name),
      render: (_, record) => (
        <S.CellStack>
          <Text>{record.client.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {maskCnpj(record.client.cnpj)}
          </Text>
        </S.CellStack>
      ),
    },
    {
      title: "Documento",
      key: "title",
      render: (_, record) => (
        <S.CellStack>
          <Text>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.documentType}
          </Text>
        </S.CellStack>
      ),
    },
    {
      title: "Enviado por",
      key: "uploadedBy",
      render: (_, record) =>
        record.uploadedBy ? (
          <S.CellStack>
            <Text>{record.uploadedBy}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.uploadedByOffice ? "Escritório" : "Cliente"}
            </Text>
          </S.CellStack>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    ...(isAdmin()
      ? [
          {
            title: "Visível ao cliente",
            dataIndex: "visibleToClient",
            key: "visibleToClient",
            align: "center" as const,
            render: (visible: boolean) =>
              visible ? <Tag color="green">Sim</Tag> : <Tag>Não</Tag>,
          },
        ]
      : []),
  ];

  const handleExport = (format: "excel" | "pdf") =>
    runExport(format, {
      fileName: `envios_${filters.from}_${filters.to}`,
      title: "Relatório de documentos enviados",
      subtitle: describeFilters(filters, clients),
      rows,
      columns: [
        { header: "Enviado em", value: (r) => dayjs(r.createdAt).format("DD/MM/YYYY HH:mm"), width: 18 },
        { header: "Empresa", value: (r) => r.client.name, width: 36 },
        { header: "CNPJ", value: (r) => maskCnpj(r.client.cnpj), width: 20 },
        { header: "Documento", value: (r) => r.title, width: 36 },
        { header: "Tipo", value: (r) => r.documentType, width: 26 },
        { header: "Arquivo", value: (r) => r.fileName ?? "", width: 30 },
        { header: "Enviado por", value: uploaderLabel, width: 30 },
      ],
    });

  return (
    <>
      <FiltersBar
        filters={filters}
        onChange={updateFilters}
        onGenerate={generate}
        onExport={handleExport}
        loading={loading}
        canExport={rows.length > 0}
        clientOptions={clientOptions}
        showPeriod
        periodLabel="Enviados entre"
      />

      {data && (
        <S.SummaryRow>
          <span>{rows.length} documento(s) enviados no período</span>
        </S.SummaryRow>
      )}

      <Table
        dataSource={rows}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, simple: true }}
        scroll={{ x: 900 }}
        showSorterTooltip={false}
        locale={{
          emptyText: (
            <EmptyState
              title="Nenhum documento enviado neste período"
              description="Ajuste o período ou os filtros e clique em Gerar."
            />
          ),
        }}
      />
    </>
  );
};

// ---------- página ----------

const ReportsPage = () => {
  const [clients, setClients] = useState<ClientsResponse[]>([]);

  useEffect(() => {
    (isAdmin() ? listClients() : listUserClients())
      .then(setClients)
      .catch((e) =>
        openErrorNotification({
          title: "Falha ao carregar empresas",
          description: e?.message || String(e),
        }),
      );
  }, []);

  const clientOptions: SelectOption[] = useMemo(
    () =>
      clients.map((client) => ({
        label: `${client.name} - ${maskCnpj(client.cnpj)}`,
        value: client.id,
      })),
    [clients],
  );

  const tabProps = { clients, clientOptions };

  return (
    <S.ReportsContainer>
      <div>
        <S.PageTitle>Relatórios</S.PageTitle>
        <S.PageSubtitle>
          Consulte e exporte em Excel ou PDF
        </S.PageSubtitle>
      </div>

      <Card variant="borderless" style={{ borderRadius: 6, width: "100%" }}>
        <Tabs
          destroyOnHidden={false}
          items={[
            {
              key: "expirations",
              label: "Vencimentos por período",
              children: <ExpirationsReport {...tabProps} />,
            },
            {
              key: "compliance",
              label: "Situação por empresa",
              children: <ComplianceReportTab {...tabProps} />,
            },
            {
              key: "uploads",
              label: "Documentos enviados",
              children: <UploadsReport {...tabProps} />,
            },
          ]}
        />
      </Card>
    </S.ReportsContainer>
  );
};

export default ReportsPage;
