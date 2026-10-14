import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listClients, listUserClients } from "../../service/client/integration";
import { openErrorNotification } from "../../components/notification/error";
import { isAdmin } from "../../common/auth/user-is-admin";

export interface ClientResponse {
  id?: string;
  name: string;
  cnpj: string;
  taxRegime: string;
  tradeName: string;
  stateRegistration?: number | undefined;
  municipalRegistration?: number | undefined;
  phone: string;
  nfeEmail?: string | undefined;
  responsibleEmail?: string | null;
  contactPerson?: string | undefined;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isActive: boolean;
}

const useListClients = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [mensagem, setMensagem] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("@versatti:token");

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setMensagem("");

      let response;

      if (isAdmin()) {
        response = await listClients();
      } else {
        response = await listUserClients();
      }

      setClients(response);

      if (Array.isArray(response) && response.length === 0) {
        setMensagem("Nenhum cliente encontrado.");
      }
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao listar clientes",
        description: `Não foi possível listar os clientes: ${e?.message || e}`,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const registerClient = () => {
    navigate("/clients/register");
  };

  useEffect(() => {
    if (!token) {
      openErrorNotification({
        title: "Erro ao acessar",
        description: "Token de Login expirado ou não existe, faça o login.",
      });
      navigate("/");
      return;
    }

    fetchClients();
  }, [token, navigate, fetchClients]);

  const showDrawer = () => {
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
  };

  return {
    loading,
    clients,
    mensagem,
    registerClient,
    showDrawer,
    closeDrawer,
    fetchClients,
  };
};

export default useListClients;
