import SubmitButton from "../../components/button/SubmitButton";
import { LeftOutlined, UserOutlined } from '@ant-design/icons';
import * as S from "./styles";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import type { FieldType } from "../../common/types/field-input-type";
import { useNavigate } from "react-router-dom";
import InputComponent from "../../components/input/InputComponent";
import { useRecoverPassword } from "../../hooks/recoverPassword/useRecoverPassword";

const RecoverPasswordPage = () => {
  const { loading, handleForgotPassword } = useRecoverPassword();
  const navigate = useNavigate();

  const onFinish = (email: string) => {
    handleForgotPassword(email);
  };

  return (
    <S.RecoverPasswordPageWrapper>
      <S.RecoverPasswordCardContainer>
        <LeftOutlined onClick={() => navigate('/login')} style={{ cursor: 'pointer' }} />
        <S.RecoverPasswordTitle>Insira o e-mail para recuperação</S.RecoverPasswordTitle>
        <S.RecoverPasswordSubtitle></S.RecoverPasswordSubtitle>

        <FormComponent
          name="email"
          initialValues={{ remember: true }}
          onFinish={(values: { email: string }) => onFinish(values.email)}
          variant="underlined"
        >
          <FormItemComponent<FieldType>
            name="email"
            rules={[{ required: true, message: 'Por favor digite seu E-mail!' }]}
          >
            <InputComponent 
              prefix={<UserOutlined />} 
              placeholder="seuemailrecuperacao@gmail.com"
            />
          </FormItemComponent>

          <FormItemComponent>
            <S.ButtonContainer>
              <SubmitButton
                type="primary"
                htmlType="submit"
                loading={loading}
                children="Recuperar Senha"
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
      </S.RecoverPasswordCardContainer>
    </S.RecoverPasswordPageWrapper>
  );
};

export default RecoverPasswordPage;