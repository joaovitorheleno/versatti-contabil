import { Form, Modal } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { openErrorNotification } from "../../components/notification/error";
import { openSuccessNotification } from "../../components/notification/success";
import {
  createDocumentType,
  deleteDocumentType,
  listDocumentTypes,
} from "../../service/documents/integration";
import type {
  CreateDocumentTypePayload,
  DocumentTypeResponse,
} from "../../service/documents/types";

const useDocumentTypes = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<CreateDocumentTypePayload>();

  const [loading, setLoading] = useState<boolean>(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeResponse[]>(
    [],
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const token = localStorage.getItem("@versatti:token");

  const fetchDocumentTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listDocumentTypes();
      setDocumentTypes(response);
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao listar tipos de documento",
        description: `Não foi possível listar os tipos: ${e?.message || e}`,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      openErrorNotification({
        title: "Erro ao acessar",
        description: "Token de Login expirado ou não existe, faça o login.",
      });
      navigate("/");
      return;
    }

    fetchDocumentTypes();
  }, [token, navigate, fetchDocumentTypes]);

  const handleOpenCreateModal = () => {
    form.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    form.resetFields();
  };

  const handleCreate = async (values: CreateDocumentTypePayload) => {
    try {
      setSaving(true);

      await createDocumentType({
        code: values.code,
        name: values.name.trim(),
        category: values.category,
        requiresExpiration: values.requiresExpiration ?? false,
        defaultAlertDays: values.requiresExpiration
          ? values.defaultAlertDays
          : undefined,
      });

      openSuccessNotification({
        title: "Tipo de documento criado com sucesso!",
      });

      setIsCreateModalOpen(false);
      form.resetFields();
      fetchDocumentTypes();
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      const detail = Array.isArray(backendMessage)
        ? backendMessage.join(", ")
        : backendMessage || error.message;

      openErrorNotification({
        title: "Erro ao criar tipo de documento",
        description: detail,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (documentType: DocumentTypeResponse) => {
    Modal.confirm({
      title: "Excluir tipo de documento",
      content: `Tem certeza que deseja excluir o tipo "${documentType.name}"? Ele não poderá mais ser usado em novos envios, mas os documentos já enviados com este tipo serão mantidos.`,
      okText: "Sim, excluir",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await deleteDocumentType(documentType.id);

          openSuccessNotification({
            title:
              response?.message ??
              `Tipo "${documentType.name}" excluído com sucesso`,
          });

          setDocumentTypes((prev) =>
            prev.filter((type) => type.id !== documentType.id),
          );
        } catch (error: any) {
          const backendMessage = error.response?.data?.message;
          const detail = Array.isArray(backendMessage)
            ? backendMessage.join(", ")
            : backendMessage || error.message;

          openErrorNotification({
            title: "Não foi possível excluir",
            description: detail,
          });
        }
      },
    });
  };

  return {
    form,
    loading,
    documentTypes,
    isCreateModalOpen,
    saving,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreate,
    handleDelete,
  };
};

export default useDocumentTypes;
