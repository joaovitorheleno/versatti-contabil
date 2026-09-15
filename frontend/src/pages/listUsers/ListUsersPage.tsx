import { Table, Card, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import useListUsers from "../../hooks/listUsers/useListUsers";
import * as S from "./styles";
import InputComponent from "../../components/input/InputComponent";
import { maskPhone } from "../../functions/maskPhone";
import { maskCPF } from "../../functions/maskCpf";
import { maskDate } from "../../functions/maskDate";
import SubmitButton from "../../components/button/SubmitButton";

const { Text } = Typography;

const ListUsersPage = () => {
  const { loading, users, mensagem, registerUser } = useListUsers();
  const [search, setSearch] = useState("");

  const mappedUsers = useMemo(
    () =>
      (users || [])
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth
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
          <Text strong>{name}</Text>
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
      width: 140,
      render: (cpf: string) => (
        <Text>
          {maskCPF(cpf)}
        </Text>
      ),
    },
    {
      title: "Telefone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => <Text>{maskPhone(phone)}</Text>,
    },
    {
      title: "Data de Nascimento",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (dateOfBirth: string) => <Text>{maskDate(dateOfBirth)}</Text>,
    },
  ];

  return (
    <S.ListUsersContainer>
      <Card
        bordered={false}
        style={{ borderRadius: 6, width: "100%", overflow: "hidden" }}
      >
        <S.HeaderRow>

          <S.SearchWrapper>
            <InputComponent
              placeholder="Buscar por nome ou email"
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              allowClear
              style={{ borderRadius: 4, width: "100%" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <SubmitButton
              htmlType="button"
              type="primary"
              style={{ backgroundColor: "#749c6d"}}
              onClick={registerUser}
            >
              + Cadastrar Usuário
            </SubmitButton>
          </S.SearchWrapper>
        </S.HeaderRow>

        <Table
          dataSource={mappedUsers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, simple: true }}
          scroll={{ x: 500 }}
          style={{ marginTop: 16, width: "100%" }}
        />

        {mensagem && <Text type="secondary">{mensagem}</Text>}
      </Card>
    </S.ListUsersContainer>
  );
};

export default ListUsersPage;