import { Form, type UploadFile } from "antd";
import type { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../../common/auth/user-is-admin";
import { openErrorNotification } from "../../components/notification/error";
import { openSuccessNotification } from "../../components/notification/success";
import { listClients, listUserClients } from "../../service/client/integration";
import type { ClientsResponse } from "../../service/client/types";
import {
  createDocument,
  listDocumentTypes,
  notifyDocuments,
} from "../../service/documents/integration";
import type { DocumentTypeResponse } from "../../service/documents/types";

export type FormDocumentType = {
  clientId: string;
  documentTypeId: string;
  title: string;
  number?: string;
  notes?: string;
  issueDate?: Dayjs;
  expirationDate?: Dayjs;
  alertDays?: number;
  visibleToClient: boolean;
  notifyResponsible?: boolean;
  file?: UploadFile[];
};

const useCreateDocument = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormDocumentType>();

  const [clients, setClients] = useState<ClientsResponse[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeResponse[]>(
    [],
  );
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const token = localStorage.getItem("@versatti:token");

  const documentTypeId = Form.useWatch("documentTypeId", form);

  const selectedType = useMemo(
    () => documentTypes.find((type) => type.id === documentTypeId),
    [documentTypes, documentTypeId],
  );

  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);

      const [clientsResponse, typesResponse] = await Promise.all([
        isAdmin() ? listClients() : listUserClients(),
        listDocumentTypes(),
      ]);

      setClients(clientsResponse);
      setDocumentTypes(typesResponse);
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao carregar dados",
        description: `Não foi possível carregar clientes e tipos de documento: ${e?.message || e}`,
      });
    } finally {
      setLoadingOptions(false);
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

    fetchOptions();
  }, [token, navigate, fetchOptions]);

  useEffect(() => {
    if (!selectedType) return;

    if (selectedType.requiresExpiration) {
      form.setFieldValue("alertDays", selectedType.defaultAlertDays ?? undefined);
    } else {
      form.setFieldsValue({ expirationDate: undefined, alertDays: undefined });
    }
  }, [selectedType, form]);

  const onSubmit = async (values: FormDocumentType) => {
    const files = (values.file ?? [])
      .map((item) => item.originFileObj)
      .filter((file): file is NonNullable<typeof file> => !!file);

    const baseDocument = {
      clientId: values.clientId,
      documentTypeId: values.documentTypeId,
      number: values.number,
      notes: values.notes,
      issueDate: values.issueDate?.format("YYYY-MM-DD"),
      expirationDate: values.expirationDate?.format("YYYY-MM-DD"),
      alertDays: values.alertDays,
      visibleToClient: values.visibleToClient,
    };

    const payloads =
      files.length === 0
        ? [{ ...baseDocument, title: values.title }]
        : files.map((file) => ({
            ...baseDocument,
            title:
              files.length > 1
                ? `${values.title} - ${file.name.replace(/\.[^.]+$/, "")}`.slice(
                    0,
                    255,
                  )
                : values.title,
            file,
          }));

    setSubmitting(true);

    const failures: string[] = [];
    const createdIds: string[] = [];

    for (const payload of payloads) {
      try {
        const created = await createDocument(payload);
        createdIds.push(created.id);
      } catch (error: any) {
        const backendMessage = error.response?.data?.message;
        const detail = Array.isArray(backendMessage)
          ? backendMessage.join(", ")
          : backendMessage || error.message;

        failures.push(
          `${"file" in payload ? payload.file.name : payload.title}: ${detail}`,
        );
      }
    }

    const sent = createdIds.length;

    if (failures.length === 0) {
      openSuccessNotification({
        title:
          sent > 1
            ? `${sent} documentos enviados com sucesso!`
            : "Documento enviado com sucesso!",
      });
    } else {
      openErrorNotification({
        title:
          sent > 0
            ? `${sent} de ${payloads.length} documentos enviados`
            : "Erro ao enviar documento",
        description: `Falharam: ${failures.join(" | ")}`,
      });
    }

    if (sent > 0 && isAdmin() && values.notifyResponsible) {
      await sendToResponsible(createdIds);
    }

    setSubmitting(false);

    if (sent > 0) {
      navigate("/documents");
    }
  };

  const sendToResponsible = async (documentIds: string[]) => {
    try {
      const result = await notifyDocuments(documentIds);

      result.sent.forEach((item) =>
        openSuccessNotification({
          title: `E-mail enviado para ${item.email}`,
          description:
            item.attached < item.documents
              ? `${item.attached} de ${item.documents} arquivo(s) anexados; os demais excederam o limite do e-mail e estão disponíveis no sistema.`
              : undefined,
        }),
      );

      [...result.skipped, ...result.failed].forEach((item) =>
        openErrorNotification({
          title: `E-mail não enviado - ${item.client}`,
          description: item.reason,
        }),
      );
    } catch (error: any) {
      openErrorNotification({
        title: "Documentos salvos, mas o e-mail não foi enviado",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  return {
    form,
    clients,
    documentTypes,
    selectedType,
    loadingOptions,
    submitting,
    onSubmit,
  };
};

export default useCreateDocument;
