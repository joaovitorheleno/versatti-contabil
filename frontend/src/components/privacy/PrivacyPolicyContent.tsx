import { Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

export const PRIVACY_CONTACT_EMAIL = "versatticontabil@gmail.com";

const PrivacyPolicyContent = () => (
  <div style={{ fontSize: 14, lineHeight: 1.6 }}>
    <Paragraph type="secondary">
      Versão 2026-10 · vigente a partir de outubro de 2026
    </Paragraph>

    <Title level={5}>1. Quem somos</Title>
    <Paragraph>
      Este sistema é operado pela <Text strong>Versatti Contabilidade</Text>,
      controladora dos dados pessoais tratados aqui, nos termos da Lei Geral de
      Proteção de Dados (Lei nº 13.709/2018 — LGPD).
    </Paragraph>

    <Title level={5}>2. Quais dados tratamos</Title>
    <Paragraph>
      Dados de cadastro dos usuários (nome, CPF, e-mail, telefone e data de
      nascimento); dados das empresas atendidas (razão social, CNPJ, endereço,
      contatos); documentos fiscais, societários e trabalhistas enviados pelo
      escritório ou pelo cliente; mensagens de atendimento; e registros de
      acesso (data, hora, IP e ações realizadas).
    </Paragraph>

    <Title level={5}>3. Para que usamos os dados</Title>
    <Paragraph>
      Para prestar os serviços contábeis contratados, cumprir obrigações legais
      e regulatórias (fiscais, trabalhistas e contábeis), enviar documentos e
      avisos de vencimento, atender solicitações e garantir a segurança do
      sistema. As bases legais são a execução de contrato, o cumprimento de
      obrigação legal e o legítimo interesse (art. 7º da LGPD).
    </Paragraph>

    <Title level={5}>4. Com quem compartilhamos</Title>
    <Paragraph>
      Com órgãos públicos quando exigido por lei (Receita Federal, Juntas
      Comerciais, prefeituras e demais órgãos de registro e fiscalização) e com
      prestadores de infraestrutura que operam o sistema — hospedagem, banco de
      dados e envio de e-mails —, sempre limitados ao necessário para o serviço.
      Não vendemos dados pessoais.
    </Paragraph>

    <Title level={5}>5. Segurança e retenção</Title>
    <Paragraph>
      O acesso é restrito por login e perfil: cada cliente vê somente as
      próprias empresas. Senhas são armazenadas criptografadas, a comunicação é
      feita por HTTPS e os acessos são registrados. Documentos são mantidos pelo
      prazo exigido pela legislação aplicável (em geral, no mínimo 5 anos para
      documentos fiscais) e os registros de acesso por pelo menos 6 meses (Marco
      Civil da Internet, art. 15).
    </Paragraph>

    <Title level={5}>6. Seus direitos</Title>
    <Paragraph>
      Você pode, a qualquer momento: confirmar a existência de tratamento,
      acessar seus dados, corrigir dados incompletos ou desatualizados,
      solicitar anonimização, bloqueio ou eliminação de dados desnecessários,
      solicitar portabilidade e obter informações sobre compartilhamento (art.
      18 da LGPD). Uma cópia dos seus dados pode ser baixada no menu do usuário,
      em <Text strong>Meus dados (LGPD)</Text>. Dados exigidos por obrigação
      legal podem precisar ser mantidos mesmo após um pedido de exclusão.
    </Paragraph>

    <Title level={5}>7. Contato</Title>
    <Paragraph>
      Dúvidas e solicitações sobre seus dados:{" "}
      <Text strong>{PRIVACY_CONTACT_EMAIL}</Text> ou pela tela de Atendimento do
      sistema.
    </Paragraph>

    <Title level={5}>8. Alterações</Title>
    <Paragraph>
      Esta política pode ser atualizada. Quando houver mudança, uma nova versão
      será exibida e o aceite será solicitado novamente no próximo acesso.
    </Paragraph>
  </div>
);

export default PrivacyPolicyContent;
