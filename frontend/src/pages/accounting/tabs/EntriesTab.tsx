import { DeleteOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Table,
  Tag,
  Typography,
} from "antd";
import ptBR from "antd/es/date-picker/locale/pt_BR";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/empty/Empty";
import { openSuccessNotification } from "../../../components/notification/success";
import SelectComponent from "../../../components/selectButton/SelectComponent";
import {
  createEntry,
  deleteEntry,
  listEntries,
} from "../../../service/accounting/integration";
import type { Account, JournalEntry } from "../../../service/accounting/types";
import {
  API_FORMAT,
  DATE_FORMAT,
  accountLabel,
  formatDate,
  formatMoney,
  notifyError,
  postableOptions,
} from "../shared";
import * as S from "../styles";

const { Text } = Typography;
const { RangePicker } = DatePicker;

type Props = {
  clientId: string;
  accounts: Account[];
  refreshKey: number;
  onDataChanged: () => void;
};

type LineForm = { accountId?: string; debit?: number | null; credit?: number | null };
type EntryForm = { date: Dayjs; description: string; lines: LineForm[] };

const toCents = (value?: number | null) => Math.round((value ?? 0) * 100);

const moneyInput = {
  min: 0,
  precision: 2,
  decimalSeparator: ",",
  placeholder: "0,00",
  controls: false,
} as const;

const EntriesTab = ({ clientId, accounts, refreshKey, onDataChanged }: Props) => {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf("month"), dayjs().endOf("month")]);
  const [accountId, setAccountId] = useState<string | undefined>();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<EntryForm>();

  const lines = Form.useWatch("lines", form) as LineForm[] | undefined;
  const totals = useMemo(() => {
    const debit = (lines ?? []).reduce((s, l) => s + toCents(l?.debit), 0);
    const credit = (lines ?? []).reduce((s, l) => s + toCents(l?.credit), 0);
    return { debit: debit / 100, credit: credit / 100, diff: (debit - credit) / 100 };
  }, [lines]);

  const options = useMemo(() => postableOptions(accounts), [accounts]);
  const filterOptions = useMemo(
    () => accounts.filter((a) => a.analytic).map((a) => ({ value: a.id, label: accountLabel(a) })),
    [accounts],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listEntries(clientId, {
        from: range[0].format(API_FORMAT),
        to: range[1].format(API_FORMAT),
        accountId,
      });
      setEntries(response.entries);
      setLockedUntil(response.lockedUntil);
    } catch (e) {
      notifyError("Falha ao carregar os lançamentos", e);
    } finally {
      setLoading(false);
    }
  }, [clientId, range, accountId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const openNew = () => {
    form.resetFields();
    form.setFieldsValue({ date: dayjs(), lines: [{}, {}] });
    setOpen(true);
  };

  const submit = async (values: EntryForm) => {
    if (totals.diff !== 0) return;
    try {
      setSaving(true);
      await createEntry(clientId, {
        date: values.date.format(API_FORMAT),
        description: values.description.trim(),
        lines: values.lines
          .filter((l) => l.accountId && (toCents(l.debit) || toCents(l.credit)))
          .map((l) => ({
            accountId: l.accountId!,
            debit: toCents(l.debit) / 100,
            credit: toCents(l.credit) / 100,
          })),
      });
      setOpen(false);
      openSuccessNotification({ title: "Lançamento criado" });
      await load();
      onDataChanged();
    } catch (e) {
      notifyError("Não foi possível salvar o lançamento", e);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: JournalEntry) => {
    try {
      await deleteEntry(clientId, entry.id);
      openSuccessNotification({
        title: "Lançamento excluído",
        description: entry.source === "BANK" ? "A movimentação do extrato voltou a ficar pendente." : undefined,
      });
      await load();
      onDataChanged();
    } catch (e) {
      notifyError("Não foi possível excluir", e);
    }
  };

  const columns: ColumnsType<JournalEntry> = [
    { title: "Data", dataIndex: "date", key: "date", width: 110, render: (d: string) => formatDate(d) },
    {
      title: "Histórico",
      key: "description",
      render: (_, e) => (
        <span>
          {e.description}{" "}
          {e.source === "BANK" && <Tag color="blue">Extrato</Tag>}
        </span>
      ),
    },
    {
      title: "Contas",
      key: "accounts",
      responsive: ["lg"],
      render: (_, e) => (
        <div style={{ display: "flex", flexDirection: "column", fontSize: 12 }}>
          {e.lines.map((l) => (
            <Text key={l.id} type="secondary">
              {l.debit > 0 ? "D" : "C"} {accountLabel(l.account)}
            </Text>
          ))}
        </div>
      ),
    },
    {
      title: "Valor",
      dataIndex: "total",
      key: "total",
      width: 140,
      align: "right",
      render: (v: number) => <S.Money>{formatMoney(v)}</S.Money>,
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, e) =>
        e.locked ? (
          <Tag>Fechado</Tag>
        ) : (
          <Popconfirm
            title="Excluir o lançamento?"
            description={e.source === "BANK" ? "A movimentação do extrato voltará a ficar pendente." : undefined}
            okText="Excluir"
            cancelText="Cancelar"
            onConfirm={() => remove(e)}
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
    },
  ];

  const periodTotal = entries.reduce((s, e) => s + e.total, 0);

  return (
    <>
      <S.Toolbar>
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
        <S.Field>
          Conta (razão)
          <SelectComponent
            placeholder="Todas as contas"
            options={filterOptions}
            value={accountId}
            onChange={(value) => setAccountId(value ?? undefined)}
          />
        </S.Field>
        <S.Actions>
          <Button type="primary" icon={<PlusOutlined />} onClick={openNew} style={{ backgroundColor: "#16302A" }}>
            Novo lançamento
          </Button>
        </S.Actions>
      </S.Toolbar>

      {lockedUntil && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message={`Período fechado até ${formatDate(lockedUntil)}: lançamentos até essa data não podem ser criados nem excluídos.`}
        />
      )}

      <S.Summary>
        <span>{entries.length} lançamento(s)</span>
        <span>
          Movimento total <S.Money>{formatMoney(periodTotal)}</S.Money>
        </span>
      </S.Summary>

      <Table
        dataSource={entries}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 30, simple: true }}
        scroll={{ x: 760 }}
        expandable={{
          expandedRowRender: (e) => (
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={e.lines}
              columns={[
                { title: "Conta", key: "account", render: (_, l) => accountLabel(l.account) },
                { title: "Débito", key: "debit", align: "right", width: 140, render: (_, l) => (l.debit ? formatMoney(l.debit) : "") },
                { title: "Crédito", key: "credit", align: "right", width: 140, render: (_, l) => (l.credit ? formatMoney(l.credit) : "") },
              ]}
            />
          ),
        }}
        locale={{
          emptyText: (
            <EmptyState
              title="Nenhum lançamento no período"
              description="Concilie o extrato ou crie um lançamento manual."
            />
          ),
        }}
      />

      <Modal
        title="Novo lançamento"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        okButtonProps={{ disabled: totals.diff !== 0 || totals.debit === 0 }}
        confirmLoading={saving}
        width={Math.min(820, window.innerWidth - 32)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <S.Toolbar style={{ marginBottom: 0 }}>
            <Form.Item name="date" label="Data" rules={[{ required: true, message: "Informe a data" }]} style={{ flex: "0 0 180px" }}>
              <DatePicker locale={ptBR} format={DATE_FORMAT} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="description"
              label="Histórico"
              rules={[{ required: true, message: "Informe o histórico" }]}
              style={{ flex: "1 1 300px" }}
            >
              <Input maxLength={255} placeholder="Ex: Pagamento do aluguel de outubro" />
            </Form.Item>
          </S.Toolbar>

          <S.LineGrid>
            <Text type="secondary">Conta</Text>
            <Text type="secondary">Débito</Text>
            <Text type="secondary">Crédito</Text>
            <span />
          </S.LineGrid>

          <Form.List name="lines">
            {(fields, { add, remove: removeLine }) => (
              <>
                {fields.map((field) => (
                  <S.LineGrid key={field.key}>
                    <Form.Item
                      name={[field.name, "accountId"]}
                      rules={[{ required: true, message: "Escolha a conta" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <SelectComponent placeholder="Conta analítica" options={options} />
                    </Form.Item>
                    <Form.Item name={[field.name, "debit"]} style={{ marginBottom: 0 }}>
                      <InputNumber
                        {...moneyInput}
                        onChange={(v) => v && form.setFieldValue(["lines", field.name, "credit"], null)}
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, "credit"]} style={{ marginBottom: 0 }}>
                      <InputNumber
                        {...moneyInput}
                        onChange={(v) => v && form.setFieldValue(["lines", field.name, "debit"], null)}
                      />
                    </Form.Item>
                    <Button
                      type="text"
                      icon={<MinusCircleOutlined />}
                      disabled={fields.length <= 2}
                      onClick={() => removeLine(field.name)}
                    />
                  </S.LineGrid>
                ))}
                <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({})} block style={{ marginTop: 4 }}>
                  Adicionar linha
                </Button>
              </>
            )}
          </Form.List>

          <S.Summary style={{ marginTop: 16, justifyContent: "flex-end" }}>
            <span>
              Débitos <S.Money>{formatMoney(totals.debit)}</S.Money>
            </span>
            <span>
              Créditos <S.Money>{formatMoney(totals.credit)}</S.Money>
            </span>
            <span>
              Diferença{" "}
              <S.Money $negative={totals.diff !== 0} style={{ fontWeight: 600 }}>
                {formatMoney(totals.diff)}
              </S.Money>
            </span>
          </S.Summary>
          {totals.diff !== 0 && (
            <Alert type="warning" showIcon message="Débitos e créditos precisam ser iguais (partidas dobradas)." />
          )}
        </Form>
      </Modal>
    </>
  );
};

export default EntriesTab;
