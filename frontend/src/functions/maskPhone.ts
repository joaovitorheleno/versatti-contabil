import { openErrorNotification } from "../components/notification/error";

export const maskPhone = (value: any) => {
        const digits = String(value ?? "").replace(/\D/g, "");

        if (digits.length <= 2) {
            return digits ? `(${digits}` : "";
        }

        if (digits.length <= 6) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        }

        if (digits.length <= 10) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        }

        if(digits.length <= 11) {
            openErrorNotification({
                title: 'Erro ao validar telefone',
                description: "Número de telefone inválido. O telefone deve conter no mínimo 11 dígitos.",
                showProgress: true,
                pauseOnHover: true,
            });
        }

        return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    };