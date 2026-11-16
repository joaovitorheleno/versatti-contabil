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

const fromOpenCnpj = async (cnpj: string): Promise<CnpjLookupResult> => {
  const { data } = await axios.get(`https://api.opencnpj.org/${cnpj}`, {
    timeout: LOOKUP_TIMEOUT_MS,
  });
  const phone = data?.telefones?.find((t: any) => !t?.is_fax) ?? data?.telefones?.[0];

  return {
    status: "found",
    data: {
      razao_social: data?.razao_social,
      nome_fantasia: data?.nome_fantasia || undefined,
      logradouro: [data?.tipo_logradouro, data?.logradouro].filter(Boolean).join(" ") || undefined,
      numero: data?.numero || undefined,
      complemento: data?.complemento || undefined,
      bairro: data?.bairro || undefined,
      municipio: data?.municipio || undefined,
      uf: data?.uf || undefined,
      cep: data?.cep || undefined,
      ddd_telefone_1: phone?.ddd && phone?.numero ? `${phone.ddd}${phone.numero}` : undefined,
      email: data?.email || undefined,
    },
  };
};

const isNotFound = (error: any) => error?.response?.status === 404;

const providers = [
  { name: "BrasilAPI", fetch: fromBrasilApi },
  { name: "OpenCNPJ", fetch: fromOpenCnpj },
  { name: "CNPJ.ws", fetch: fromCnpjWs },
];

export const fetchCnpjData = async (cnpj: string): Promise<CnpjLookupResult> => {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) return { status: "not_found" };

  let notFoundCount = 0;
  for (const provider of providers) {
    try {
      const result = await provider.fetch(cleanCnpj);
      if (result.status === "found" && result.data?.razao_social) return result;
    } catch (error) {
      if (isNotFound(error)) notFoundCount += 1;
      else console.warn(`${provider.name} indisponível`, error);
    }
  }

  return notFoundCount === providers.length
    ? { status: "not_found" }
    : { status: "unavailable" };
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
