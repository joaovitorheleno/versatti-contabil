import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { openErrorNotification } from "../../components/notification/error";
import { listUsers } from "../../service/user/integration";

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

  const token = localStorage.getItem('@versatti:token');

  const fetchUsers = useCallback(async () => {
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
  }, []);

  const registerUser = () => {
    navigate('/users/register')
  }

  useEffect(() => {
    if (!token) {
      openErrorNotification({
        title: "Erro ao acessar",
        description: "Token de Login expirado ou não existe, faça o login.",
      });
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [token, navigate, fetchUsers]);

  return {
    loading,
    users,
    mensagem,
    registerUser
  };
};

export default useListUsers;