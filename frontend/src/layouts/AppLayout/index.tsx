// src/layouts/AppLayout/index.tsx
import { useState } from "react";
import { Layout, Avatar, Dropdown, Typography } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet } from "react-router-dom";
import * as S from "./styles";
import Sidebar from "../../components/sidebar/SideBar";

const { Header, Content } = Layout;
const { Text } = Typography;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("@versatti:token");
    navigate("/login");
  };

  const userMenuItems = [
    { key: "logout", icon: <LogoutOutlined />, label: "Sair", onClick: handleLogout },
  ];

  return (
    <Layout style={{ height: "100vh" }}>
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
              <p>Olá, </p>
              <Text strong>Admin</Text>
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