import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { openErrorNotification } from "../../components/notification/error";
import { inspectUser, listUsers } from "../../service/user/integration";

export interface UsersResponse {
  id?: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  dateOfBirth: string;
}

const useListUsers = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<UsersResponse[]>([]);
  const [mensagem, setMensagem] = useState<string>("");

  const navigate = useNavigate();
  const fetchedRef = useRef(false);

  const fetchInspectUser = useCallback(async (userId: string) => {
    try {
      return await inspectUser(userId);
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao inspecionar usuário",
      });
      return null;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("@versatti:token");

    if (!token) {
      openErrorNotification({
        title: "Erro ao acessar",
        description: "Token de Login expirado ou não existe, faça o login.",
      });
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setMensagem("");

      const response = await listUsers();
      setUsers(response);

      if (Array.isArray(response) && response.length > 0 && response[0].id) {
        await inspectUser("0a96c03c-07b4-4696-9b7e-493ec461968e");
      } else if (Array.isArray(response) && response.length === 0) {
        setMensagem("Nenhum usuário encontrado.");
      }
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao listar usuários",
        description: `Não foi possível listar os usuários: ${e?.message || e}`,
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const registerUser = () => {
    navigate("/users/register");
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchUsers();
  }, [fetchUsers]);

  return {
    loading,
    users,
    mensagem,
    registerUser,
    fetchInspectUser,
  };
};

export default useListUsers;
