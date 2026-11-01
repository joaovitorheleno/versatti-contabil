import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import EmptyState from "../../../components/empty/Empty";
import { openSuccessNotification } from "../../../components/notification/success";
import {
  createAccount,
  createDefaultChart,
  deleteAccount,
  updateAccount,
} from "../../../service/accounting/integration";
import type { Account, AccountType } from "../../../service/accounting/types";
import { accountTypeLabels, notifyError } from "../shared";
import * as S from "../styles";

const { Text } = Typography;

type Props = {
  clientId: string;
  accounts: Account[];
  loading: boolean;
  reloadAccounts: () => Promise<void>;
};

type AccountForm = { code: string; name: string; type?: AccountType };

const typeColors: Record<AccountType, string> = {
  ASSET: "blue",
  LIABILITY: "orange",
  EQUITY: "purple",
  REVENUE: "green",
  EXPENSE: "red",
};

const ChartTab = ({ clientId, accounts, loading, reloadAccounts }: Props) => {
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [form] = Form.useForm<AccountForm>();
  const [editForm] = Form.useForm<{ name: string }>();

  const code = Form.useWatch("code", form) as string | undefined;
  const parent = useMemo(() => {
    if (!code?.includes(".")) return null;
    const parentCode = code.slice(0, code.lastIndexOf("."));
    return accounts.find((a) => a.code === parentCode) ?? null;
  }, [code, accounts]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter(
      (a) => a.code.startsWith(term) || a.name.toLowerCase().includes(term),
    );
  }, [accounts, search]);

  const seed = async () => {
    try {
      setSeeding(true);
      await createDefaultChart(clientId);
      await reloadAccounts();
      openSuccessNotification({ title: "Plano de contas padrão criado" });
    } catch (e) {
      notifyError("Não foi possível criar o plano padrão", e);
    } finally {
      setSeeding(false);
    }
  };

  const suggestNextCode = (account: Account) => {
    const children = accounts
      .filter((a) => a.code.startsWith(`${account.code}.`) && a.level === account.level + 1)
      .map((a) => Number(a.code.split(".").pop()));
    const next = (children.length ? Math.max(...children) : 0) + 1;
    const width = account.level >= 3 ? 3 : 2;
    return `${account.code}.${String(next).padStart(width, "0")}`;
  };

  const openCreate = (base?: Account) => {
    form.resetFields();
    if (base) form.setFieldsValue({ code: suggestNextCode(base) });
    setCreating(true);
  };

  const submitCreate = async (values: AccountForm) => {
    try {
      setSaving(true);
      await createAccount(clientId, {
        code: values.code.trim(),
        name: values.name.trim(),
        type: parent ? undefined : values.type,
      });
      await reloadAccounts();
      setCreating(false);
      openSuccessNotification({ title: `Conta ${values.code} criada` });
    } catch (e) {
      notifyError("Não foi possível criar a conta", e);
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (values: { name: string }) => {
    if (!editing) return;
    try {
      setSaving(true);
      await updateAccount(clientId, editing.id, { name: values.name.trim() });
      await reloadAccounts();
      setEditing(null);
    } catch (e) {
      notifyError("Não foi possível renomear a conta", e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (account: Account, active: boolean) => {
    try {
      await updateAccount(clientId, account.id, { active });
      await reloadAccounts();
    } catch (e) {
      notifyError("Não foi possível alterar a conta", e);
    }
  };

  const remove = async (account: Account) => {
    try {
      await deleteAccount(clientId, account.id);
      await reloadAccounts();
      openSuccessNotification({ title: `Conta ${account.code} excluída` });
    } catch (e) {
      notifyError("Não foi possível excluir a conta", e);
    }
  };

  const columns: ColumnsType<Account> = [
    {
      title: "Conta",
      key: "account",
      render: (_, a) => (
        <span
          style={{
            paddingLeft: (a.level - 1) * 18,
            fontWeight: a.analytic ? 400 : 600,
            opacity: a.active ? 1 : 0.5,
          }}
        >
          <Text type="secondary" style={{ marginRight: 8 }}>
            {a.code}
          </Text>
          {a.name}
        </span>
      ),
    },
    {
      title: "Tipo",
      key: "type",
      width: 160,
      responsive: ["md"],
      render: (_, a) => <Tag color={typeColors[a.type]}>{accountTypeLabels[a.type]}</Tag>,
    },
    {
      title: "Natureza",
      key: "analytic",
      width: 120,
      responsive: ["md"],
      render: (_, a) => (
        <Text type="secondary">{a.analytic ? "Analítica" : "Sintética"}</Text>
      ),
    },
    {
      title: "Ativa",
      key: "active",
      width: 80,
      render: (_, a) => (
        <Switch size="small" checked={a.active} onChange={(v) => toggleActive(a, v)} />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 130,
      render: (_, a) => (
        <span style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            title="Criar subconta"
            disabled={a.analytic && a.hasEntries}
            onClick={() => openCreate(a)}
          />
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            title="Renomear"
            onClick={() => {
              editForm.setFieldsValue({ name: a.name });
              setEditing(a);
            }}
          />
          <Popconfirm
            title={`Excluir a conta ${a.code}?`}
            okText="Excluir"
            cancelText="Cancelar"
            onConfirm={() => remove(a)}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Excluir"
              disabled={a.hasEntries}
            />
          </Popconfirm>
        </span>
      ),
    },
  ];

  const modals = (
    <>
      <Modal
        title="Nova conta"
        open={creating}
        onCancel={() => setCreating(false)}
        onOk={() => form.submit()}
        okText="Criar"
        cancelText="Cancelar"
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={submitCreate}>
          <Form.Item
            name="code"
            label="Código"
            rules={[
              { required: true, message: "Informe o código" },
              { pattern: /^\d+(\.\d+)*$/, message: "Use números separados por ponto" },
            ]}
            extra={
              parent
                ? `Subconta de ${parent.code} - ${parent.name} (${accountTypeLabels[parent.type]})`
                : code?.includes(".")
                  ? "A conta superior não existe: crie-a antes."
                  : "Conta de primeiro nível: escolha o tipo."
            }
          >
            <Input placeholder="Ex: 4.2.02.011" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: "Informe o nome" }]}
          >
            <Input placeholder="Ex: Publicidade e Propaganda" maxLength={150} />
          </Form.Item>
          {!parent && (
            <Form.Item
              name="type"
              label="Tipo"
              rules={[{ required: true, message: "Escolha o tipo" }]}
            >
              <Select
                options={(Object.keys(accountTypeLabels) as AccountType[]).map((t) => ({
                  value: t,
                  label: accountTypeLabels[t],
                }))}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={editing ? `Renomear ${editing.code}` : ""}
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={() => editForm.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" onFinish={submitEdit}>
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: "Informe o nome" }]}
          >
            <Input maxLength={150} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );

  if (!loading && accounts.length === 0) {
    return (
      <>
        <EmptyState
          title="Esta empresa ainda não tem plano de contas"
          description="Crie o plano padrão (Ativo, Passivo, PL, Receitas e Despesas) e ajuste depois, ou crie as contas manualmente."
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            type="primary"
            loading={seeding}
            onClick={seed}
            style={{ backgroundColor: "#16302A" }}
          >
            Criar plano padrão
          </Button>
          <Button onClick={() => openCreate()}>Criar conta manualmente</Button>
        </div>
        {modals}
      </>
    );
  }

  return (
    <>
      <S.Toolbar>
        <S.Field>
          Buscar
          <Input
            allowClear
            placeholder="Código ou nome da conta"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </S.Field>
        <S.Actions>
          <Button icon={<ReloadOutlined />} onClick={reloadAccounts} loading={loading}>
            Atualizar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openCreate()}
            style={{ backgroundColor: "#16302A" }}
          >
            Nova conta
          </Button>
        </S.Actions>
      </S.Toolbar>

      <S.Summary>
        <span>{accounts.length} conta(s)</span>
        <span>Somente contas analíticas e ativas recebem lançamentos.</span>
      </S.Summary>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={false}
        scroll={{ y: 560 }}
      />

      {modals}
    </>
  );
};

export default ChartTab;
