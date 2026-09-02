import SubmitButton from "../../components/button/SubmitButton";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import * as S from "./styles";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import type { FieldType } from "../../common/types/field-input-type";
import useLogin from "../../hooks/login/useLogin";
import { Link } from "react-router-dom";
import InputComponent from "../../components/input/InputComponent";
import { maskCPF } from "../../functions/maskCpf";

const LoginPage = () => {
  const {
    loading, 
    handleLogin
  } = useLogin();

  const onFinish = (values: { username: string; password: string }) => {
    const rawCpf = values.username.replace(/\D/g, '');
    handleLogin(rawCpf, values.password);
  };

  return (
    <S.LoginPageWrapper>
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
            rules={[{ required: true, message: 'Por favor digite seu CPF!' }]}
            getValueFromEvent={(e) => maskCPF(e.target.value)}
            normalize={(value) => maskCPF(value)}
          >
            <InputComponent 
              prefix={<UserOutlined />} 
              placeholder="000.000.000-00"
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
                  borderColor: "#16302A", 
                  background: "transparent",
                  color: "#16302A", 
                }}
              />
              <S.RegisterLink>
                Primeiro acesso? <Link to="/confirmCpf">Clique aqui!</Link>
              </S.RegisterLink>
            </S.ButtonContainer>
          </FormItemComponent>
        </FormComponent>
      </S.LoginCardContainer>
    </S.LoginPageWrapper>
  );
};

export default LoginPage;