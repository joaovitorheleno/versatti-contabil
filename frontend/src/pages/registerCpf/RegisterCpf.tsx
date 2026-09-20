import SubmitButton from "../../components/button/SubmitButton";
import { LeftOutlined, UserOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import * as S from "./styles";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import type { FieldType } from "../../common/types/field-input-type";
import { useNavigate, Link } from "react-router-dom";
import { maskCPF } from "../../functions/maskCpf";
import useRegisterCpf from "../../hooks/auth/userRegisterCpf";

const RegisterCpfPage = () => {
  const navigate = useNavigate();
  const { handleRegisterCpf, loading } = useRegisterCpf();

  const onFinish = (values: { username: string }) => {
    const rawCpf = values.username.replace(/\D/g, '');
    handleRegisterCpf(rawCpf);
  };

  return (
    <S.RegisterCpfPageWrapper>
      <S.RegisterCpfCardContainer>
        <LeftOutlined onClick={() => navigate('/login')} style={{ cursor: 'pointer' }} />
        <S.RegisterCpfSubtitle>Confirme o CPF</S.RegisterCpfSubtitle>

        <FormComponent
          name="confirmCpf"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          variant="underlined"
        >
          <FormItemComponent<FieldType>
            name="username"
            getValueFromEvent={(e) => maskCPF(e.target.value)}
            normalize={(value) => maskCPF(value)}
            rules={[
              { required: true, message: 'Por favor insira seu CPF!' },
              { 
                pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 
                message: 'Informe um CPF válido contendo 11 dígitos.' 
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="000.000.000-00" 
              maxLength={14}
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
                Já possui acesso? <Link to="/login">Clique aqui!</Link>
              </S.RegisterLink>
            </S.ButtonContainer>
          </FormItemComponent>
        </FormComponent>
      </S.RegisterCpfCardContainer>
    </S.RegisterCpfPageWrapper>
  );
};

export default RegisterCpfPage;