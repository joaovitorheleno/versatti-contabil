import { Layout, Menu } from "antd";
import {
  TeamOutlined,
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import * as S from "./styles";
import { versattiIcon, versattiLogo, versattiLogoTransparente } from "../../assets";

const { Sider } = Layout;

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/users", icon: <TeamOutlined />, label: "Usuários" },
  { key: "/relatorios", icon: <FileTextOutlined />, label: "Relatórios" },
  { key: "/configuracoes", icon: <SettingOutlined />, label: "Configurações" },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (value: boolean) => void;
}

const Sidebar = ({ collapsed, onCollapse }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={240}
      style={{ background: "#0f172a" }}
    >
      <S.Logo>{collapsed ? <img src={versattiIcon}></img> : <img src={versattiLogoTransparente} height={50}></img>}</S.Logo>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ background: "#0f172a" }}
      />
    </Sider>
  );
};

export default Sidebar;