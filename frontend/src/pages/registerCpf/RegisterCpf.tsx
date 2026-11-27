import SubmitButton from "../../components/button/SubmitButton";
import { LeftOutlined, UserOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import * as S from "./styles";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import type { FieldType } from "../../common/types/field-input-type";
import { useNavigate, Link } from "react-router-dom";
import { maskLogin, normalizeLogin } from "../../functions/maskLogin";
import useRegisterCpf from "../../hooks/auth/userRegisterCpf";

const RegisterCpfPage = () => {
  const navigate = useNavigate();
  const { handleRegisterCpf, loading } = useRegisterCpf();

  const onFinish = (values: { username: string }) => {
    handleRegisterCpf(normalizeLogin(values.username));
  };

  return (
    <S.RegisterCpfPageWrapper>
      <S.RegisterCpfCardContainer>
        <LeftOutlined onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        <S.RegisterCpfSubtitle>Confirme o CPF ou e-mail</S.RegisterCpfSubtitle>

        <FormComponent
          name="confirmCpf"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          variant="underlined"
        >
          <FormItemComponent<FieldType>
            name="username"
            getValueFromEvent={(e) => maskLogin(e.target.value)}
            normalize={(value) => maskLogin(value)}
            rules={[
              { required: true, message: 'Por favor insira seu CPF ou e-mail!' },
              {
                validator: (_, value) =>
                  !value || /@/.test(value) || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)
                    ? Promise.resolve()
                    : Promise.reject(new Error('Informe um CPF com 11 dígitos ou um e-mail válido.')),
              },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="CPF ou e-mail"
            />
          </FormItemComponent>

          <FormItemComponent>
            <S.ButtonContainer>
              <SubmitButton
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ 
                  width: "100%", 
                  borderColor: "#16302A", 
                  background: "transparent",
                  color: "#16302A", 
                }}
              >
                Confirmar
              </SubmitButton>
              <S.RegisterLink>
                Já possui acesso? <Link to="/">Clique aqui!</Link>
              </S.RegisterLink>
            </S.ButtonContainer>
          </FormItemComponent>
        </FormComponent>
      </S.RegisterCpfCardContainer>
    </S.RegisterCpfPageWrapper>
  );
};

export default RegisterCpfPage;