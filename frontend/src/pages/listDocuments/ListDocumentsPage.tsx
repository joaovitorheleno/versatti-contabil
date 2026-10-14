import {
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  MoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Table,
  Tag,
  Tooltip,
  Typography,
  type MenuProps,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { isAdmin } from "../../common/auth/user-is-admin";
import { documentCategoryLabels } from "../../common/enum/document-category.enum";
import SubmitButton from "../../components/button/SubmitButton";
import EmptyState from "../../components/empty/Empty";
import InputComponent from "../../components/input/InputComponent";
import SelectComponent, {
  type SelectOption,
} from "../../components/selectButton/SelectComponent";
import { maskCnpj } from "../../functions/maskCnpj";
import useListDocuments from "../../hooks/documents/useListDocuments";
import type { DocumentListItem } from "../../service/documents/types";
import * as S from "./styles";

const { Text } = Typography;

type DocumentStatus = "EXPIRED" | "EXPIRING" | "VALID" | "NO_EXPIRATION";

const statusConfig: Record<DocumentStatus, { label: string; color: string }> = {
  EXPIRED: { label: "Vencido", color: "red" },
  EXPIRING: { label: "Vence em breve", color: "orange" },
  VALID: { label: "Válido", color: "green" },
  NO_EXPIRATION: { label: "Sem vencimento", color: "default" },
};

const getDocumentStatus = (document: DocumentListItem): DocumentStatus => {
  if (!document.expirationDate) return "NO_EXPIRATION";

  const today = dayjs().startOf("day");
  const expiration = dayjs(document.expirationDate);

  if (expiration.isBefore(today)) return "EXPIRED";

  const alertDays = document.alertDays ?? 0;
  if (expiration.diff(today, "day") <= alertDays) return "EXPIRING";

  return "VALID";
};

const formatDate = (date: string | null) =>
  date ? dayjs(date).format("DD/MM/YYYY") : "-";

const ListDocumentsPage = () => {
  const {
    loading,
    documents,
    clients,
    clientId,
    setClientId,
    fileLoadingId,
    openFile,
    registerDocument,
  } = useListDocuments();

  const [search, setSearch] = useState("");

  const admin = isAdmin();

  const clientOptions: SelectOption[] = useMemo(
    () =>
      clients.map((client) => ({
        label: `${client.name} - ${maskCnpj(client.cnpj)}`,
        value: client.id,
      })),
    [clients],
  );

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return documents;

    return documents.filter(
      (document) =>
        document.title.toLowerCase().includes(term) ||
        document.documentType.name.toLowerCase().includes(term) ||
        (document.number ?? "").toLowerCase().includes(term) ||
        document.client.name.toLowerCase().includes(term),
    );
  }, [documents, search]);

  const getActionMenuItems = (
    record: DocumentListItem,
  ): MenuProps["items"] =>
    // Nota fiscal em XML: quem baixa escolhe entre o PDF (DANFE) e o XML original
    record.isXml
      ? [
          {
            key: "view-pdf",
            label: (
              <>
                <EyeOutlined /> Visualizar PDF
              </>
            ),
            onClick: () => openFile(record, { format: "pdf" }),
          },
          { type: "divider" },
          {
            key: "download-pdf",
            label: (
              <>
                <FilePdfOutlined /> Baixar PDF
              </>
            ),
            onClick: () => openFile(record, { format: "pdf", download: true }),
          },
          {
            key: "download-xml",
            label: (
              <>
                <FileTextOutlined /> Baixar XML
              </>
            ),
            onClick: () => openFile(record, { format: "xml", download: true }),
          },
        ]
      : [
          {
            key: "view",
            label: (
              <>
                <EyeOutlined /> Visualizar
              </>
            ),
            onClick: () => openFile(record),
          },
          {
            key: "download",
            label: (
              <>
                <DownloadOutlined /> Baixar
              </>
            ),
            onClick: () => openFile(record, { download: true }),
          },
        ];

  const columns: ColumnsType<DocumentListItem> = [
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
    {
      title: "Documento",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (_, record) => (
        <S.CellStack>
          <Text>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.documentType.name}
            {record.number ? ` · ${record.number}` : ""}
          </Text>
        </S.CellStack>
      ),
    },
    {
      title: "Categoria",
      key: "category",
      filters: Object.entries(documentCategoryLabels).map(([value, text]) => ({
        text,
        value,
      })),
      onFilter: (value, record) => record.documentType.category === value,
      render: (_, record) => (
        <Tag>
          {documentCategoryLabels[record.documentType.category] ??
            record.documentType.category}
        </Tag>
      ),
    },
    {
      title: "Emissão",
      dataIndex: "issueDate",
      key: "issueDate",
      sorter: (a, b) => (a.issueDate ?? "").localeCompare(b.issueDate ?? ""),
      render: (date: string | null) => (
        <Text type="secondary">{formatDate(date)}</Text>
      ),
    },
    {
      title: "Vencimento",
      dataIndex: "expirationDate",
      key: "expirationDate",
      sorter: (a, b) =>
        (a.expirationDate ?? "9999").localeCompare(b.expirationDate ?? "9999"),
      render: (date: string | null) => <Text>{formatDate(date)}</Text>,
    },
    {
      title: "Status",
      key: "status",
      filters: Object.entries(statusConfig).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value, record) => getDocumentStatus(record) === value,
      render: (_, record) => {
        const status = statusConfig[getDocumentStatus(record)];
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    ...(admin
      ? ([
          {
            title: "Visível ao cliente",
            dataIndex: "visibleToClient",
            key: "visibleToClient",
            align: "center",
            render: (visible: boolean) =>
              visible ? <Tag color="green">Sim</Tag> : <Tag>Não</Tag>,
          },
        ] as ColumnsType<DocumentListItem>)
      : []),
    {
      title: "Enviado em",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (date: string) => (
        <Text type="secondary">{dayjs(date).format("DD/MM/YYYY")}</Text>
      ),
    },
    {
      title: "Ação",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) =>
        record.hasFile ? (
          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button
              type="text"
              loading={fileLoadingId === record.id}
              icon={<MoreOutlined style={{ fontSize: 18 }} />}
            />
          </Dropdown>
        ) : (
          <Tooltip title="Documento sem arquivo anexado">
            <Button
              type="text"
              disabled
              icon={<MoreOutlined style={{ fontSize: 18 }} />}
            />
          </Tooltip>
        ),
    },
  ];

  return (
    <S.ListDocumentsContainer>
      <Card
        variant="borderless"
        style={{ borderRadius: 6, width: "100%", overflow: "hidden" }}
      >
        <S.HeaderRow>
          <S.FiltersWrapper>
            <InputComponent
              placeholder="Buscar por título, tipo, número ou empresa"
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              allowClear
              style={{ borderRadius: 4, width: "100%" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <SelectComponent
              placeholder="Todas as empresas"
              options={clientOptions}
              value={clientId}
              onChange={(value) => setClientId(value ?? undefined)}
            />
          </S.FiltersWrapper>

          <SubmitButton
            htmlType="button"
            type="primary"
            style={{ backgroundColor: "#16302A" }}
            onClick={registerDocument}
          >
            + Enviar Documento
          </SubmitButton>
        </S.HeaderRow>

        <Table
          dataSource={filteredDocuments}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, simple: true }}
          scroll={{ x: 900 }}
          showSorterTooltip={false}
          style={{ marginTop: 16, width: "100%" }}
          locale={{
            emptyText: (
              <EmptyState
                title={
                  search || clientId
                    ? "Nenhum documento encontrado com esses filtros"
                    : "Nenhum documento enviado"
                }
                description={
                  search || clientId
                    ? "Tente outra busca ou selecione outra empresa."
                    : undefined
                }
              />
            ),
          }}
        />
      </Card>
    </S.ListDocumentsContainer>
  );
};

export default ListDocumentsPage;
