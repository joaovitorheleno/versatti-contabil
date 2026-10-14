import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { openErrorNotification } from "../../components/notification/error";
import { getDashboard } from "../../service/dashboard/integration";
import type { DashboardResponse } from "../../service/dashboard/types";

const useDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DashboardResponse | null>(null);

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

  return { loading, data, fetchDashboard };
};

export default useDashboard;
