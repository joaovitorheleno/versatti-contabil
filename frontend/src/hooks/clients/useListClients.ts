import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listClients } from "../../service/client/integration";
import { openErrorNotification } from "../../components/notification/error";

export interface ClientResponse {
  id?: string;
  name: string;
  cnpj: string;
  taxRegime: string;
}

const useListClients = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [clients, setClients] = useState<ClientResponse[]>([]);
    const [mensagem, setMensagem] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const navigate = useNavigate();

    const token = localStorage.getItem('@versatti:token');

    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            setMensagem("");

            const response = await listClients();
            setClients(response);

            if (Array.isArray(response) && response.length === 0) {
                setMensagem("Nenhum cliente encontrado.");
            }
        } catch (e: any) {
            openErrorNotification({
                title: "Falha ao listar clientes",
                description: `Não foi possível listar os clientes: ${e?.message || e}`,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const registerClient = () => {
        navigate('/clients/register')
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
    
        fetchClients();
    }, [token, navigate, fetchClients]);

    const showDrawer = () => {
        setOpen(true);
    };

    const closeDrawer = () => {
        setOpen(false);
    };

    return {
        loading,
        clients,
        mensagem,
        registerClient,
        showDrawer,
        closeDrawer
    };
}

export default useListClients;