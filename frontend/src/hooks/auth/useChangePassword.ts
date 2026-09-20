import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { openErrorNotification } from "../../components/notification/error";
import { openSuccessNotification } from "../../components/notification/success";
import { changePassword } from "../../service/auth/integration";

const useChangePassword = () => {
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    if (!token) {
        navigate('/recoverPassword')
    }

    const handleResetPassword = async (password: string, newPassword: string) => {
        if (!token) {
            openErrorNotification({
                title: 'Token inválido',
                description: 'Token de redefinição não encontrado na URL.',
            });
            return;
        }

        setLoading(true);

        try {
            if(password != newPassword) {
                openErrorNotification({
                    title: 'Erro ao alterar senha',
                    description: 'As senhas não coincidem. Por favor, tente novamente.',
                    showProgress: true,
                    pauseOnHover: true,
                });
                return;
            }

            await changePassword(token, newPassword);

            openSuccessNotification({
                title: 'Senha alterada!', 
                description: 'Sua senha foi redefinida com sucesso. Faça login para continuar.',
            });

            navigate('/login');
            } catch (error: any) {
                openErrorNotification({
                    title: 'Erro ao alterar senha',
                    description: error.message || 'Ocorreu um erro ao tentar redefinir sua senha.',
                });
            } finally {
            setLoading(false);
        }
    };

    return {
        handleResetPassword,
        loading,
        hasToken: Boolean(token),
    };
}

export default useChangePassword;