import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPassword } from "../../service/auth/integration";
import { openSuccessNotification } from "../../components/notification/success";
import { openErrorNotification } from "../../components/notification/error";

interface RegisterPasswordState {
  cpf: string;
}

export const useRegisterPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const state = location.state as RegisterPasswordState | undefined;
  const cpf = state?.cpf;

  useEffect(() => {
    if (!cpf) {
      navigate('/confirmCpf', { replace: true }); 
    }
  }, [cpf, navigate]);

  const handleCreatePassword = async (password: string, confirmPassword: string) => {
        setLoading(true);
        if (!cpf) {
            openErrorNotification({
                title: 'CPF não encontrado',
                description: 'Redirecionando para a página de confirmação de CPF.',
                showProgress: true,
                pauseOnHover: true,
            });
            navigate('/confirmCpf', { replace: true });
            return;
        }

        if (password !== confirmPassword) {
            openErrorNotification({
                title: 'Erro ao criar senha',
                description: 'As senhas não coincidem. Por favor, tente novamente.',
                showProgress: true,
                pauseOnHover: true,
            });
            return;
        }

        try {
            const response = await createPassword(cpf, password);

            if(response) {
                openSuccessNotification({
                    title: 'Senha criada com sucesso!',
                    description: 'Sua senha foi criada com sucesso. Você já pode fazer login.',
                    showProgress: true,
                    pauseOnHover: true,
                })

                navigate('/login', { replace: true });
            }
        } catch (error: any) {
            openErrorNotification({
                title: 'Erro ao criar senha',
                description: error.message || 'Ocorreu um erro ao criar a senha. Por favor, tente novamente.',
                showProgress: true,
                pauseOnHover: true,
            });
        } finally {
            setLoading(false);
        }
    }

  return { cpf, password, setPassword, loading, handleCreatePassword };
};