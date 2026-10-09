import {
  Table,
  Card,
  Typography,
  Button,
  Dropdown,
  Modal,
  Select,
  Form,
  Spin,
  type MenuProps,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import * as S from "./styles";
import InputComponent from "../../components/input/InputComponent";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import { maskPhone } from "../../functions/maskPhone";
import { maskCPF } from "../../functions/maskCpf";
import { maskDate } from "../../functions/maskDate";
import SubmitButton from "../../components/button/SubmitButton";
import { isAdmin } from "../../common/auth/user-is-admin";
import type { ColumnsType } from "antd/es/table";
import useListUsers from "../../hooks/users/useListUsers";

const { Text } = Typography;

interface UserTableData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  dateOfBirth: string;
}

interface UserDetails extends UserTableData {
  clients: { id: string; name: string }[];
}

const ListUsersPage = () => {
  const { loading, users, mensagem, registerUser, fetchInspectUser } =
    useListUsers();
  const [search, setSearch] = useState("");
  const admin = isAdmin();

  const [viewForm] = Form.useForm();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
    viewForm.resetFields();
  };

  const handleView = async (user: UserTableData) => {
    setIsViewModalOpen(true);
    setIsViewLoading(true);

    const details = await fetchInspectUser(user.id);

    if (!details) {
      handleCloseViewModal();
    } else {
      setSelectedUser(details as UserDetails);
    }
    setIsViewLoading(false);
  };

  useEffect(() => {
    if (isViewModalOpen && selectedUser) {
      viewForm.setFieldsValue({
        name: selectedUser.name,
        email: selectedUser.email,
        cpf: maskCPF(selectedUser.cpf || ""),
        phone: maskPhone(selectedUser.phone || ""),
        dateOfBirth: maskDate(selectedUser.dateOfBirth || ""),
        clients: (selectedUser.clients || []).map((c) => c.id),
      });
    }
  }, [isViewModalOpen, selectedUser, viewForm]);

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
            u.email.toLowerCase().includes(search.toLowerCase()),
        ),
    [users, search],
  );

  const getActionMenuItems = (record: UserTableData): MenuProps["items"] => [
    {
      key: "edit",
      label: (
        <>
          <EditOutlined /> Editar
        </>
      ),
      onClick: () => {},
    },
    {
      key: "view",
      label: (
        <>
          <EyeOutlined /> Visualizar
        </>
      ),
      onClick: () => handleView(record),
    },
    {
      key: "delete",
      label: (
        <>
          <DeleteOutlined /> Deletar
        </>
      ),
      danger: true,
      onClick: () => {},
    },
  ];

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

      <Modal
        title="Detalhes do Usuário"
        open={isViewModalOpen}
        width={800}
        onCancel={handleCloseViewModal}
        footer={[
          <SubmitButton key="close" onClick={handleCloseViewModal}>
            Fechar
          </SubmitButton>,
        ]}
        centered
      >
        <Spin spinning={isViewLoading}>
          {selectedUser && (
            <S.ScrollEditModal>
              <S.FormCard>
                <FormComponent
                  form={viewForm}
                  name="viewUserForm"
                  onFinish={() => {}}
                  variant="underlined"
                >
                  <S.FieldRow>
                    <FormItemComponent
                      name="name"
                      layout="vertical"
                      label="Nome"
                    >
                      <InputComponent disabled variant="filled" />
                    </FormItemComponent>

                    <FormItemComponent
                      name="email"
                      layout="vertical"
                      label="E-mail"
                    >
                      <InputComponent disabled variant="filled" />
                    </FormItemComponent>
                  </S.FieldRow>

                  <S.FieldRow>
                    <FormItemComponent
                      name="cpf"
                      layout="vertical"
                      label="CPF"
                    >
                      <InputComponent disabled variant="filled" />
                    </FormItemComponent>

                    <FormItemComponent
                      name="phone"
                      layout="vertical"
                      label="Telefone"
                    >
                      <InputComponent disabled variant="filled" />
                    </FormItemComponent>
                  </S.FieldRow>

                  <S.FieldRow>
                    <FormItemComponent
                      name="dateOfBirth"
                      layout="vertical"
                      label="Data de Nascimento"
                    >
                      <InputComponent disabled variant="filled" />
                    </FormItemComponent>
                  </S.FieldRow>

                  <FormItemComponent
                    name="clients"
                    layout="vertical"
                    label="Empresas vinculadas"
                  >
                    <Select
                      mode="multiple"
                      disabled
                      variant="outlined"
                      placeholder="Nenhuma empresa vinculada"
                      options={(selectedUser.clients || []).map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                    />
                  </FormItemComponent>
                </FormComponent>
              </S.FormCard>
            </S.ScrollEditModal>
          )}
        </Spin>
      </Modal>
    </S.ListUsersContainer>
  );
};

export default ListUsersPage;