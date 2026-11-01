import { Card, Spin, Tabs } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/empty/Empty";
import SelectComponent, {
  type SelectOption,
} from "../../components/selectButton/SelectComponent";
import { maskCnpj } from "../../functions/maskCnpj";
import { listAccounts } from "../../service/accounting/integration";
import type { Account } from "../../service/accounting/types";
import { listClients } from "../../service/client/integration";
import type { ClientsResponse } from "../../service/client/types";
import { notifyError } from "./shared";
import * as S from "./styles";
import BankTab from "./tabs/BankTab";
import ChartTab from "./tabs/ChartTab";
import ClosingTab from "./tabs/ClosingTab";
import EntriesTab from "./tabs/EntriesTab";
import StatementsTab from "./tabs/StatementsTab";

const CLIENT_KEY = "@versatti:accounting-client";

const readStoredClient = () => {
  try {
    return localStorage.getItem(CLIENT_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

const storeClient = (clientId: string) => {
  try {
    localStorage.setItem(CLIENT_KEY, clientId);
  } catch {
    return;
  }
};

type LoadedChart = { clientId: string; accounts: Account[] };

const AccountingPage = () => {
  const [clients, setClients] = useState<ClientsResponse[]>([]);
  const [clientId, setClientId] = useState<string | undefined>(readStoredClient);
  const [chart, setChart] = useState<LoadedChart | null>(null);
  const [reloading, setReloading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("bank");

  useEffect(() => {
    listClients()
      .then((list) => {
        setClients(list);
        setClientId((current) =>
          current && list.some((c) => c.id === current) ? current : undefined,
        );
      })
      .catch((e) => notifyError("Falha ao carregar empresas", e));
  }, []);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    listAccounts(clientId)
      .catch((e) => {
        notifyError("Falha ao carregar o plano de contas", e);
        return [] as Account[];
      })
      .then((accounts) => {
        if (!cancelled) setChart({ clientId, accounts });
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const reloadAccounts = useCallback(async () => {
    if (!clientId) return;
    try {
      setReloading(true);
      setChart({ clientId, accounts: await listAccounts(clientId) });
    } catch (e) {
      notifyError("Falha ao carregar o plano de contas", e);
    } finally {
      setReloading(false);
    }
  }, [clientId]);

  const clientOptions: SelectOption[] = useMemo(
    () =>
      clients.map((client) => ({
        label: `${client.name} - ${maskCnpj(client.cnpj)}`,
        value: client.id,
      })),
    [clients],
  );

  const loaded = !!clientId && chart?.clientId === clientId;
  const accounts = loaded ? chart.accounts : [];
  const hasChart = accounts.length > 0;

  const tabProps = {
    clientId: clientId!,
    accounts,
    refreshKey,
    onDataChanged: () => setRefreshKey((k) => k + 1),
  };

  const content = () => {
    if (!clientId) {
      return (
        <EmptyState
          title="Selecione uma empresa"
          description="A contabilidade é separada por empresa."
        />
      );
    }

    if (!loaded) {
      return (
        <div style={{ padding: 48, textAlign: "center" }}>
          <Spin />
        </div>
      );
    }

    return (
      <Tabs
        key={clientId}
        destroyOnHidden
        activeKey={hasChart ? activeTab : "chart"}
        onChange={setActiveTab}
        items={[
          {
            key: "bank",
            label: "Extratos e conciliação",
            disabled: !hasChart,
            children: <BankTab {...tabProps} />,
          },
          {
            key: "entries",
            label: "Lançamentos",
            disabled: !hasChart,
            children: <EntriesTab {...tabProps} />,
          },
          {
            key: "statements",
            label: "Demonstrações",
            disabled: !hasChart,
            children: <StatementsTab {...tabProps} />,
          },
          {
            key: "closing",
            label: "Fechamento",
            disabled: !hasChart,
            children: <ClosingTab {...tabProps} />,
          },
          {
            key: "chart",
            label: "Plano de contas",
            children: (
              <ChartTab
                clientId={clientId}
                accounts={accounts}
                loading={reloading}
                reloadAccounts={reloadAccounts}
              />
            ),
          },
        ]}
      />
    );
  };

  return (
    <S.Container>
      <S.Header>
        <div>
          <S.PageSubtitle>
            Plano de contas, extratos, lançamentos, demonstrações e fechamento
          </S.PageSubtitle>
        </div>
        <S.ClientPicker>
          <SelectComponent
            placeholder="Selecione a empresa"
            options={clientOptions}
            value={clientId}
            onChange={(value) => {
              setClientId(value ?? undefined);
              if (value) storeClient(value);
            }}
          />
        </S.ClientPicker>
      </S.Header>

      <Card variant="borderless" style={{ borderRadius: 6, width: "100%" }}>
        {content()}
      </Card>
    </S.Container>
  );
};

export default AccountingPage;
