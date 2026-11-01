import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { Alert, Button, DatePicker, Popconfirm, Segmented, Table, Tag, Typography } from "antd";
import ptBR from "antd/es/date-picker/locale/pt_BR";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { useCallback, useEffect, useState } from "react";
import EmptyState from "../../../components/empty/Empty";
import { openSuccessNotification } from "../../../components/notification/success";
import {
  createClosing,
  listClosings,
  reopenLatestClosing,
} from "../../../service/accounting/integration";
import type {
  Account,
  ClosingType,
  PeriodClosing,
} from "../../../service/accounting/types";
import { formatDate, notifyError } from "../shared";
import * as S from "../styles";

const { Text, Paragraph } = Typography;

type Props = {
  clientId: string;
  accounts: Account[];
  refreshKey: number;
  onDataChanged: () => void;
};

const typeLabels: Record<ClosingType, string> = {
  MONTH: "Mensal",
  QUARTER: "Trimestral",
  YEAR: "Anual",
};

const referenceOf = (type: ClosingType, value: Dayjs) => {
  if (type === "YEAR") return value.format("YYYY");
  if (type === "QUARTER") return `${value.format("YYYY")}-T${Math.floor(value.month() / 3) + 1}`;
  return value.format("YYYY-MM");
};

const describe = (closing: PeriodClosing) => {
  if (closing.type === "YEAR") return `Exercício ${closing.reference}`;
  if (closing.type === "QUARTER") {
    const [year, quarter] = closing.reference.split("-T");
    return `${quarter}º trimestre de ${year}`;
  }
  return dayjs(`${closing.reference}-01`).locale("pt-br").format("MMMM [de] YYYY");
};

const ClosingTab = ({ clientId, refreshKey, onDataChanged }: Props) => {
  const [type, setType] = useState<ClosingType>("MONTH");
  const [period, setPeriod] = useState<Dayjs>(dayjs().subtract(1, "month"));
  const [closings, setClosings] = useState<PeriodClosing[]>([]);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listClosings(clientId);
      setClosings(response.closings);
      setLockedUntil(response.lockedUntil);
    } catch (e) {
      notifyError("Falha ao carregar os fechamentos", e);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const close = async () => {
    try {
      setWorking(true);
      const response = await createClosing(clientId, { type, reference: referenceOf(type, period) });
      setClosings(response.closings);
      setLockedUntil(response.lockedUntil);
      openSuccessNotification({
        title: "Período fechado",
        description: `Lançamentos até ${formatDate(response.lockedUntil)} estão bloqueados.`,
      });
      onDataChanged();
    } catch (e) {
      notifyError("Não foi possível fechar o período", e);
    } finally {
      setWorking(false);
    }
  };

  const reopen = async () => {
    try {
      setWorking(true);
      const response = await reopenLatestClosing(clientId);
      setClosings(response.closings);
      setLockedUntil(response.lockedUntil);
      openSuccessNotification({ title: "Último fechamento reaberto" });
      onDataChanged();
    } catch (e) {
      notifyError("Não foi possível reabrir", e);
    } finally {
      setWorking(false);
    }
  };

  const picker = type === "YEAR" ? "year" : type === "QUARTER" ? "quarter" : "month";
  const pickerFormat = type === "YEAR" ? "YYYY" : type === "QUARTER" ? "YYYY-[T]Q" : "MM/YYYY";

  return (
    <>
      <Paragraph type="secondary" style={{ maxWidth: 760 }}>
        Fechar um período bloqueia a criação, a exclusão e a conciliação de
        lançamentos até a data final dele. Para fechar, todas as movimentações do
        extrato até essa data precisam estar conciliadas ou ignoradas.
      </Paragraph>

      {lockedUntil ? (
        <Alert
          type="success"
          showIcon
          icon={<LockOutlined />}
          style={{ marginBottom: 16 }}
          message={`Contabilidade fechada até ${formatDate(lockedUntil)}`}
        />
      ) : (
        <Alert type="info" showIcon style={{ marginBottom: 16 }} message="Nenhum período fechado ainda" />
      )}

      <S.Toolbar>
        <Segmented<ClosingType>
          value={type}
          onChange={setType}
          options={(Object.keys(typeLabels) as ClosingType[]).map((t) => ({ value: t, label: typeLabels[t] }))}
        />
        <S.Field>
          Período
          <DatePicker
            locale={ptBR}
            picker={picker}
            format={pickerFormat}
            allowClear={false}
            value={period}
            onChange={(value) => value && setPeriod(value)}
          />
        </S.Field>
        <S.Actions>
          <Popconfirm
            title={`Fechar ${referenceOf(type, period)}?`}
            description="Os lançamentos até o fim do período ficarão bloqueados."
            okText="Fechar período"
            cancelText="Cancelar"
            onConfirm={close}
          >
            <Button type="primary" icon={<LockOutlined />} loading={working} style={{ backgroundColor: "#16302A" }}>
              Fechar período
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Reabrir o último fechamento?"
            description="Os lançamentos desse período voltam a poder ser alterados."
            okText="Reabrir"
            cancelText="Cancelar"
            onConfirm={reopen}
            disabled={closings.length === 0}
          >
            <Button icon={<UnlockOutlined />} disabled={closings.length === 0} loading={working}>
              Reabrir último
            </Button>
          </Popconfirm>
        </S.Actions>
      </S.Toolbar>

      <Table
        dataSource={closings}
        rowKey="id"
        size="small"
        loading={loading}
        pagination={false}
        locale={{ emptyText: <EmptyState title="Nenhum fechamento" /> }}
        columns={[
          { title: "Tipo", key: "type", width: 130, render: (_, c) => <Tag>{typeLabels[c.type]}</Tag> },
          { title: "Período", key: "reference", render: (_, c) => <span style={{ textTransform: "capitalize" }}>{describe(c)}</span> },
          {
            title: "De / até",
            key: "range",
            render: (_, c) => (
              <Text type="secondary">
                {formatDate(c.periodStart)} a {formatDate(c.periodEnd)}
              </Text>
            ),
          },
          { title: "Fechado em", key: "createdAt", width: 170, render: (_, c) => dayjs(c.createdAt).format("DD/MM/YYYY HH:mm") },
        ]}
      />
    </>
  );
};

export default ClosingTab;
