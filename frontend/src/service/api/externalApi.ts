import axios from "axios";
import type { CnpjResponse, CepResponse } from "./types";

export const fetchCnpjData = async (
  cnpj: string,
): Promise<CnpjResponse | null> => {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) return null;

  try {
    const { data } = await axios.get<CnpjResponse>(
      `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`,
    );
    return data;
  } catch (error) {
    console.error(error);
    return null;
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
