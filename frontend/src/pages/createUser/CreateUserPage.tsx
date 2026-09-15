import { useNavigate } from "react-router-dom"
import DateComponent from "../../components/date/DateComponent"
import FormComponent from "../../components/form/FormComponent"
import FormItemComponent from "../../components/form/FormItemComponent"
import InputComponent from "../../components/input/InputComponent"
import { maskCPF } from "../../functions/maskCpf"
import { maskPhone } from "../../functions/maskPhone"
import * as S from './styles'
import type { FormItemType } from "./types"
import useCreateUser from "../../hooks/createUser/useCreateUser"

const CreateUserPage = () => {
    const navigate = useNavigate();

    const {handleCreateUser, loading} = useCreateUser();



    return (
        <S.PageWrapper>
            <S.PageHeader>
                <S.PageTitle>Novo usuário</S.PageTitle>
                <S.PageSubtitle>Preencha os dados abaixo para cadastrar um novo usuário</S.PageSubtitle>
            </S.PageHeader>

            <S.FormCard>
                <FormComponent
                    name="createUser"
                    onFinish={handleCreateUser}
                    variant="underlined"
                >
                    <FormItemComponent<FormItemType>
                        name="name"
                        rules={[{ required: true, message: 'Preencha o nome do usuário' }]}
                        getValueFromEvent={(e) => e.target.value}
                        normalize={(value) => value}
                        layout="vertical"
                        label="Nome"
                    >
                        <InputComponent placeholder="Ex: João da Silva" allowClear />
                    </FormItemComponent>

                    <FormItemComponent<FormItemType>
                        name="email"
                        rules={[{ required: true, message: 'Preencha o email do usuário' }]}
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
                            rules={[{ required: true, message: 'Preencha o CPF do usuário' }]}
                            getValueFromEvent={(e) => maskCPF(e.target.value)}
                            normalize={(value) => maskCPF(value)}
                            layout="vertical"
                            label="CPF"
                        >
                            <InputComponent placeholder="Ex: 123.456.789-10" allowClear />
                        </FormItemComponent>

                        <FormItemComponent<FormItemType>
                            name="phone"
                            rules={[{ required: true, message: 'Preencha o telefone do usuário' }]}
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
                            rules={[{ required: true, message: 'Por favor selecione a data!' }]}
                            layout="vertical"
                            label="Data de nascimento"
                        >
                            <DateComponent />
                        </FormItemComponent>
                    </S.DateFieldWrapper>

                    <S.ActionsRow>
                        <S.CancelButton type="button" onClick={() => navigate('/users')}>Cancelar</S.CancelButton>
                        <S.SaveButton type="submit">Salvar usuário</S.SaveButton>
                    </S.ActionsRow>
                </FormComponent>
            </S.FormCard>
        </S.PageWrapper>
    )
}

export default CreateUserPage