import { Table, Card, Typography, Button, Dropdown, Drawer, type MenuProps } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined, SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import * as S from "./styles";
import InputComponent from "../../components/input/InputComponent";
import SubmitButton from "../../components/button/SubmitButton";
import { isAdmin } from "../../common/auth/user-is-admin";
import type { ColumnsType } from "antd/es/table";
import useListClients from "../../hooks/clients/useListClients";
import { maskCnpj } from "../../functions/maskCnpj";

const { Text } = Typography;

interface ClientTableData {
  id: string | number;
  name: string;
  cnpj: string;
  taxRegime: string;
}

const ListClientsPage = () => {
  const { 
    loading, 
    clients, 
    mensagem, 
    registerClient,
  } = useListClients();
  
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientTableData | null>(null);
  const admin = isAdmin();

  const handleEdit = (client: ClientTableData) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedClient(null);
  };

  const handleView = (client: ClientTableData) => {
    console.log("Visualizar cliente:", client);
  };

  const handleDelete = (client: ClientTableData) => {
    console.log("Deletar cliente:", client);
  };

  const mappedClients: ClientTableData[] = useMemo(
    () =>
      (clients || [])
        .map((client) => ({
          id: client.id ?? "",
          name: client.name || "",
          cnpj: client.cnpj || "",
          taxRegime: client.taxRegime || "",
        }))
        .filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.cnpj.toLowerCase().includes(search.toLowerCase())
        ),
    [clients, search]
  );

  const getActionMenuItems = (record: ClientTableData): MenuProps["items"] => [
    {
      key: "edit",
      label: <><EditOutlined /> Editar</>,
      onClick: () => handleEdit(record),
    },
    {
      key: "view",
      label: <><EyeOutlined /> Visualizar</>,
      onClick: () => handleView(record),
    },
    {
      key: "delete",
      label: <><DeleteOutlined /> Deletar</>,
      danger: true,
      onClick: () => handleDelete(record),
    },
  ];

  const columns: ColumnsType<ClientTableData> = [
    {
      title: "Empresa",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
      render: (client: string) => <Text strong>{client}</Text>,
    },
    {
      title: "CNPJ",
      dataIndex: "cnpj",
      key: "cnpj",
      sorter: (a, b) => (a.cnpj || "").localeCompare(b.cnpj || ""),
      render: (cnpj: string) => <Text type="secondary">{maskCnpj(cnpj)}</Text>,
    },
    {
      title: "Regime Tributário",
      dataIndex: "taxRegime",
      key: "taxRegime",
      width: 160,
      sorter: (a, b) => (a.taxRegime || "").localeCompare(b.taxRegime || ""),
      render: (taxRegime: string) => <Text>{taxRegime}</Text>,
    },
    {
      title: "Ação",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <S.ListClientsContainer>
      <Card
        bordered={false}
        style={{ borderRadius: 6, width: "100%", overflow: "hidden" }}
      >
        <S.HeaderRow>
          <S.SearchWrapper>
            <InputComponent
              placeholder="Buscar por Nome ou CNPJ"
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              allowClear
              style={{ borderRadius: 4, width: "100%" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {admin && (
              <SubmitButton
                htmlType="button"
                type="primary"
                style={{ backgroundColor: "#16302A" }}
                onClick={registerClient}
              >
                + Cadastrar Empresa
              </SubmitButton>
            )}
          </S.SearchWrapper>
        </S.HeaderRow>

        <Table
          dataSource={mappedClients}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, simple: true }}
          scroll={{ x: 500 }}
          showSorterTooltip={false}
          style={{ marginTop: 16, width: "100%" }}
        />

        {mensagem && <Text type="secondary">{mensagem}</Text>}
      </Card>

      <Drawer
        title="Editar Empresa"
        placement="right"
        width={400}
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
      >
        {selectedClient && (
          <div>
            <p><strong>Empresa:</strong> {selectedClient.name}</p>
            <p><strong>CNPJ:</strong> {selectedClient.cnpj}</p>
            <p><strong>Regime Tributário:</strong> {selectedClient.taxRegime}</p>
            {/* Adicione o formulário de edição aqui */}
          </div>
        )}
      </Drawer>
    </S.ListClientsContainer>
  );
};

export default ListClientsPage;