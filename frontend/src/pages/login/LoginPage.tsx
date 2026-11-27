import SubmitButton from "../../components/button/SubmitButton";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import * as S from "./styles";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import type { FieldType } from "../../common/types/field-input-type";
import useLogin from "../../hooks/auth/useLogin";
import { Link } from "react-router-dom";
import InputComponent from "../../components/input/InputComponent";
import { maskLogin, normalizeLogin } from "../../functions/maskLogin";
import { versattiIcon } from "../../assets";

const LoginPage = () => {
  const {
    loading,
    handleLogin
  } = useLogin();

  const onFinish = (values: { username: string; password: string }) => {
    handleLogin(normalizeLogin(values.username), values.password);
  };

  return (
    <S.LoginPageWrapper>
      <S.BrandPanel>
        <S.BrandContent>
          <img src={versattiIcon} style={{ height: '40vh', width: 'auto' }} />
          <S.BrandTagline>
            Sua gestão financeira,<br />contabil e pessoal,<br />sem complicação.
          </S.BrandTagline>
        </S.BrandContent>
      </S.BrandPanel>

      <S.FormPanel>
        <S.LoginCardContainer>
          <S.LoginTitle>Bem-vindo</S.LoginTitle>
          <S.LoginSubtitle>Acesse sua conta para continuar</S.LoginSubtitle>

          <FormComponent
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            variant="underlined"
          >
            <FormItemComponent<FieldType>
              name="username"
              rules={[{ required: true, message: 'Por favor digite seu CPF ou e-mail!' }]}
              getValueFromEvent={(e) => maskLogin(e.target.value)}
              normalize={(value) => maskLogin(value)}
            >
              <InputComponent
                prefix={<UserOutlined />}
                placeholder="CPF ou e-mail"
              />
            </FormItemComponent>

            <FormItemComponent<FieldType>
              name="password"
              rules={[{ required: true, message: 'Por favor insira sua senha!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Senha"
              />
            </FormItemComponent>

            <FormItemComponent>
              <S.ButtonContainer>
                <SubmitButton
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  children="Entrar"
                  style={{
                    width: "100%",
                    border: "none",
                    background: "#16302A",
                    color: "#FAFAF8",
                  }}
                />
                <S.RegisterLink>
                  Primeiro acesso? <Link to="/confirmCpf">Clique aqui!</Link>
                </S.RegisterLink>
                <S.RegisterLink>
                  Esqueceu a senha? <Link to="/recoverPassword">Recuperar senha</Link>
                </S.RegisterLink>
              </S.ButtonContainer>
            </FormItemComponent>
          </FormComponent>
        </S.LoginCardContainer>
      </S.FormPanel>
    </S.LoginPageWrapper>
  );
};

export default LoginPage;