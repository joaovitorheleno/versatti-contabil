import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { openErrorNotification } from "../../components/notification/error";
import { openSuccessNotification } from "../../components/notification/success";
import { runExpirationAlerts } from "../../service/alerts/integration";
import { getDashboard } from "../../service/dashboard/integration";
import type { DashboardResponse } from "../../service/dashboard/types";

const useDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [sendingAlerts, setSendingAlerts] = useState<boolean>(false);

  const token = localStorage.getItem("@versatti:token");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setData(await getDashboard());
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao carregar o dashboard",
        description: e?.response?.data?.message || e?.message || String(e),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      openErrorNotification({
        title: "Erro ao acessar",
        description: "Token de Login expirado ou não existe, faça o login.",
      });
      navigate("/");
      return;
    }

    fetchDashboard();
  }, [token, navigate, fetchDashboard]);

  const sendAlerts = async () => {
    try {
      setSendingAlerts(true);
      const result = await runExpirationAlerts();

      if (result.documentsDue === 0) {
        openSuccessNotification({
          title: "Nenhum alerta pendente",
          description:
            "Não há documentos vencendo que ainda não tenham sido avisados nos últimos 7 dias.",
        });
        return;
      }

      const lines = [
        `${result.documentsDue} documento(s) com vencimento próximo ou vencido.`,
        `${result.clientEmailsSent} e-mail(s) enviado(s) aos responsáveis das empresas.`,
        result.officeEmailSent
          ? "Resumo enviado ao escritório."
          : "O resumo do escritório não foi enviado.",
        ...(result.clientsWithoutEmail.length
          ? [`Sem e-mail do responsável: ${result.clientsWithoutEmail.join(", ")}.`]
          : []),
        ...result.failures.map((failure) => `Falha: ${failure}`),
      ];

      (result.failures.length ? Modal.warning : Modal.success)({
        title: "Alertas de vencimento",
        content: lines.map((line) => <p key={line}>{line}</p>),
      });
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao enviar alertas",
        description: e?.response?.data?.message || e?.message || String(e),
      });
    } finally {
      setSendingAlerts(false);
    }
  };

  return { loading, data, fetchDashboard, sendAlerts, sendingAlerts };
};

export default useDashboard;
