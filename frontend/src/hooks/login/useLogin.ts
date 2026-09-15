import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../service/auth/integration";
import { openSuccessNotification } from "../../components/notification/success";
import { openErrorNotification } from "../../components/notification/error";

const useLogin = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (cpf: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginUser({ cpf, password });

      if (response?.access_token) {
        localStorage.setItem('@versatti:token', response.access_token);
        
        openSuccessNotification({
            title: 'Login realizado com sucesso!',
            description: 'Você foi autenticado com sucesso.',
            showProgress: true,
            pauseOnHover: true,
        });
        navigate('/users');
      }
    } catch (error: any) {

      const errorMessage = error?.response?.data?.message 
        || "CPF ou senha inválidos. Por favor verifique suas credenciais ou realize o primeiro acesso";
      
      if (typeof openErrorNotification === 'function') {
        openErrorNotification({
          title: 'Erro ao fazer login',
          description: errorMessage,
          showProgress: true,
          pauseOnHover: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleLogin };
};

export default useLogin;