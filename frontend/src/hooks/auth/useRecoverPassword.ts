import { useState } from "react";
import { openSuccessNotification } from "../../components/notification/success";
import { openErrorNotification } from "../../components/notification/error";
import { recoverPassword } from "../../service/auth/integration";

export const useRecoverPassword = () => {
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (emailRecover: string) => {
    setLoading(true);
    try {
      await recoverPassword(emailRecover);

      openSuccessNotification({
        title: "Solicitação recebida",
        description:
          "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha em instantes.",
      });
    } catch (error: any) {
      openErrorNotification({
        title: "Erro ao solicitar recuperação",
        description:
          error.message || "Ocorreu um erro ao tentar enviar o e-mail.",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleForgotPassword, loading };
};
