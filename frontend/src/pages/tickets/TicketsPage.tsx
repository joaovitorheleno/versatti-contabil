import {
  PaperClipOutlined,
  SearchOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  Upload,
  type UploadFile,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { isAdmin } from "../../common/auth/user-is-admin";
import {
  TicketCategoryEnum,
  TicketPriorityEnum,
  TicketStatusEnum,
  ticketCategoryLabels,
  ticketPriorityConfig,
  ticketStatusConfig,
} from "../../common/enum/ticket.enum";
import SubmitButton from "../../components/button/SubmitButton";
import EmptyState from "../../components/empty/Empty";
import InputComponent from "../../components/input/InputComponent";
import { openErrorNotification } from "../../components/notification/error";
import SelectComponent, {
  type SelectOption,
} from "../../components/selectButton/SelectComponent";
import { maskCnpj } from "../../functions/maskCnpj";
import useTickets from "../../hooks/ticket/useTickets";
import type { TicketSummary } from "../../service/ticket/types";
import * as S from "./styles";

const { Text } = Typography;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILES = ".xml,.pdf,.png,.jpg,.jpeg,.docx,.xlsx";

const categoryOptions: SelectOption[] = Object.values(TicketCategoryEnum).map((c) => ({
  value: c,
  label: ticketCategoryLabels[c],
}));

const priorityOptions: SelectOption[] = Object.values(TicketPriorityEnum).map((p) => ({
  value: p,
  label: ticketPriorityConfig[p].label,
}));

const statusOptions: SelectOption[] = Object.values(TicketStatusEnum).map((s) => ({
  value: s,
  label: ticketStatusConfig[s].label,
}));

const formatDateTime = (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm");

const beforeUpload = (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    openErrorNotification({
      title: "Arquivo muito grande",
      description: "O anexo deve ter no máximo 10 MB.",
    });
    return Upload.LIST_IGNORE;
  }
  return false;
};

type CreateForm = {
  clientId: string;
  category: TicketCategoryEnum;
  priority: TicketPriorityEnum;
  subject: string;
  message: string;
  file?: UploadFile[];
};

const TicketsPage = () => {
  const admin = isAdmin();
  const {
    loading,
    saving,
    tickets,
    clients,
    detail,
    detailLoading,
    open,
    close,
    create,
    reply,
    changeStatus,
    downloadAttachment,
  } = useTickets();

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFile, setReplyFile] = useState<UploadFile[]>([]);
  const [form] = Form.useForm<CreateForm>();

  const clientOptions: SelectOption[] = useMemo(
    () =>
      clients.map((client) => ({
        value: client.id,
        label: `${client.name} - ${maskCnpj(client.cnpj)}`,
      })),
    [clients],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter(
      (t) =>
        (!clientFilter || t.client.id === clientFilter) &&
        (!statusFilter || t.status === statusFilter) &&
        (!term ||
          t.subject.toLowerCase().includes(term) ||
          t.client.name.toLowerCase().includes(term) ||
          String(t.number).includes(term)),
    );
  }, [tickets, search, clientFilter, statusFilter]);

  const columns: ColumnsType<TicketSummary> = [
    {
      title: "Nº",
      dataIndex: "number",
      key: "number",
      width: 70,
      sorter: (a, b) => a.number - b.number,
      render: (n: number) => <Text type="secondary">#{n}</Text>,
    },
    {
      title: "Chamado",
      key: "subject",
      render: (_, record) => (
        <S.CellStack>
          <Text strong>{record.subject}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {ticketCategoryLabels[record.category]} · {record.messageCount} mensagem(ns)
          </Text>
        </S.CellStack>
      ),
    },
    {
      title: "Empresa",
      key: "client",
      render: (_, record) => (
        <S.CellStack>
          <Text>{record.client.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Aberto por {record.openedBy.name}
          </Text>
        </S.CellStack>
      ),
    },
    {
      title: "Prioridade",
      dataIndex: "priority",
      key: "priority",
      render: (p: TicketPriorityEnum) => (
        <Tag color={ticketPriorityConfig[p].color}>{ticketPriorityConfig[p].label}</Tag>
      ),
    },
    {
      title: "Situação",
      dataIndex: "status",
      key: "status",
      render: (s: TicketStatusEnum) => (
        <Tag color={ticketStatusConfig[s].color}>{ticketStatusConfig[s].label}</Tag>
      ),
    },
    {
      title: "Última atualização",
      dataIndex: "lastMessageAt",
      key: "lastMessageAt",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.lastMessageAt.localeCompare(b.lastMessageAt),
      render: (d: string) => <Text type="secondary">{formatDateTime(d)}</Text>,
    },
  ];

  const handleCreate = async (values: CreateForm) => {
    const ok = await create({
      clientId: values.clientId,
      category: values.category,
      priority: values.priority,
      subject: values.subject.trim(),
      message: values.message.trim(),
      file: values.file?.[0]?.originFileObj,
    });
    if (ok) {
      setCreateOpen(false);
      form.resetFields();
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    const ok = await reply(replyText.trim(), replyFile[0]?.originFileObj);
    if (ok) {
      setReplyText("");
      setReplyFile([]);
    }
  };

  const closedForClient = !admin && detail?.status === TicketStatusEnum.FECHADO;

  return (
    <S.Container>
      <Card variant="borderless" style={{ borderRadius: 6, width: "100%" }}>
        <S.HeaderRow>
          <S.Filters>
            <InputComponent
              placeholder="Buscar por assunto, empresa ou número"
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <SelectComponent
              placeholder="Todas as empresas"
              options={clientOptions}
              value={clientFilter}
              onChange={(value) => setClientFilter(value ?? undefined)}
            />
            <SelectComponent
              placeholder="Todas as situações"
              options={statusOptions}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value ?? undefined)}
            />
          </S.Filters>

          <SubmitButton
            htmlType="button"
            type="primary"
            style={{ backgroundColor: "#16302A" }}
            onClick={() => setCreateOpen(true)}
          >
            + Novo Chamado
          </SubmitButton>
        </S.HeaderRow>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, simple: true }}
          scroll={{ x: 900 }}
          showSorterTooltip={false}
          style={{ marginTop: 16 }}
          onRow={(record) => ({ onClick: () => open(record.id), style: { cursor: "pointer" } })}
          locale={{
            emptyText: (
              <EmptyState
                title="Nenhum chamado"
                description='Use "+ Novo Chamado" para pedir um serviço ao escritório, como admissão de funcionário ou emissão de certidão.'
              />
            ),
          }}
        />
      </Card>

      <Drawer
        open={!!detail || detailLoading}
        onClose={close}
        width={620}
        title={detail ? `#${detail.number} ${detail.subject}` : "Carregando..."}
      >
        {detailLoading && !detail ? (
          <Spin />
        ) : (
          detail && (
            <>
              <S.DrawerMeta>
                <span>{detail.client.name}</span>·
                <span>{ticketCategoryLabels[detail.category]}</span>
                <Tag color={ticketPriorityConfig[detail.priority].color}>
                  {ticketPriorityConfig[detail.priority].label}
                </Tag>
                {admin ? (
                  <Select
                    size="small"
                    value={detail.status}
                    options={statusOptions}
                    style={{ minWidth: 170 }}
                    disabled={saving}
                    onChange={(status) => changeStatus(status)}
                  />
                ) : (
                  <Tag color={ticketStatusConfig[detail.status].color}>
                    {ticketStatusConfig[detail.status].label}
                  </Tag>
                )}
                {!admin && detail.status !== TicketStatusEnum.FECHADO && (
                  <Button
                    size="small"
                    onClick={() =>
                      Modal.confirm({
                        title: "Encerrar chamado",
                        content: "Confirma que o pedido foi atendido? O chamado será fechado.",
                        okText: "Encerrar",
                        cancelText: "Voltar",
                        onOk: () => changeStatus(TicketStatusEnum.FECHADO),
                      })
                    }
                  >
                    Encerrar chamado
                  </Button>
                )}
              </S.DrawerMeta>

              <S.Thread>
                {detail.messages.map((m) => (
                  <S.Bubble key={m.id} $office={m.fromOffice}>
                    <div className="bubble-author">
                      {m.fromOffice ? `${m.author.name} · Escritório` : m.author.name}
                    </div>
                    <div className="bubble-body">{m.body}</div>
                    {m.file && (
                      <Button
                        type="link"
                        size="small"
                        icon={<PaperClipOutlined />}
                        style={{ paddingLeft: 0 }}
                        onClick={() => downloadAttachment(m)}
                      >
                        {m.file.name}
                      </Button>
                    )}
                    <div className="bubble-time">{formatDateTime(m.createdAt)}</div>
                  </S.Bubble>
                ))}
              </S.Thread>

              {closedForClient ? (
                <Text type="secondary">
                  Este chamado está fechado. Para um novo pedido, abra outro chamado.
                </Text>
              ) : (
                <S.ReplyBox>
                  <Input.TextArea
                    placeholder="Escreva uma resposta"
                    autoSize={{ minRows: 3, maxRows: 8 }}
                    maxLength={5000}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <S.ReplyActions>
                    <Upload
                      accept={ACCEPTED_FILES}
                      beforeUpload={beforeUpload}
                      maxCount={1}
                      fileList={replyFile}
                      onChange={({ fileList }) => setReplyFile(fileList.slice(-1))}
                    >
                      <Button icon={<UploadOutlined />}>Anexar</Button>
                    </Upload>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={saving}
                      disabled={!replyText.trim()}
                      onClick={handleReply}
                      style={{ backgroundColor: "#16302A" }}
                    >
                      Enviar
                    </Button>
                  </S.ReplyActions>
                </S.ReplyBox>
              )}
            </>
          )
        )}
      </Drawer>

      <Modal
        title="Novo chamado"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="Abrir chamado"
        confirmLoading={saving}
        okButtonProps={{ style: { backgroundColor: "#16302A" } }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ priority: TicketPriorityEnum.NORMAL }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="clientId"
            label="Empresa"
            rules={[{ required: true, message: "Selecione a empresa" }]}
          >
            <SelectComponent placeholder="Selecione a empresa" options={clientOptions} />
          </Form.Item>
          <Form.Item
            name="category"
            label="Assunto do pedido"
            rules={[{ required: true, message: "Selecione a categoria" }]}
          >
            <SelectComponent placeholder="Selecione" options={categoryOptions} />
          </Form.Item>
          <Form.Item name="priority" label="Prioridade">
            <SelectComponent options={priorityOptions} allowClear={false} />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Título"
            rules={[
              { required: true, message: "Informe um título" },
              { max: 200, message: "Máximo de 200 caracteres" },
            ]}
          >
            <Input placeholder="Ex: Admissão do vendedor João Silva" />
          </Form.Item>
          <Form.Item
            name="message"
            label="Descreva o pedido"
            rules={[{ required: true, message: "Descreva o pedido" }]}
          >
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={5000} />
          </Form.Item>
          <Form.Item
            name="file"
            label="Anexo (opcional)"
            valuePropName="fileList"
            getValueFromEvent={(e: { fileList: UploadFile[] }) => e?.fileList?.slice(-1)}
          >
            <Upload accept={ACCEPTED_FILES} beforeUpload={beforeUpload} maxCount={1}>
              <Button icon={<UploadOutlined />}>Selecionar arquivo</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </S.Container>
  );
};

export default TicketsPage;
