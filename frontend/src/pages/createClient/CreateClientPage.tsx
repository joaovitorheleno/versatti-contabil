import { Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { TaxRegimeEnum } from "../../common/enum/tax-regime.enum";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import InputComponent from "../../components/input/InputComponent";
import SelectComponent, {
  type SelectOption,
} from "../../components/selectButton/SelectComponent";
import { maskCnpj } from "../../functions/maskCnpj";
import { maskCep } from "../../functions/maskCep";
import * as S from "./styles";
import type { FormClientType } from "./types";
import { maskPhone } from "../../functions/maskPhone";
import useCreateClient from "../../hooks/clients/useCreateClient";

const taxRegimeLabels: Record<TaxRegimeEnum, string> = {
  [TaxRegimeEnum.SIMPLES_NACIONAL]: "Simples Nacional",
  [TaxRegimeEnum.LUCRO_PRESUMIDO]: "Lucro Presumido",
  [TaxRegimeEnum.LUCRO_REAL]: "Lucro Real",
  [TaxRegimeEnum.MEI]: "Microempreendedor Individual (MEI)",
};

const CreateClientPage = () => {
  const navigate = useNavigate();

  const {
    loadingCnpj,
    loadingCep,
    handleCnpjSearch,
    handleCepSearch,
    onSubmit,
    form,
  } = useCreateClient();

  const options: SelectOption[] = Object.values(TaxRegimeEnum).map((tax) => ({
    label: taxRegimeLabels[tax],
    value: tax,
  }));

  return (
    <S.PageWrapper>
      <S.PageHeader>
        <S.PageTitle>Nova empresa</S.PageTitle>
        <S.PageSubtitle>
          Preencha os dados abaixo para cadastrar uma nova empresa
        </S.PageSubtitle>
      </S.PageHeader>

      <S.FormCard>
        <FormComponent
          form={form}
          name="createClient"
          onFinish={onSubmit}
          variant="underlined"
          initialValues={{ isActive: true }}
        >
          <S.FieldRow>
            <Spin spinning={loadingCnpj}>
              <FormItemComponent<FormClientType>
                name="cnpj"
                rules={[{ required: true, message: "Preencha o CNPJ" }]}
                getValueFromEvent={(e) => {
                  const masked = maskCnpj(e.target.value);
                  handleCnpjSearch(masked);
                  return masked;
                }}
                normalize={(value) => maskCnpj(value)}
                layout="vertical"
                label="CNPJ"
              >
                <InputComponent
                  placeholder="Ex: 10.234.456/0001-10"
                  maxLength={18}
                  allowClear
                />
              </FormItemComponent>
            </Spin>

            <FormItemComponent<FormClientType>
              name="taxRegime"
              rules={[
                { required: true, message: "Selecione o Regime Tributário" },
              ]}
              getValueFromEvent={(value) => value}
              layout="vertical"
              label="Regime Tributário"
            >
              <SelectComponent
                placeholder="Selecione o regime tributário"
                options={options}
              />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <FormItemComponent<FormClientType>
              name="name"
              rules={[{ required: true, message: "Preencha a Razão Social" }]}
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Razão Social"
            >
              <InputComponent placeholder="Ex: Empresa Teste LTDA" allowClear />
            </FormItemComponent>

            <FormItemComponent<FormClientType>
              name="tradeName"
              rules={[{ required: true, message: "Preencha o Nome Fantasia" }]}
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Nome Fantasia"
            >
              <InputComponent placeholder="Ex: Tech Solutions" allowClear />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <FormItemComponent<FormClientType>
              name="stateRegistration"
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Inscrição Estadual"
            >
              <InputComponent placeholder="Ex: 0269525307" allowClear />
            </FormItemComponent>

            <FormItemComponent<FormClientType>
              name="municipalRegistration"
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Inscrição Municipal"
            >
              <InputComponent placeholder="Ex: 1234560018" allowClear />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <FormItemComponent<FormClientType>
              name="phone"
              rules={[
                { required: true, message: "Preencha o telefone de contato" },
              ]}
              getValueFromEvent={(e) => {
                const masked = maskPhone(e.target.value);
                return masked;
              }}
              normalize={(value) => maskPhone(value)}
              layout="vertical"
              label="Telefone"
            >
              <InputComponent
                placeholder="Ex: (31) 99999-9999"
                maxLength={15}
                allowClear
              />
            </FormItemComponent>

            <FormItemComponent<FormClientType>
              name="contactPerson"
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Pessoa de Contato"
            >
              <InputComponent placeholder="Ex: João da Silva" allowClear />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <FormItemComponent<FormClientType>
              name="nfeEmail"
              rules={[{ type: "email", message: "Insira um e-mail válido" }]}
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="E-mail para NF-e"
            >
              <InputComponent placeholder="Ex: nfe@empresa.com.br" allowClear />
            </FormItemComponent>

            <FormItemComponent<FormClientType>
              name="responsibleEmail"
              rules={[{ type: "email", message: "Insira um e-mail válido" }]}
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="E-mail do responsável"
              extra="Recebe por e-mail os documentos enviados para esta empresa"
            >
              <InputComponent
                placeholder="Ex: responsavel@empresa.com.br"
                allowClear
              />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <Spin spinning={loadingCep}>
              <FormItemComponent<FormClientType>
                name="zipCode"
                rules={[{ required: true, message: "Preencha o CEP" }]}
                getValueFromEvent={(e) => {
                  const masked = maskCep(e.target.value);
                  handleCepSearch(masked);
                  return masked;
                }}
                normalize={(value) => maskCep(value)}
                layout="vertical"
                label="CEP"
              >
                <InputComponent
                  placeholder="Ex: 30100-000"
                  maxLength={9}
                  allowClear
                />
              </FormItemComponent>
            </Spin>

            <FormItemComponent<FormClientType>
              name="street"
              rules={[{ required: true, message: "Preencha o logradouro" }]}
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Rua / Logradouro"
            >
              <InputComponent placeholder="Ex: Av. Afonso Pena" allowClear />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <FormItemComponent<FormClientType>
              name="number"
              rules={[{ required: true, message: "Preencha o número" }]}
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Número"
            >
              <InputComponent placeholder="Ex: 1000" allowClear />
            </FormItemComponent>

            <FormItemComponent<FormClientType>
              name="complement"
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Complemento"
            >
              <InputComponent placeholder="Ex: Sala 501" allowClear />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <FormItemComponent<FormClientType>
              name="neighborhood"
              rules={[{ required: true, message: "Preencha o bairro" }]}
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Bairro"
            >
              <InputComponent placeholder="Ex: Centro" allowClear />
            </FormItemComponent>

            <FormItemComponent<FormClientType>
              name="city"
              rules={[{ required: true, message: "Preencha a cidade" }]}
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Cidade"
            >
              <InputComponent placeholder="Ex: Belo Horizonte" allowClear />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <FormItemComponent<FormClientType>
              name="state"
              rules={[{ required: true, message: "Preencha a UF do estado" }]}
              getValueFromEvent={(e) => e.target.value}
              layout="vertical"
              label="Estado (UF)"
            >
              <InputComponent placeholder="Ex: MG" allowClear maxLength={2} />
            </FormItemComponent>
          </S.FieldRow>

          <S.ActionsRow>
            <S.CancelButton type="button" onClick={() => navigate("/clients")}>
              Cancelar
            </S.CancelButton>
            <S.SaveButton type="submit">Salvar empresa</S.SaveButton>
          </S.ActionsRow>
        </FormComponent>
      </S.FormCard>
    </S.PageWrapper>
  );
};

export default CreateClientPage;
