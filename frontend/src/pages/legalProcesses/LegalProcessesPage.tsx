import {
  CheckCircleFilled,
  ClockCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Drawer,
  Form,
  Input,
  Modal,
  Progress,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { isAdmin } from "../../common/auth/user-is-admin";
import {
  LegalProcessStatusEnum,
  LegalProcessTypeEnum,
  legalProcessStatusConfig,
  legalProcessTypeLabels,
} from "../../common/enum/legal-process.enum";
import SubmitButton from "../../components/button/SubmitButton";
import DateComponent from "../../components/date/DateComponent";
import EmptyState from "../../components/empty/Empty";
import InputComponent from "../../components/input/InputComponent";
import SelectComponent, {
  type SelectOption,
} from "../../components/selectButton/SelectComponent";
import { maskCnpj } from "../../functions/maskCnpj";
import useLegalProcesses from "../../hooks/legalProcess/useLegalProcesses";
import type { LegalProcess } from "../../service/legalProcess/types";
import * as S from "./styles";

const { Text, Paragraph } = Typography;

const formatDate = (date: string | null) =>
  date ? dayjs(date).format("DD/MM/YYYY") : "-";

const typeOptions: SelectOption[] = Object.values(LegalProcessTypeEnum).map((type) => ({
  value: type,
  label: legalProcessTypeLabels[type],
}));

const statusOptions: SelectOption[] = Object.values(LegalProcessStatusEnum).map(
  (status) => ({ value: status, label: legalProcessStatusConfig[status].label }),
);

type CreateForm = {
  clientId: string;
  type: LegalProcessTypeEnum;
  title: string;
  description?: string;
  expectedEndDate?: Dayjs;
};

const StatusTag = ({ status }: { status: LegalProcessStatusEnum }) => (
  <Tag color={legalProcessStatusConfig[status].color}>
    {legalProcessStatusConfig[status].label}
  </Tag>
);

const LegalProcessesPage = () => {
  const admin = isAdmin();
  const {
    loading,
    saving,
    processes,
    clients,
    selected,
    select,
    create,
    update,
    toggleStep,
    saveStepNotes,
    addStep,
    remove,
  } = useLegalProcesses();

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [newStep, setNewStep] = useState("");
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
    return processes.filter(
      (p) =>
        (!clientFilter || p.client.id === clientFilter) &&
        (!statusFilter || p.status === statusFilter) &&
        (!term ||
          p.title.toLowerCase().includes(term) ||
          p.client.name.toLowerCase().includes(term)),
    );
  }, [processes, search, clientFilter, statusFilter]);

  const columns: ColumnsType<LegalProcess> = [
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
      title: "Processo",
      key: "title",
      render: (_, record) => (
        <S.CellStack>
          <Text>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {legalProcessTypeLabels[record.type]}
          </Text>
        </S.CellStack>
      ),
    },
    {
      title: "Progresso",
      key: "progress",
      width: 200,
      render: (_, record) => (
        <div>
          <Progress
            percent={
              record.progress.total
                ? Math.round((record.progress.done / record.progress.total) * 100)
                : 0
            }
            size="small"
            strokeColor="#16302a"
            showInfo={false}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.progress.done} de {record.progress.total} etapas
          </Text>
        </div>
      ),
    },
    {
      title: "Situação",
      dataIndex: "status",
      key: "status",
      render: (status: LegalProcessStatusEnum) => <StatusTag status={status} />,
    },
    {
      title: "Previsão",
      dataIndex: "expectedEndDate",
      key: "expectedEndDate",
      sorter: (a, b) =>
        (a.expectedEndDate ?? "9999").localeCompare(b.expectedEndDate ?? "9999"),
      render: (date: string | null, record) =>
        record.status === LegalProcessStatusEnum.CONCLUIDO ? (
          <Text type="secondary">Concluído em {formatDate(record.finishedAt)}</Text>
        ) : (
          formatDate(date)
        ),
    },
    {
      title: "",
      key: "action",
      width: 100,
      align: "right",
      render: (_, record) => (
        <Button type="link" onClick={() => select(record.id)}>
          Ver etapas
        </Button>
      ),
    },
  ];

  const handleCreate = async (values: CreateForm) => {
    const ok = await create({
      clientId: values.clientId,
      type: values.type,
      title: values.title,
      description: values.description,
      expectedEndDate: values.expectedEndDate?.format("YYYY-MM-DD"),
    });
    if (ok) {
      setCreateOpen(false);
      form.resetFields();
    }
  };

  const handleAddStep = async () => {
    if (!selected || !newStep.trim()) return;
    const updated = await addStep(selected.id, newStep.trim());
    if (updated) setNewStep("");
  };

  const confirmRemove = (process: LegalProcess) =>
    Modal.confirm({
      title: "Excluir processo",
      content: `Excluir o processo "${process.title}" de ${process.client.name}?`,
      okText: "Sim, excluir",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => remove(process.id),
    });

  return (
    <S.Container>
      <Card variant="borderless" style={{ borderRadius: 6, width: "100%" }}>
        <S.HeaderRow>
          <S.Filters>
            <InputComponent
              placeholder="Buscar por processo ou empresa"
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

          {admin && (
            <SubmitButton
              htmlType="button"
              type="primary"
              style={{ backgroundColor: "#16302A" }}
              onClick={() => setCreateOpen(true)}
            >
              + Novo Processo
            </SubmitButton>
          )}
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
          onRow={(record) => ({ onDoubleClick: () => select(record.id) })}
          locale={{
            emptyText: (
              <EmptyState
                title="Nenhum processo encontrado"
                description={
                  admin
                    ? 'Clique em "+ Novo Processo" para acompanhar uma abertura, alteração ou baixa.'
                    : "Quando o escritório iniciar um processo para sua empresa, ele aparece aqui."
                }
              />
            ),
          }}
        />
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => select(null)}
        width={560}
        title={selected?.title}
        extra={
          admin && selected ? (
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => confirmRemove(selected)}
            />
          ) : null
        }
      >
        {selected && (
          <>
            <S.DetailMeta>
              <div>
                <span>Empresa</span>
                {selected.client.name}
              </div>
              <div>
                <span>Tipo</span>
                {legalProcessTypeLabels[selected.type]}
              </div>
              <div>
                <span>Situação</span>
                {admin ? (
                  <Select
                    value={selected.status}
                    options={statusOptions}
                    style={{ width: "100%" }}
                    disabled={saving}
                    onChange={(status) => update(selected.id, { status })}
                  />
                ) : (
                  <StatusTag status={selected.status} />
                )}
              </div>
              <div>
                <span>Previsão de conclusão</span>
                {admin ? (
                  <DateComponent
                    value={selected.expectedEndDate ? dayjs(selected.expectedEndDate) : null}
                    style={{ width: "100%" }}
                    onChange={(date) =>
                      update(selected.id, {
                        expectedEndDate: date ? dayjs(date as Dayjs).format("YYYY-MM-DD") : undefined,
                      })
                    }
                  />
                ) : (
                  formatDate(selected.expectedEndDate)
                )}
              </div>
            </S.DetailMeta>

            {selected.description && (
              <Paragraph type="secondary" style={{ whiteSpace: "pre-wrap" }}>
                {selected.description}
              </Paragraph>
            )}

            <Progress
              percent={
                selected.progress.total
                  ? Math.round((selected.progress.done / selected.progress.total) * 100)
                  : 0
              }
              strokeColor="#16302a"
              style={{ marginBottom: 12 }}
            />

            <S.StepList>
              {selected.steps.map((step) => (
                <S.StepItem key={step.id} $done={step.done}>
                  <div className="step-head">
                    {admin ? (
                      <Checkbox
                        checked={step.done}
                        disabled={saving}
                        onChange={(e) => toggleStep(selected.id, step.id, e.target.checked)}
                      />
                    ) : step.done ? (
                      <CheckCircleFilled style={{ color: "#0ca30c", marginTop: 3 }} />
                    ) : (
                      <ClockCircleOutlined style={{ color: "#6b7a73", marginTop: 3 }} />
                    )}
                    <span className="step-name">{step.name}</span>
                    {step.done && (
                      <span className="step-date">Concluída em {formatDate(step.doneAt)}</span>
                    )}
                  </div>

                  {admin ? (
                    <Input.TextArea
                      key={`${step.id}-${step.notes ?? ""}`}
                      defaultValue={step.notes ?? ""}
                      placeholder="Observação (opcional, aparece para o cliente)"
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      variant="borderless"
                      style={{ marginTop: 4, marginLeft: 18, fontSize: 12 }}
                      onBlur={(e) => {
                        if ((e.target.value ?? "") !== (step.notes ?? "")) {
                          saveStepNotes(selected.id, step.id, e.target.value);
                        }
                      }}
                    />
                  ) : (
                    step.notes && <p className="step-notes">{step.notes}</p>
                  )}
                </S.StepItem>
              ))}
            </S.StepList>

            {admin && (
              <S.AddStepRow>
                <Input
                  placeholder="Nova etapa"
                  value={newStep}
                  maxLength={255}
                  onChange={(e) => setNewStep(e.target.value)}
                  onPressEnter={handleAddStep}
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleAddStep}
                  loading={saving}
                  disabled={!newStep.trim()}
                >
                  Adicionar
                </Button>
              </S.AddStepRow>
            )}

            {admin && (
              <Text type="secondary" style={{ display: "block", marginTop: 16, fontSize: 12 }}>
                Ao marcar uma etapa, o responsável da empresa recebe um e-mail com o andamento.
              </Text>
            )}
          </>
        )}
      </Drawer>

      <Modal
        title="Novo processo"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="Criar processo"
        confirmLoading={saving}
        okButtonProps={{ style: { backgroundColor: "#16302A" } }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item
            name="clientId"
            label="Empresa"
            rules={[{ required: true, message: "Selecione a empresa" }]}
          >
            <SelectComponent placeholder="Selecione a empresa" options={clientOptions} />
          </Form.Item>
          <Form.Item
            name="type"
            label="Tipo de processo"
            rules={[{ required: true, message: "Selecione o tipo" }]}
            extra="As etapas padrão do tipo são criadas automaticamente; dá para adicionar outras depois."
          >
            <SelectComponent placeholder="Selecione o tipo" options={typeOptions} />
          </Form.Item>
          <Form.Item
            name="title"
            label="Título"
            rules={[
              { required: true, message: "Informe o título" },
              { max: 255, message: "Máximo de 255 caracteres" },
            ]}
          >
            <Input placeholder="Ex: Inclusão de sócio" />
          </Form.Item>
          <Form.Item name="expectedEndDate" label="Previsão de conclusão">
            <DateComponent style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} />
          </Form.Item>
        </Form>
      </Modal>
    </S.Container>
  );
};

export default LegalProcessesPage;
