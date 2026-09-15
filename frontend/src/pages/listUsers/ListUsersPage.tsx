import { Table, Card, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import useListUsers from "../../hooks/listUsers/useListUsers";
import * as S from "./styles";
import InputComponent from "../../components/input/InputComponent";
import { maskPhone } from "../../functions/maskPhone";
import { maskCPF } from "../../functions/maskCpf";
import { maskDate } from "../../functions/maskDate";
import SubmitButton from "../../components/button/SubmitButton";
import { isAdmin } from "../../common/auth/user-is-admin";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

interface UserTableData {
  id: string | number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  dateOfBirth: string;
}

const ListUsersPage = () => {
  const { loading, users, mensagem, registerUser } = useListUsers();
  const [search, setSearch] = useState("");
  const admin = isAdmin();

  const mappedUsers: UserTableData[] = useMemo(
    () =>
      (users || [])
        .map((user: any) => ({
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          cpf: user.cpf || "",
          phone: user.phone || "",
          dateOfBirth: user.dateOfBirth || "",
        }))
        .filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        ),
    [users, search]
  );

  const columns: ColumnsType<UserTableData> = [
    {
      title: "Usuário",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      onFilter: (value, record) =>
        record.name.toLowerCase().includes((value as string).toLowerCase()),
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      onFilter: (value, record) =>
        record.email.toLowerCase().includes((value as string).toLowerCase()),
      render: (email: string) => <Text type="secondary">{email}</Text>,
    },
    {
      title: "CPF",
      dataIndex: "cpf",
      key: "cpf",
      width: 160,
      sorter: (a, b) => a.cpf.localeCompare(b.cpf),
      onFilter: (value, record) => record.cpf.includes(value as string),
      render: (cpf: string) => <Text>{maskCPF(cpf)}</Text>,
    },
    {
      title: "Telefone",
      dataIndex: "phone",
      key: "phone",
      onFilter: (value, record) => record.phone.includes(value as string),
      render: (phone: string) => <Text>{maskPhone(phone)}</Text>,
    },
    {
      title: "Data de Nascimento",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      sorter: (a, b) =>
        new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime(),
      render: (dateOfBirth: string) => <Text>{maskDate(dateOfBirth)}</Text>,
    },
    {
      title: 'Ação',
      dataIndex: '',
      key: 'action',
      render: () => <a>Delete</a>,
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

            {admin && (
              <SubmitButton
                htmlType="button"
                type="primary"
                style={{ backgroundColor: "#16302A" }}
                onClick={registerUser}
              >
                + Cadastrar Usuário
              </SubmitButton>
            )}
          </S.SearchWrapper>
        </S.HeaderRow>

        <Table
          dataSource={mappedUsers}
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
    </S.ListUsersContainer>
  );
};

export default ListUsersPage;