import { Layout, Menu } from "antd";
import {
  TeamOutlined,
  DashboardOutlined,
  FileTextOutlined,
  InsertRowLeftOutlined,
  TagsOutlined,
  NodeIndexOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import * as S from "./styles";
import { versattiIcon, versattiLogoTransparente } from "../../assets";
import { isAdmin } from "../../common/auth/user-is-admin";

const { Sider } = Layout;

const SIDEBAR_GREEN = "#14342b";

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/users", icon: <TeamOutlined />, label: "Usuários", adminOnly: true },
  { key: "/clients", icon: <InsertRowLeftOutlined />, label: "Clientes" },
  { key: "/relatorios", icon: <FileTextOutlined />, label: "Relatórios" },
  { key: "/documents", icon: <FileTextOutlined />, label: "Documentos" },
  { key: "/processes", icon: <NodeIndexOutlined />, label: "Processos" },
  { key: "/tickets", icon: <CustomerServiceOutlined />, label: "Atendimento" },
  {
    key: "/document-types",
    icon: <TagsOutlined />,
    label: "Tipos de Documento",
    adminOnly: true,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
  isMobile?: boolean;
}

const Sidebar = ({ collapsed, onCollapse, isMobile = false }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = menuItems
    .filter((item) => !item.adminOnly || isAdmin())
    .map(({ adminOnly, ...item }) => item);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) onCollapse(true);
  };

  return (
    <>
      {isMobile && !collapsed && <S.Backdrop onClick={() => onCollapse(true)} />}

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        trigger={null}
        width={isMobile ? 220 : 240}
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          background: SIDEBAR_GREEN,
          overflow: "auto",
          ...(isMobile && {
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 1000,
          }),
        }}
      >
        <S.Logo $collapsed={collapsed}>
          <img
            src={collapsed ? versattiIcon : versattiLogoTransparente}
            alt="Versatti"
          />
        </S.Logo>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={visibleItems}
          onClick={handleMenuClick}
          style={{ background: SIDEBAR_GREEN }}
        />
      </Sider>
    </>
  );
};

export default Sidebar;
