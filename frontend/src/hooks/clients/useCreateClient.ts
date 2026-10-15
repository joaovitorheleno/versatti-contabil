import { Form, message } from "antd";
import { maskCep } from "../../functions/maskCep";
import { maskPhone } from "../../functions/maskPhone";
import { fetchCnpjData, fetchCepData } from "../../service/api/externalApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormClientType } from "../../pages/createClient/types";
import { createClient } from "../../service/client/integration";
import { openErrorNotification } from "../../components/notification/error";
import { openSuccessNotification } from "../../components/notification/success";
import type { ClientsResponse } from "../../service/client/types";

const useCreateClient = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const handleCnpjSearch = async (cnpjValue: string) => {
    const cleanCnpj = cnpjValue.replace(/\D/g, "");

    if (cleanCnpj.length === 14) {
      setLoadingCnpj(true);
      try {
        const lookup = await fetchCnpjData(cleanCnpj);
        const companyData = lookup.status === "found" ? lookup.data : null;
        setLoadingCnpj(false);

        if (companyData) {
          const rawCep = companyData.cep;
          const formattedCep = rawCep
            ? maskCep(rawCep)
            : maskCep(form.getFieldValue("zipCode"));

          form.setFieldsValue({
            name: companyData.razao_social || form.getFieldValue("name"),
            tradeName:
              companyData.nome_fantasia || form.getFieldValue("tradeName"),
            phone:
              maskPhone(companyData.ddd_telefone_1) ||
              maskPhone(form.getFieldValue("phone")),
            nfeEmail: companyData.email || form.getFieldValue("nfeEmail"),
            zipCode: formattedCep,
            street: companyData.logradouro || form.getFieldValue("street"),
            number: companyData.numero || form.getFieldValue("number"),
            complement:
              companyData.complemento || form.getFieldValue("complement"),
            neighborhood:
              companyData.bairro || form.getFieldValue("neighborhood"),
            city: companyData.municipio || form.getFieldValue("city"),
            state: companyData.uf || form.getFieldValue("state"),
          });

          if (rawCep) {
            handleCepSearch(rawCep);
          }
        } else {
          message.warning(
            lookup.status === "not_found"
              ? "CNPJ não encontrado na Receita Federal."
              : "Consulta de CNPJ indisponível no momento. Preencha os dados manualmente.",
          );
        }
      } catch (err) {
        setLoadingCnpj(false);
        message.error("Erro ao buscar os dados do CNPJ.");
      }
    }
  };

  const handleCepSearch = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const addressData: any = await fetchCepData(cleanCep);
        setLoadingCep(false);

        if (addressData) {
          const street = addressData.street || addressData.logradouro;
          const neighborhood = addressData.neighborhood || addressData.bairro;
          const city =
            addressData.city || addressData.localidade || addressData.municipio;
          const state = addressData.state || addressData.uf;

          form.setFieldsValue({
            street: street || form.getFieldValue("street"),
            neighborhood: neighborhood || form.getFieldValue("neighborhood"),
            city: city || form.getFieldValue("city"),
            state: state || form.getFieldValue("state"),
          });
        } else {
          message.warning("CEP não encontrado.");
        }
      } catch (err) {
        setLoadingCep(false);
        message.error("Erro ao buscar os dados do CEP.");
      }
    }
  };

  const onSubmit = async (values: FormClientType) => {
    try {
      const formattedValues: ClientsResponse = {
        ...values,
        taxRegime: values.taxRegime,
        cnpj: values.cnpj ? values.cnpj.replace(/\D/g, "") : "",
        zipCode: values.zipCode ? values.zipCode.replace(/\D/g, "") : "",
        phone: values.phone ? values.phone.replace(/\D/g, "") : "",
        stateRegistration: values.stateRegistration
          ? Number(values.stateRegistration)
          : undefined,
        municipalRegistration: values.municipalRegistration
          ? Number(values.municipalRegistration)
          : undefined,
        isActive: values.isActive ?? true,
      };

      const response = await createClient(formattedValues);

      if (response) {
        openSuccessNotification({
          title: "Cliente criado com sucesso!",
        });
        navigate("/clients");
      }
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      const detail = Array.isArray(backendMessage)
        ? backendMessage.join(", ")
        : backendMessage || error.message;

      openErrorNotification({
        title: "Erro de Validação",
        description: `Não foi possível cadastrar o cliente: ${detail}`,
      });
    }
  };

  return {
    loadingCnpj,
    loadingCep,
    handleCnpjSearch,
    handleCepSearch,
    onSubmit,
    form,
  };
};

export default useCreateClient;
