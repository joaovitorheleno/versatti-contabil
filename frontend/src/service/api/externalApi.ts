import axios from "axios";
import type { CnpjLookupResult, CnpjResponse, CepResponse } from "./types";

const LOOKUP_TIMEOUT_MS = 8000;

const fromBrasilApi = async (cnpj: string): Promise<CnpjLookupResult> => {
  const { data } = await axios.get<CnpjResponse>(
    `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
    { timeout: LOOKUP_TIMEOUT_MS },
  );
  return { status: "found", data };
};

const fromCnpjWs = async (cnpj: string): Promise<CnpjLookupResult> => {
  const { data } = await axios.get(`https://publica.cnpj.ws/cnpj/${cnpj}`, {
    timeout: LOOKUP_TIMEOUT_MS,
  });
  const est = data?.estabelecimento ?? {};

  return {
    status: "found",
    data: {
      razao_social: data?.razao_social,
      nome_fantasia: est.nome_fantasia ?? undefined,
      logradouro: [est.tipo_logradouro, est.logradouro].filter(Boolean).join(" ") || undefined,
      numero: est.numero ?? undefined,
      complemento: est.complemento ?? undefined,
      bairro: est.bairro ?? undefined,
      municipio: est.cidade?.nome ?? undefined,
      uf: est.estado?.sigla ?? undefined,
      cep: est.cep ?? undefined,
      ddd_telefone_1: est.ddd1 && est.telefone1 ? `${est.ddd1}${est.telefone1}` : undefined,
      email: est.email ?? undefined,
    },
  };
};

const isNotFound = (error: any) => error?.response?.status === 404;

export const fetchCnpjData = async (cnpj: string): Promise<CnpjLookupResult> => {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) return { status: "not_found" };

  try {
    return await fromBrasilApi(cleanCnpj);
  } catch (error) {
    if (isNotFound(error)) return { status: "not_found" };
    console.warn("BrasilAPI indisponível, tentando CNPJ.ws", error);
  }

  try {
    return await fromCnpjWs(cleanCnpj);
  } catch (error) {
    if (isNotFound(error)) return { status: "not_found" };
    console.warn("CNPJ.ws indisponível", error);
    return { status: "unavailable" };
  }
};

export const fetchCepData = async (
  cep: string,
): Promise<CepResponse | null> => {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  try {
    const { data } = await axios.get<CepResponse>(
      `https://brasilapi.com.br/api/cep/v1/${cleanCep}`,
    );
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
