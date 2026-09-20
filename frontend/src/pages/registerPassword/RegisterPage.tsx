import SubmitButton from "../../components/button/SubmitButton"
import { LeftOutlined, LockOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import * as S from "./styles"
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import type { FieldType } from "../../common/types/field-input-type";
import { useRegisterPassword } from "../../hooks/auth/useRegisterPassword";

const RegisterPasswordPage = () => {
    const {
        handleCreatePassword
    } = useRegisterPassword();

    return (
        <S.RegisterPasswordPageWrapper>
            <S.RegisterPasswordCardContainer>
                <LeftOutlined onClick={() => {window.location.href = '/confirmCpf'; }}/>
                <S.RegisterPasswordSubtitle>Defina uma senha</S.RegisterPasswordSubtitle>

                <FormComponent
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={(values) => {handleCreatePassword(values.password, values.confirmPassword)}}
                    variant="underlined"
                >
                    <FormItemComponent<FieldType>
                        name="password"
                        rules={[{ required: true, message: 'Por favor insira sua senha!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
                    </FormItemComponent>

                    <FormItemComponent<FieldType>
                        name="confirmPassword"
                        rules={[{ required: true, message: 'Por favor confirme sua senha!' }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Confirmar Senha"  
                        />
                    </FormItemComponent>

                    <FormItemComponent>
                        <S.ButtonContainer>
                            <SubmitButton
                                htmlType="submit"
                                type="primary"
                                children="Definir Senha"
                                style={{ 
                                    width: "100%", 
                                    borderColor: "#16302A", 
                                    background: "transparent",
                                    color: "#16302A", 
                                }}
                            />
                        </S.ButtonContainer>
                    </FormItemComponent>
                </FormComponent>
            </S.RegisterPasswordCardContainer>
        </S.RegisterPasswordPageWrapper>
    )
}

export default RegisterPasswordPage