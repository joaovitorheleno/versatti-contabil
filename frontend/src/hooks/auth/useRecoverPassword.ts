import { useState } from "react";
import { openSuccessNotification } from "../../components/notification/success";
import { openErrorNotification } from "../../components/notification/error";
import {
  recoverPassword,
  sendPasswordResetEmail,
} from "../../service/auth/integration";

export const useRecoverPassword = () => {
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (emailRecover: string) => {
    setLoading(true);
    try {
      const response = await recoverPassword(emailRecover);

      const { email, name, resetToken } = response;

      const resetLink = `${window.location.origin}/resetPassword?token=${resetToken}`;

      if (!email) {
        throw new Error("O e-mail retornado pela API está vazio.");
      }

      await sendPasswordResetEmail({
        toEmail: email,
        toName: name || "Usuário",
        resetLink,
      });

      openSuccessNotification({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
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
