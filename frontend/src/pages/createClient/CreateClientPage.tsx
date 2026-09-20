import { useNavigate } from "react-router-dom";
import DateComponent from "../../components/date/DateComponent";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import InputComponent from "../../components/input/InputComponent";
import { maskCPF } from "../../functions/maskCpf";
import { maskPhone } from "../../functions/maskPhone";
import * as S from './styles';
import type { FormItemType } from "./types";
import SelectComponent, { type SelectOption } from "../../components/selectButton/SelectComponent";
import useCreateUser from "../../hooks/users/useCreateUser";
import useListClients from "../../hooks/clients/useListClients";

const CreateClientPage = () => {
    const navigate = useNavigate();
    const { handleCreateUser, loading } = useCreateUser();
    const { clients } = useListClients();

    const clientOptions: SelectOption[] = clients
        .filter((client): client is typeof client & { id: string } => client.id !== undefined)
        .map((client) => ({
            label: client.name,
            value: client.id,
        }));

    const onSubmit = (values: any) => {
        const formattedValues = {
            ...values,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
        };

        handleCreateUser(formattedValues);
    };

    return (
        <S.PageWrapper>
            <S.PageHeader>
                <S.PageTitle>Nova empresa</S.PageTitle>
                <S.PageSubtitle>Preencha os dados abaixo para cadastrar uma nova empresa</S.PageSubtitle>
            </S.PageHeader>

            <S.FormCard>
                <FormComponent
                    name="createClient"
                    onFinish={onSubmit}
                    variant="underlined"
                >
                    <FormItemComponent<FormItemType>
                        name="name"
                        rules={[{ required: true, message: 'Preencha o nome da empresa' }]}
                        getValueFromEvent={(e) => e.target.value}
                        normalize={(value) => value}
                        layout="vertical"
                        label="Empresa"
                    >
                        <InputComponent placeholder="Ex: João da Silva" allowClear />
                    </FormItemComponent>

                    <FormItemComponent<FormItemType>
                        name="cnpj"
                        rules={[{ required: true, message: 'Preencha o cnpj da empresa' }]}
                        getValueFromEvent={(e) => e.target.value}
                        normalize={(value) => value}
                        layout="vertical"
                        label="CNPJ"
                    >
                        <InputComponent placeholder="Ex: seuemail@gmail.com" allowClear />
                    </FormItemComponent>

                    <S.FieldRow>
                        <FormItemComponent<FormItemType>
                            name="taxRegime"
                            rules={[{ required: true, message: 'Preencha o Regime Tributário da empresa' }]}
                            getValueFromEvent={(e) => maskCPF(e.target.value)}
                            normalize={(value) => maskCPF(value)}
                            layout="vertical"
                            label="Regime Tributário"
                        >
                            <InputComponent placeholder="Ex: 123.456.789-10" allowClear />
                        </FormItemComponent>
                    </S.FieldRow>

                    <S.ActionsRow>
                        <S.CancelButton type="button" onClick={() => navigate('/clients')}>Cancelar</S.CancelButton>
                        <S.SaveButton type="submit">Salvar usuário</S.SaveButton>
                    </S.ActionsRow>
                </FormComponent>
            </S.FormCard>
        </S.PageWrapper>
    );
};

export default CreateClientPage;