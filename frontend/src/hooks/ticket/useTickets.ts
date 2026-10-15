import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../../common/auth/user-is-admin";
import type { TicketStatusEnum } from "../../common/enum/ticket.enum";
import { openErrorNotification } from "../../components/notification/error";
import { openSuccessNotification } from "../../components/notification/success";
import { listClients, listUserClients } from "../../service/client/integration";
import type { ClientsResponse } from "../../service/client/types";
import {
  createTicket,
  getTicket,
  getTicketAttachment,
  listTickets,
  replyTicket,
  updateTicketStatus,
} from "../../service/ticket/integration";
import type {
  CreateTicketPayload,
  TicketDetail,
  TicketMessage,
  TicketSummary,
} from "../../service/ticket/types";

const errorMessage = (e: any) => {
  const message = e?.response?.data?.message;
  return Array.isArray(message) ? message.join(", ") : message || e?.message || String(e);
};

const useTickets = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [clients, setClients] = useState<ClientsResponse[]>([]);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const token = localStorage.getItem("@versatti:token");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setTickets(await listTickets());
    } catch (e) {
      openErrorNotification({ title: "Falha ao listar chamados", description: errorMessage(e) });
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

    fetchTickets();
    (isAdmin() ? listClients() : listUserClients())
      .then(setClients)
      .catch(() => undefined);
  }, [token, navigate, fetchTickets]);

  const applyDetail = (updated: TicketDetail) => {
    setDetail(updated);
    const { messages, ...summary } = updated;
    setTickets((prev) => {
      const others = prev.filter((t) => t.id !== updated.id);
      return [{ ...summary, messageCount: messages.length }, ...others];
    });
  };

  const open = async (id: string) => {
    try {
      setDetailLoading(true);
      setDetail(await getTicket(id));
    } catch (e) {
      openErrorNotification({ title: "Falha ao abrir chamado", description: errorMessage(e) });
    } finally {
      setDetailLoading(false);
    }
  };

  const close = () => setDetail(null);

  const create = async (payload: CreateTicketPayload) => {
    try {
      setSaving(true);
      const created = await createTicket(payload);
      applyDetail(created);
      openSuccessNotification({ title: `Chamado #${created.number} aberto` });
      return true;
    } catch (e) {
      openErrorNotification({ title: "Não foi possível abrir o chamado", description: errorMessage(e) });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const reply = async (message: string, file?: File) => {
    if (!detail) return false;
    try {
      setSaving(true);
      applyDetail(await replyTicket(detail.id, message, file));
      return true;
    } catch (e) {
      openErrorNotification({ title: "Não foi possível enviar", description: errorMessage(e) });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (status: TicketStatusEnum) => {
    if (!detail) return;
    try {
      setSaving(true);
      applyDetail(await updateTicketStatus(detail.id, status));
    } catch (e) {
      openErrorNotification({ title: "Não foi possível alterar", description: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  };

  const downloadAttachment = async (message: TicketMessage) => {
    if (!detail || !message.file) return;
    try {
      const blob = await getTicketAttachment(detail.id, message.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = message.file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      openErrorNotification({ title: "Falha ao baixar anexo", description: errorMessage(e) });
    }
  };

  return {
    loading,
    saving,
    tickets,
    clients,
    detail,
    detailLoading,
    open,
    close,
    create,
    reply,
    changeStatus,
    downloadAttachment,
  };
};

export default useTickets;
