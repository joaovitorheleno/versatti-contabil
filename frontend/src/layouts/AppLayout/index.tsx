import { useState } from "react";
import { Layout, Dropdown, Typography } from "antd";
import {
  FileProtectOutlined,
  LogoutOutlined,
  SafetyOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet } from "react-router-dom";
import * as S from "./styles";
import Sidebar from "../../components/sidebar/SideBar";
import { loggedUser } from "../../common/auth/logged-user";
import TermsGate from "../../components/privacy/TermsGate";
import { openErrorNotification } from "../../components/notification/error";
import { getMyData } from "../../service/privacy/integration";

const { Header, Content } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("@versatti:token");
    navigate("/");
  };

  const downloadMyData = async () => {
    try {
      const data = await getMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meus-dados-versatti-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e: any) {
      openErrorNotification({
        title: "Não foi possível exportar seus dados",
        description: e?.response?.data?.message || e?.message || String(e),
      });
    }
  };

  const userMenuItems = [
    { key: "my-data", icon: <SafetyOutlined />, label: "Meus dados (LGPD)", onClick: downloadMyData },
    {
      key: "privacy",
      icon: <FileProtectOutlined />,
      label: "Política de privacidade",
      onClick: () => window.open("/privacidade", "_blank", "noopener"),
    },
    { type: "divider" as const },
    { key: "logout", icon: <LogoutOutlined />, label: "Sair", onClick: handleLogout, danger: true, },
  ];

  const user = loggedUser();

  const userName = user?.info?.name || (user as any)?.nome || "Usuário";

  return (
    <Layout style={{ height: "100vh" }}>
      <TermsGate onLogout={handleLogout} />
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout style={{ height: "100vh" }}>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <S.CollapseButton onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </S.CollapseButton>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <S.UserArea>
              <p>Bem vindo ao painel admnistrativo, </p>
              <Text strong>{userName}</Text>
            </S.UserArea>
          </Dropdown>
        </Header>

        <Content
          style={{
            flex: 1,
            padding: "24px",
            overflow: "auto",
            background: "#f4f6f9",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;