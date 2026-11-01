import {
  CheckOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  UndoOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Segmented,
  Select,
  Table,
  Tag,
  Typography,
  Upload,
} from "antd";
import ptBR from "antd/es/date-picker/locale/pt_BR";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../../components/empty/Empty";
import { openErrorNotification } from "../../../components/notification/error";
import { openSuccessNotification } from "../../../components/notification/success";
import SelectComponent from "../../../components/selectButton/SelectComponent";
import {
  autoReconcile,
  createRule,
  deleteEntry,
  deleteRule,
  importStatement,
  listRules,
  listTransactions,
  reconcileTransactions,
  updateTransactionStatus,
} from "../../../service/accounting/integration";
import type {
  Account,
  BankTransaction,
  BankTransactionStatus,
  ReconcileResult,
  ReconciliationRule,
  RuleDirection,
} from "../../../service/accounting/types";
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

type StatusFilter = BankTransactionStatus | "ALL";

const statusTag: Record<BankTransactionStatus, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "orange" },
  RECONCILED: { label: "Conciliada", color: "green" },
  IGNORED: { label: "Ignorada", color: "default" },
};

const directionLabels: Record<RuleDirection, string> = {
  ANY: "Entradas e saídas",
  IN: "Só entradas",
  OUT: "Só saídas",
};

const BankTab = ({ clientId, accounts, refreshKey, onDataChanged }: Props) => {
  const [status, setStatus] = useState<StatusFilter>("PENDING");
  const [bankAccountId, setBankAccountId] = useState<string | undefined>();
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [rows, setRows] = useState<BankTransaction[]>([]);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [working, setWorking] = useState(false);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rules, setRules] = useState<ReconciliationRule[]>([]);
  const [ruleForm] = Form.useForm<{ keyword: string; direction: RuleDirection; accountId: string }>();

  const bankOptions = useMemo(
    () => postableOptions(accounts, (a) => a.type === "ASSET" && a.code.startsWith("1.1.01")),
    [accounts],
  );
  const allAssetOptions = useMemo(
    () => postableOptions(accounts, (a) => a.type === "ASSET"),
    [accounts],
  );
  const counterpartOptions = useMemo(() => postableOptions(accounts), [accounts]);

  const [importAccountId, setImportAccountId] = useState<string | undefined>(
    () => bankOptions.find((o) => String(o.label).includes("Bancos"))?.value as string | undefined,
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listTransactions(clientId, {
        status: status === "ALL" ? undefined : status,
        bankAccountId,
        from: range?.[0]?.format(API_FORMAT),
        to: range?.[1]?.format(API_FORMAT),
      });
      setRows(response.transactions);
      setLockedUntil(response.lockedUntil);
      setChoices((prev) => {
        const next: Record<string, string> = {};
        response.transactions.forEach((tx) => {
          const value = prev[tx.id] ?? tx.suggestedAccount?.id;
          if (value) next[tx.id] = value;
        });
        return next;
      });
      setSelected([]);
    } catch (e) {
      notifyError("Falha ao carregar o extrato", e);
    } finally {
      setLoading(false);
    }
  }, [clientId, status, bankAccountId, range]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const loadRules = useCallback(async () => {
    try {
      setRules(await listRules(clientId));
    } catch (e) {
      notifyError("Falha ao carregar as regras", e);
    }
  }, [clientId]);

  const reportReconcile = (result: ReconcileResult) => {
    if (result.reconciled > 0) {
      openSuccessNotification({
        title: `${result.reconciled} movimentação(ões) conciliada(s)`,
        description: "Os lançamentos contábeis foram gerados.",
      });
    }
    if (result.failed.length > 0) {
      openErrorNotification({
        title: `${result.failed.length} não conciliada(s)`,
        description: result.failed
          .slice(0, 5)
          .map((f) => `${f.description}: ${f.reason}`)
          .join(" | "),
      });
    }
    if (result.reconciled === 0 && result.failed.length === 0) {
      openErrorNotification({
        title: "Nada para conciliar",
        description: "Nenhuma pendente casou com as regras. Crie regras ou escolha a contrapartida manualmente.",
      });
    }
  };

  const upload = async (file: File) => {
    if (!importAccountId) {
      openErrorNotification({
        title: "Escolha a conta do banco",
        description: "Selecione em qual conta do plano o extrato será lançado.",
      });
      return;
    }
    try {
      setUploading(true);
      const result = await importStatement(clientId, importAccountId, file);
      openSuccessNotification({
        title: `${result.imported} movimentação(ões) importada(s)`,
        description: [
          `${result.format} de ${formatDate(result.periodStart)} a ${formatDate(result.periodEnd)}.`,
          result.duplicates ? `${result.duplicates} já existiam e foram ignoradas.` : "",
          result.suggested ? `${result.suggested} com contrapartida sugerida pelas regras.` : "",
        ]
          .filter(Boolean)
          .join(" "),
      });
      setStatus("PENDING");
      await load();
    } catch (e) {
      notifyError("Falha ao importar o extrato", e);
    } finally {
      setUploading(false);
    }
  };

  const reconcile = async (ids: string[]) => {
    const items = ids
      .map((id) => ({ transactionId: id, accountId: choices[id] }))
      .filter((item) => item.accountId);
    if (items.length < ids.length) {
      openErrorNotification({
        title: "Escolha a contrapartida",
        description: "Selecione a conta de contrapartida de cada movimentação.",
      });
      return;
    }
    try {
      setWorking(true);
      reportReconcile(await reconcileTransactions(clientId, items));
      await load();
      onDataChanged();
    } catch (e) {
      notifyError("Falha ao conciliar", e);
    } finally {
      setWorking(false);
    }
  };

  const runAuto = async () => {
    try {
      setWorking(true);
      reportReconcile(await autoReconcile(clientId));
      await load();
      onDataChanged();
    } catch (e) {
      notifyError("Falha na conciliação automática", e);
    } finally {
      setWorking(false);
    }
  };

  const setTxStatus = async (tx: BankTransaction, next: "PENDING" | "IGNORED") => {
    try {
      await updateTransactionStatus(clientId, tx.id, next);
      await load();
    } catch (e) {
      notifyError("Não foi possível alterar a movimentação", e);
    }
  };

  const undo = async (tx: BankTransaction) => {
    if (!tx.journalEntryId) return;
    try {
      await deleteEntry(clientId, tx.journalEntryId);
      openSuccessNotification({ title: "Conciliação desfeita", description: "O lançamento foi excluído." });
      await load();
      onDataChanged();
    } catch (e) {
      notifyError("Não foi possível desfazer", e);
    }
  };

  const openRules = (tx?: BankTransaction) => {
    ruleForm.resetFields();
    if (tx) {
      ruleForm.setFieldsValue({
        keyword: tx.description.split(/\s+-\s+|\s{2,}/)[0].slice(0, 40),
        direction: tx.amount > 0 ? "IN" : "OUT",
        accountId: choices[tx.id],
      });
    } else {
      ruleForm.setFieldsValue({ direction: "ANY" });
    }
    setRulesOpen(true);
    loadRules();
  };

  const submitRule = async (values: { keyword: string; direction: RuleDirection; accountId: string }) => {
    try {
      await createRule(clientId, values);
      ruleForm.resetFields();
      ruleForm.setFieldsValue({ direction: "ANY" });
      await loadRules();
      await load();
      openSuccessNotification({ title: "Regra criada", description: "As pendentes foram reavaliadas." });
    } catch (e) {
      notifyError("Não foi possível criar a regra", e);
    }
  };

  const removeRule = async (rule: ReconciliationRule) => {
    try {
      await deleteRule(clientId, rule.id);
      await loadRules();
      await load();
    } catch (e) {
      notifyError("Não foi possível excluir a regra", e);
    }
  };

  const pending = rows.filter((r) => r.status === "PENDING");
  const suggestedCount = pending.filter((r) => r.suggestedAccount).length;
  const inflow = rows.reduce((s, r) => s + (r.amount > 0 ? r.amount : 0), 0);
  const outflow = rows.reduce((s, r) => s + (r.amount < 0 ? r.amount : 0), 0);
  const multipleBanks = new Set(rows.map((r) => r.bankAccount.id)).size > 1;

  const columns: ColumnsType<BankTransaction> = [
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      width: 110,
      render: (date: string) => formatDate(date),
    },
    {
      title: "Descrição",
      key: "description",
      render: (_, tx) => (
        <S.Summary style={{ flexDirection: "column", gap: 2, margin: 0, color: "inherit" }}>
          <span>{tx.description}</span>
          {multipleBanks && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {accountLabel(tx.bankAccount)}
            </Text>
          )}
        </S.Summary>
      ),
    },
    {
      title: "Valor",
      dataIndex: "amount",
      key: "amount",
      width: 140,
      align: "right",
      render: (amount: number) => (
        <S.Money $negative={amount < 0} style={{ color: amount > 0 ? "#1f8a5b" : undefined }}>
          {formatMoney(amount)}
        </S.Money>
      ),
    },
    {
      title: "Contrapartida",
      key: "counterpart",
      width: 340,
      render: (_, tx) => {
        if (tx.status === "RECONCILED") {
          return tx.counterpart ? accountLabel(tx.counterpart) : <Text type="secondary">-</Text>;
        }
        if (tx.status === "IGNORED") return <Tag>{statusTag.IGNORED.label}</Tag>;
        return (
          <SelectComponent
            size="small"
            placeholder="Escolha a conta"
            options={counterpartOptions.filter((o) => o.value !== tx.bankAccount.id)}
            value={choices[tx.id]}
            disabled={tx.locked}
            onChange={(value) =>
              setChoices((prev) => {
                const next = { ...prev };
                if (value) next[tx.id] = value;
                else delete next[tx.id];
                return next;
              })
            }
            popupMatchSelectWidth={420}
          />
        );
      },
    },
    {
      title: "",
      key: "actions",
      width: 150,
      render: (_, tx) => {
        if (tx.locked) return <Tag>Período fechado</Tag>;
        if (tx.status === "PENDING") {
          return (
            <span style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                disabled={!choices[tx.id]}
                loading={working}
                onClick={() => reconcile([tx.id])}
                style={{ backgroundColor: choices[tx.id] ? "#16302A" : undefined }}
                title="Conciliar"
              />
              <Button size="small" icon={<ThunderboltOutlined />} title="Criar regra a partir desta movimentação" onClick={() => openRules(tx)} />
              <Button size="small" type="text" onClick={() => setTxStatus(tx, "IGNORED")}>
                Ignorar
              </Button>
            </span>
          );
        }
        if (tx.status === "IGNORED") {
          return (
            <Button size="small" type="text" onClick={() => setTxStatus(tx, "PENDING")}>
              Voltar a pendente
            </Button>
          );
        }
        return (
          <Popconfirm
            title="Desfazer a conciliação?"
            description="O lançamento contábil gerado será excluído."
            okText="Desfazer"
            cancelText="Cancelar"
            onConfirm={() => undo(tx)}
          >
            <Button size="small" type="text" icon={<UndoOutlined />}>
              Desfazer
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <>
      <S.Toolbar>
        <S.Field>
          Conta do banco para importar
          <SelectComponent
            placeholder="Ex: 1.1.01.002 Bancos Conta Movimento"
            options={bankOptions.length ? bankOptions : allAssetOptions}
            value={importAccountId}
            onChange={(value) => setImportAccountId(value ?? undefined)}
          />
        </S.Field>
        <S.Actions>
          <Upload
            accept=".ofx,.csv,.txt"
            showUploadList={false}
            beforeUpload={(file) => {
              upload(file);
              return false;
            }}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
              style={{ backgroundColor: "#16302A" }}
            >
              Importar extrato (OFX ou CSV)
            </Button>
          </Upload>
          <Button icon={<ThunderboltOutlined />} onClick={() => openRules()}>
            Regras
          </Button>
        </S.Actions>
      </S.Toolbar>

      <S.Toolbar>
        <Segmented<StatusFilter>
          value={status}
          onChange={setStatus}
          options={[
            { value: "PENDING", label: "Pendentes" },
            { value: "RECONCILED", label: "Conciliadas" },
            { value: "IGNORED", label: "Ignoradas" },
            { value: "ALL", label: "Todas" },
          ]}
        />
        <S.Field>
          Período
          <RangePicker
            locale={ptBR}
            format={DATE_FORMAT}
            value={range}
            onChange={(value) => setRange(value as [Dayjs | null, Dayjs | null] | null)}
          />
        </S.Field>
        <S.Field>
          Banco
          <SelectComponent
            placeholder="Todos"
            options={allAssetOptions}
            value={bankAccountId}
            onChange={(value) => setBankAccountId(value ?? undefined)}
          />
        </S.Field>
      </S.Toolbar>

      {lockedUntil && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message={`Período fechado até ${formatDate(lockedUntil)}: movimentações até essa data não podem ser alteradas.`}
        />
      )}

      <S.Toolbar style={{ alignItems: "center" }}>
        <S.Summary style={{ margin: 0 }}>
          <span>{rows.length} movimentação(ões)</span>
          <span>
            Entradas <S.Money style={{ color: "#1f8a5b" }}>{formatMoney(inflow)}</S.Money>
          </span>
          <span>
            Saídas <S.Money $negative>{formatMoney(outflow)}</S.Money>
          </span>
        </S.Summary>
        <S.Actions>
          {selected.length > 0 && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={working}
              onClick={() => reconcile(selected)}
              style={{ backgroundColor: "#16302A" }}
            >
              Conciliar selecionadas ({selected.length})
            </Button>
          )}
          {status !== "RECONCILED" && status !== "IGNORED" && (
            <Button icon={<ThunderboltOutlined />} loading={working} onClick={runAuto} disabled={suggestedCount === 0}>
              Conciliar sugeridas pelas regras ({suggestedCount})
            </Button>
          )}
        </S.Actions>
      </S.Toolbar>

      <Table
        dataSource={rows}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 50, simple: true }}
        scroll={{ x: 960 }}
        rowSelection={
          status === "PENDING"
            ? {
                selectedRowKeys: selected,
                onChange: (keys) => setSelected(keys as string[]),
                getCheckboxProps: (tx) => ({ disabled: tx.locked || tx.status !== "PENDING" }),
              }
            : undefined
        }
        locale={{
          emptyText: (
            <EmptyState
              title={status === "PENDING" ? "Nenhuma movimentação pendente" : "Nenhuma movimentação"}
              description="Importe o extrato OFX ou CSV do banco para começar a conciliação."
            />
          ),
        }}
      />

      <Drawer
        title="Regras de conciliação"
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        width={Math.min(560, window.innerWidth)}
        destroyOnHidden
      >
        <Text type="secondary">
          Quando a descrição do extrato contém o texto, a conta é sugerida como
          contrapartida. Ex: "TARIFA" → 4.3.01.001 Tarifas Bancárias.
        </Text>

        <Form
          form={ruleForm}
          layout="vertical"
          onFinish={submitRule}
          style={{ marginTop: 16 }}
          initialValues={{ direction: "ANY" }}
        >
          <Form.Item
            name="keyword"
            label="Texto no extrato"
            rules={[{ required: true, message: "Informe o texto" }]}
          >
            <Input placeholder="Ex: TARIFA, PIX RECEBIDO, ALUGUEL" maxLength={100} />
          </Form.Item>
          <Form.Item name="direction" label="Aplicar em">
            <Select
              options={(Object.keys(directionLabels) as RuleDirection[]).map((d) => ({
                value: d,
                label: directionLabels[d],
              }))}
            />
          </Form.Item>
          <Form.Item
            name="accountId"
            label="Conta de contrapartida"
            rules={[{ required: true, message: "Escolha a conta" }]}
          >
            <SelectComponent placeholder="Escolha a conta" options={counterpartOptions} />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ backgroundColor: "#16302A" }}>
            Criar regra
          </Button>
        </Form>

        <Table
          style={{ marginTop: 24 }}
          dataSource={rules}
          rowKey="id"
          size="small"
          pagination={false}
          locale={{ emptyText: "Nenhuma regra ainda" }}
          columns={[
            {
              title: "Texto",
              key: "keyword",
              render: (_, r) => (
                <S.Summary style={{ flexDirection: "column", gap: 0, margin: 0, color: "inherit" }}>
                  <strong>{r.keyword}</strong>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {directionLabels[r.direction]}
                  </Text>
                </S.Summary>
              ),
            },
            { title: "Conta", key: "account", render: (_, r) => accountLabel(r.account) },
            {
              title: "",
              key: "remove",
              width: 40,
              render: (_, r) => (
                <Popconfirm title="Excluir a regra?" okText="Excluir" cancelText="Cancelar" onConfirm={() => removeRule(r)}>
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
};

export default BankTab;
