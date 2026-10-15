import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../../common/auth/user-is-admin";
import { openErrorNotification } from "../../components/notification/error";
import { openSuccessNotification } from "../../components/notification/success";
import { listClients, listUserClients } from "../../service/client/integration";
import type { ClientsResponse } from "../../service/client/types";
import {
  addLegalProcessStep,
  createLegalProcess,
  deleteLegalProcess,
  listLegalProcesses,
  updateLegalProcess,
  updateLegalProcessStep,
} from "../../service/legalProcess/integration";
import type {
  CreateLegalProcessPayload,
  LegalProcess,
  UpdateLegalProcessPayload,
} from "../../service/legalProcess/types";

const errorMessage = (e: any) => {
  const message = e?.response?.data?.message;
  return Array.isArray(message) ? message.join(", ") : message || e?.message || String(e);
};

const useLegalProcesses = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [processes, setProcesses] = useState<LegalProcess[]>([]);
  const [clients, setClients] = useState<ClientsResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const token = localStorage.getItem("@versatti:token");

  const selected = processes.find((p) => p.id === selectedId) ?? null;

  const fetchProcesses = useCallback(async () => {
    try {
      setLoading(true);
      setProcesses(await listLegalProcesses());
    } catch (e) {
      openErrorNotification({ title: "Falha ao listar processos", description: errorMessage(e) });
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

    fetchProcesses();
    (isAdmin() ? listClients() : listUserClients())
      .then(setClients)
      .catch(() => undefined);
  }, [token, navigate, fetchProcesses]);

  const replace = (updated: LegalProcess) =>
    setProcesses((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  const run = async (action: () => Promise<LegalProcess>, success?: string) => {
    try {
      setSaving(true);
      const updated = await action();
      replace(updated);
      if (success) openSuccessNotification({ title: success });
      return updated;
    } catch (e) {
      openErrorNotification({ title: "Não foi possível salvar", description: errorMessage(e) });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const create = async (payload: CreateLegalProcessPayload) => {
    try {
      setSaving(true);
      const created = await createLegalProcess(payload);
      setProcesses((prev) => [created, ...prev]);
      setSelectedId(created.id);
      openSuccessNotification({ title: "Processo criado" });
      return true;
    } catch (e) {
      openErrorNotification({ title: "Não foi possível criar o processo", description: errorMessage(e) });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = (id: string, payload: UpdateLegalProcessPayload) =>
    run(() => updateLegalProcess(id, payload), "Processo atualizado");

  const toggleStep = (id: string, stepId: string, done: boolean) =>
    run(() => updateLegalProcessStep(id, stepId, { done }));

  const saveStepNotes = (id: string, stepId: string, notes: string) =>
    run(() => updateLegalProcessStep(id, stepId, { notes }));

  const addStep = (id: string, name: string) => run(() => addLegalProcessStep(id, name));

  const remove = async (id: string) => {
    try {
      await deleteLegalProcess(id);
      setProcesses((prev) => prev.filter((p) => p.id !== id));
      setSelectedId(null);
      openSuccessNotification({ title: "Processo excluído" });
    } catch (e) {
      openErrorNotification({ title: "Não foi possível excluir", description: errorMessage(e) });
    }
  };

  return {
    loading,
    saving,
    processes,
    clients,
    selected,
    select: setSelectedId,
    create,
    update,
    toggleStep,
    saveStepNotes,
    addStep,
    remove,
  };
};

export default useLegalProcesses;
