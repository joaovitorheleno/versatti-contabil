import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateCpf } from "../../service/auth/integration";
import { openErrorNotification } from "../../components/notification/error";

const useRegisterCpf = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRegisterCpf = async (cpf: string) => {
    setLoading(true);
    try {
      const response = await validateCpf(cpf);

      if (response) {
        navigate('/register', { state: { cpf, userId: response.id } });
      }
    } catch (error: any) {
      if (typeof openErrorNotification === 'function') {
        openErrorNotification({
          title: 'Erro ao validar o acesso',
          description: error.message || "CPF ou e-mail não encontrado, ou usuário já cadastrado.",
          showProgress: true,
          pauseOnHover: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleRegisterCpf };
};

export default useRegisterCpf;