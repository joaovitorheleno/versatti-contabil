import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAdmin } from "../../common/auth/user-is-admin";
import { openErrorNotification } from "../../components/notification/error";
import { listClients, listUserClients } from "../../service/client/integration";
import type { ClientsResponse } from "../../service/client/types";
import {
  getDocumentFile,
  listDocuments,
} from "../../service/documents/integration";
import type {
  DocumentListItem,
  DownloadFormat,
} from "../../service/documents/types";

const PREVIEWABLE_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/xml",
  "text/xml",
];

// Com responseType "blob", a mensagem de erro do backend também chega como Blob
const getBlobErrorMessage = async (error: any): Promise<string> => {
  const data = error?.response?.data;

  if (data instanceof Blob) {
    try {
      const json = JSON.parse(await data.text());
      return Array.isArray(json.message)
        ? json.message.join(", ")
        : json.message;
    } catch {
      // resposta não era JSON; cai na mensagem genérica
    }
  }

  return error?.message || String(error);
};

const useListDocuments = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [clients, setClients] = useState<ClientsResponse[]>([]);
  const [searchParams] = useSearchParams();

  // ?clientId= vem do dashboard ("Ver documentos" de uma empresa com pendências)
  const [clientId, setClientId] = useState<string | undefined>(
    searchParams.get("clientId") ?? undefined,
  );
  const [fileLoadingId, setFileLoadingId] = useState<string | null>(null);

  const token = localStorage.getItem("@versatti:token");

  const fetchClients = useCallback(async () => {
    try {
      const response = isAdmin() ? await listClients() : await listUserClients();
      setClients(response);
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao listar empresas",
        description: `Não foi possível carregar as empresas: ${e?.message || e}`,
      });
    }
  }, []);

  const fetchDocuments = useCallback(async (selectedClientId?: string) => {
    try {
      setLoading(true);
      const response = await listDocuments(selectedClientId);
      setDocuments(response);
    } catch (e: any) {
      openErrorNotification({
        title: "Falha ao listar documentos",
        description: `Não foi possível listar os documentos: ${
          e?.response?.data?.message || e?.message || e
        }`,
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

    fetchClients();
  }, [token, navigate, fetchClients]);

  useEffect(() => {
    if (!token) return;

    fetchDocuments(clientId);
  }, [token, clientId, fetchDocuments]);

  const openFile = async (
    document: DocumentListItem,
    options: { download?: boolean; format?: DownloadFormat } = {},
  ) => {
    const { download = false, format } = options;

    try {
      setFileLoadingId(document.id);

      const blob = await getDocumentFile(document.id, format);
      const url = URL.createObjectURL(blob);

      // PDF gerado a partir do XML (DANFE) é sempre PDF, independente do arquivo original
      const mime = format === "pdf" ? "application/pdf" : document.fileMime;
      const baseName = document.fileName ?? "documento";
      const fileName =
        format === "pdf" && document.isXml
          ? baseName.replace(/\.xml$/i, "") + ".pdf"
          : baseName;

      const canPreview =
        !download && PREVIEWABLE_MIME_TYPES.includes(mime ?? "");

      if (canPreview) {
        window.open(url, "_blank", "noopener");
      } else {
        const link = window.document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
      }

      // Dá tempo da nova aba carregar o arquivo antes de liberar a URL
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: any) {
      openErrorNotification({
        title:
          format === "pdf" && document.isXml
            ? "Não foi possível gerar o PDF"
            : "Falha ao abrir arquivo",
        description: await getBlobErrorMessage(e),
      });
    } finally {
      setFileLoadingId(null);
    }
  };

  const registerDocument = () => {
    navigate("/documents/register");
  };

  return {
    loading,
    documents,
    clients,
    clientId,
    setClientId,
    fileLoadingId,
    openFile,
    registerDocument,
    fetchDocuments,
  };
};

export default useListDocuments;
