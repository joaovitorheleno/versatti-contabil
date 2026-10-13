import { Form } from "antd";
import { useState } from "react";
import { maskCnpj } from "../../functions/maskCnpj";
import { maskPhone } from "../../functions/maskPhone";
import axios from "axios";
import { BASE_URL } from "../../config/url/baseUrl";
import { editClient } from "../../service/client/integration";
import { openErrorNotification } from "../../components/notification/error";
import { openSuccessNotification } from "../../components/notification/success";

interface ClientTableData {
  id: string | number;
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

const useEditClient = (onSuccess?: () => void) => {
  const [selectedClient, setSelectedClient] = useState<ClientTableData | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = Form.useForm();

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedClient(null);
    form.resetFields();
  };

  const handleSaveEdit = async (values: any) => {
    if (!selectedClient) return;

    try {
      setLoading(true);
      const response = await editClient(String(selectedClient.id), values);

      if (response) {
        openSuccessNotification({
          title: "Sucesso ao editar cliente",
          pauseOnHover: true,
          showProgress: true,
        });
      }

      onSuccess?.();
      handleCloseEditModal();
    } catch (e: any) {
      openErrorNotification({
        title: "Erro ao editar cliente",
        description: e?.message ?? "Erro inesperado",
        pauseOnHover: true,
        showProgress: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: ClientTableData) => {
    setSelectedClient(client);
    form.setFieldsValue({
      name: client.name,
      cnpj: maskCnpj(client.cnpj),
      tradeName: client.tradeName || "",
      taxRegime: client.taxRegime,
      stateRegistration: client.stateRegistration || "",
      municipalRegistration: client.municipalRegistration || "",
      phone: maskPhone(client.phone) || "",
      nfeEmail: client.nfeEmail || "",
      contactPerson: client.contactPerson || "",
    });
    setIsEditModalOpen(true);
  };

  return {
    form,
    loading,
    isEditModalOpen,
    handleSaveEdit,
    handleEdit,
    handleCloseEditModal,
  };
};

export default useEditClient;
