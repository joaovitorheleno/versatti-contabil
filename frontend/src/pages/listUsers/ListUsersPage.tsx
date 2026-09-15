// src/pages/ListUsersPage/index.tsx
import { Table, Card, Avatar, Tag, Input, Typography } from "antd";
import { UserOutlined, SearchOutlined, TeamOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import useListUsers from "../../hooks/listUsers/useListUsers";
import * as S from "./styles";
import InputComponent from "../../components/input/InputComponent";

const { Title, Text } = Typography;

const formatCpf = (cpf: string) =>
  cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

const ListUsersPage = () => {
  const { loading, users, mensagem } = useListUsers();
  const [search, setSearch] = useState("");

  const mappedUsers = useMemo(
    () =>
      users
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
        }))
        .filter(
          (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
        ),
    [users, search]
  );

  const columns = [
    {
      title: "Usuário",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <S.UserCell>
          <Text strong>{name}</Text>
        </S.UserCell>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Text type="secondary">{email}</Text>,
    },
    {
      title: "CPF",
      dataIndex: "cpf",
      key: "cpf",
      render: (cpf: string) => (
        <Tag style={{ borderRadius: 4 }}>
          {formatCpf(cpf)}
        </Tag>
      ),
    },
  ];

  return (
    <S.ListUsersContainer>
      <Card
        bordered={false}
        style={{ borderRadius: 6, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
      >
        <S.HeaderRow>
          <div>
            <Title level={3} style={{ marginBottom: 0 }}>
              Usuários Cadastrados
            </Title>
            <Text type="secondary">{mappedUsers.length} usuário(s) encontrado(s)</Text>
          </div>

          <InputComponent
            placeholder="Buscar por nome ou email"
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            allowClear
            style={{ width: 280, borderRadius: 4 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </S.HeaderRow>

        <Table
          dataSource={mappedUsers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          style={{ marginTop: 16 }}
        />

        {mensagem && <Text type="secondary">{mensagem}</Text>}
      </Card>
    </S.ListUsersContainer>
  );
};

export default ListUsersPage;