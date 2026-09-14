import SubmitButton from "../../components/button/SubmitButton";
import { LockOutlined } from '@ant-design/icons';
import * as S from "./styles";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import type { FieldType } from "../../common/types/field-input-type";
import { Input } from "antd";
import useChangePassword from "../../hooks/changePassword/useChangePassword";
import { versattiIcon } from "../../assets";

const ResetPasswordPage = () => {
  const { loading, handleResetPassword } = useChangePassword();

  const onFinish = (password: string, newPassword: string) => {
    handleResetPassword(password, newPassword);
  };

  return (
    <S.ResetPasswordPageWrapper>
      <S.ResetPasswordCardContainer>
        <S.ResetPasswordTitle>Insira sua nova senha</S.ResetPasswordTitle>
        <S.ResetPasswordSubtitle></S.ResetPasswordSubtitle>

        <FormComponent
          name="password"
          initialValues={{ remember: true }}
          onFinish={(values: { password: string, confirmPassword: string }) => onFinish(values.password, values.confirmPassword)}
          variant="underlined"
        >
          <FormItemComponent<FieldType>
            name="password"
            rules={[{ required: true, message: 'Por favor digite sua nova senha!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nova Senha" />
          </FormItemComponent>

          <FormItemComponent<FieldType>
            name="confirmPassword"
            rules={[{ required: true, message: 'Por favor confirme sua senha!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Senha" />
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
      </S.ResetPasswordCardContainer>
    </S.ResetPasswordPageWrapper>
  );
};

export default ResetPasswordPage;