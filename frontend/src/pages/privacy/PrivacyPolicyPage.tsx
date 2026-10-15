import { Card, Typography } from "antd";
import { Link } from "react-router-dom";
import PrivacyPolicyContent from "../../components/privacy/PrivacyPolicyContent";

const PrivacyPolicyPage = () => (
  <div style={{ minHeight: "100vh", background: "#f4f6f9", padding: "32px 16px" }}>
    <Card style={{ maxWidth: 820, margin: "0 auto", borderRadius: 12 }} variant="borderless">
      <Typography.Title level={3} style={{ fontFamily: "Georgia, serif", color: "#12231c" }}>
        Política de Privacidade
      </Typography.Title>
      <PrivacyPolicyContent />
      <Link to="/">Voltar para o sistema</Link>
    </Card>
  </div>
);

export default PrivacyPolicyPage;
