import { LoadingOutlined } from "@ant-design/icons";
import useListUsers from "../../hooks/listUsers/useListUsers";
import * as S from './styles'
import { Table } from "antd";

const ListUsersPage = () => {
  const { loading, users, mensagem } = useListUsers();

  const mappedUsers = users.map((user: any) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf
    }
  })

  const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Cpf',
        dataIndex: 'cpf',
        key: 'cpf',
    },
    ];

  return (
    <S.ListUsersContainer>
      <h1>Usuários Cadastrados</h1>

      <Table 
        dataSource={mappedUsers} 
        columns={columns} 

        />;

      {mensagem && <p>{mensagem}</p>}
    </S.ListUsersContainer>
  );
};

export default ListUsersPage;