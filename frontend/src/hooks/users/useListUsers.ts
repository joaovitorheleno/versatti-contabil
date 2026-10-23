import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { openErrorNotification } from "../../components/notification/error";
import {
  deleteUser,
  editUser,
  inspectUser,
  listUsers,
} from "../../service/user/integration";
import { openSuccessNotification } from "../../components/notification/success";

export interface UsersResponse {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
}

const useListUsers = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<UsersResponse[]>([]);
  const [mensagem, setMensagem] = useState<string>("");

  const navigate = useNavigate();
  const fetchedRef = useRef(false);

  const fetchDeleteUser = useCallback(
    async (userId: string, userName: string) => {
      try {
        const response = await deleteUser(userId);

        if (response) {
          openSuccessNotification({
            title: "Usuário " + userName + " deletado com sucesso",
            description: `O usuário foi deletado com sucesso.`,
            pauseOnHover: true,
          });
        }
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        return response;
      } catch (e: any) {
        openErrorNotification({
          title: "Falha ao deletar usuário",
          description: `Não foi possível deletar o usuário: ${e?.message || e}`,
        });
      }
    },
    [],
  );

  const fetchEditUser = useCallback(
    async (userId: string, userData: Partial<UsersResponse>) => {
      try {
        const response = await editUser(userId, userData);
        return response;
      } catch (e: any) {
        console.error("Falha ao editar usuário:", e);
        throw new Error(`Falha ao editar usuário: ${e?.message || e}`);
      }
    },
    [],
  );

  const fetchInspectUser = useCallback(async (userId: string) => {
    try {
      return await inspectUser(userId);
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao inspecionar usuário",
      });
      console.error("Falha ao inspecionar usuário:", e);
      throw new Error(`Falha ao inspecionar usuário: ${e?.message || e}`);
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

      if (Array.isArray(response) && response.length === 0) {
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
    fetchEditUser,
    fetchUsers,
    fetchDeleteUser,
  };
};

export default useListUsers;
