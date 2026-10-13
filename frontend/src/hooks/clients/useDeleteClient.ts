import { useState } from "react";
import { deleteClient } from "../../service/client/integration";
import { Modal } from "antd";
import { openSuccessNotification } from "../../components/notification/success";

interface ClientTableData {
  id: string;
  name: string;
  cnpj: string;
  taxRegime: string;
  tradeName: string;
  stateRegistration: string;
  municipalRegistration: string;
  phone: string;
  nfeEmail: string;
  contactPerson: string;
}

const useDeleteClient = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async (client: ClientTableData) => {
    try {
      setLoading(true);
      if (!client?.id) {
        console.error("ID do cliente é inválido:", client);
        return;
      }
      const response = await deleteClient(client.id);

      if (response) {
        openSuccessNotification({
          title: "Sucesso ao deletar cliente",
          pauseOnHover: true,
          showProgress: true,
        });
      }

      onSuccess?.();
    } catch (e: any) {
      setLoading(false);
      throw new Error("Não foi possível deletar o cliente: ", e.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleDelete,
  };
};

export default useDeleteClient;
