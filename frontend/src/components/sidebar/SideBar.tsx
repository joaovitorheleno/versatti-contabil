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
}

const Sidebar = ({ collapsed, onCollapse }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = menuItems
    .filter((item) => !item.adminOnly || isAdmin())
    .map(({ adminOnly, ...item }) => item);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={240}
      style={{ background: SIDEBAR_GREEN }}
    >
      <S.Logo>
        {collapsed ? (
          <img src={versattiIcon}></img>
        ) : (
          <img src={versattiLogoTransparente} height={50}></img>
        )}
      </S.Logo>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={visibleItems}
        onClick={({ key }) => navigate(key)}
        style={{ background: SIDEBAR_GREEN }}
      />
    </Sider>
  );
};

export default Sidebar;
