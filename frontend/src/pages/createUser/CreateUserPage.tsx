import { useNavigate } from "react-router-dom";
import DateComponent from "../../components/date/DateComponent";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import InputComponent from "../../components/input/InputComponent";
import { maskCPF } from "../../functions/maskCpf";
import { maskPhone } from "../../functions/maskPhone";
import * as S from "./styles";
import type { FormItemType } from "./types";
import SelectComponent, {
  type SelectOption,
} from "../../components/selectButton/SelectComponent";
import useCreateUser from "../../hooks/users/useCreateUser";
import useListClients from "../../hooks/clients/useListClients";

const CreateUserPage = () => {
  const navigate = useNavigate();
  const { handleCreateUser } = useCreateUser();
  const { clients } = useListClients();

  const clientOptions: SelectOption[] = clients
    .filter(
      (client): client is typeof client & { id: string } =>
        client.id !== undefined,
    )
    .map((client) => ({
      label: client.name,
      value: client.id,
    }));
 
  const onSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth.format("YYYY-MM-DD")
        : undefined,
    };

    handleCreateUser(formattedValues);
  };

  return (
    <S.PageWrapper>
      <S.PageHeader>
        <S.PageTitle>Novo usuário</S.PageTitle>
        <S.PageSubtitle>
          Preencha os dados abaixo para cadastrar um novo usuário
        </S.PageSubtitle>
      </S.PageHeader>

      <S.FormCard>
        <FormComponent
          name="createUser"
          onFinish={onSubmit}
          variant="underlined"
        >
          <FormItemComponent<FormItemType>
            name="name"
            rules={[{ required: true, message: "Preencha o nome do usuário" }]}
            getValueFromEvent={(e) => e.target.value}
            normalize={(value) => value}
            layout="vertical"
            label="Nome"
          >
            <InputComponent placeholder="Ex: João da Silva" allowClear />
          </FormItemComponent>

          <FormItemComponent<FormItemType>
            name="email"
            rules={[{ required: true, message: "Preencha o email do usuário" }]}
            getValueFromEvent={(e) => e.target.value}
            normalize={(value) => value}
            layout="vertical"
            label="Email"
          >
            <InputComponent placeholder="Ex: seuemail@gmail.com" allowClear />
          </FormItemComponent>

          <S.FieldRow>
            <FormItemComponent<FormItemType>
              name="cpf"
              rules={[{ required: true, message: "Preencha o CPF do usuário" }]}
              getValueFromEvent={(e) => maskCPF(e.target.value)}
              normalize={(value) => maskCPF(value)}
              layout="vertical"
              label="CPF"
            >
              <InputComponent placeholder="Ex: 123.456.789-10" allowClear />
            </FormItemComponent>

            <FormItemComponent<FormItemType>
              name="phone"
              rules={[
                { required: true, message: "Preencha o telefone do usuário" },
              ]}
              getValueFromEvent={(e) => maskPhone(e.target.value)}
              normalize={(value) => maskPhone(value)}
              layout="vertical"
              label="Telefone"
            >
              <InputComponent placeholder="Ex: (31) 9 98765-4321" allowClear />
            </FormItemComponent>
          </S.FieldRow>

          <S.DateFieldWrapper>
            <FormItemComponent<FormItemType>
              name="dateOfBirth"
              rules={[
                { required: true, message: "Por favor selecione a data!" },
              ]}
              layout="vertical"
              label="Data de nascimento"
            >
              <DateComponent />
            </FormItemComponent>

            <FormItemComponent<FormItemType>
              name="clientIds"
              rules={[
                {
                  required: true,
                  message:
                    "Por favor selecione as empresas que o usuário pertence!",
                },
              ]}
              layout="vertical"
              label="Empresas"
            >
              <SelectComponent
                mode="multiple"
                placeholder="Selecione as empresas para este usuário"
                options={clientOptions}
              />
            </FormItemComponent>
          </S.DateFieldWrapper>

          <S.ActionsRow>
            <S.CancelButton type="button" onClick={() => navigate("/users")}>
              Cancelar
            </S.CancelButton>
            <S.SaveButton type="submit">Salvar usuário</S.SaveButton>
          </S.ActionsRow>
        </FormComponent>
      </S.FormCard>
    </S.PageWrapper>
  );
};

export default CreateUserPage;
