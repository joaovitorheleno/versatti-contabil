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
  message,
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
import ModalComponent from "../../components/modal/ModalComponent";
import { maskPhone } from "../../functions/maskPhone";
import { maskCPF } from "../../functions/maskCpf";
import { maskDate } from "../../functions/maskDate";
import SubmitButton from "../../components/button/SubmitButton";
import { isAdmin } from "../../common/auth/user-is-admin";
import type { ColumnsType } from "antd/es/table";
import useListUsers from "../../hooks/users/useListUsers";
import useListClients from "../../hooks/clients/useListClients";
import DateComponent from "../../components/date/DateComponent";
import dayjs, { Dayjs } from "dayjs";

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

interface EditUserFormValues {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  dateOfBirth: Dayjs | null;
  clients: string[];
}

const ListUsersPage = () => {
  const {
    loading,
    users,
    mensagem,
    registerUser,
    fetchInspectUser,
    fetchEditUser,
    fetchUsers,
    fetchDeleteUser,
  } = useListUsers();
  const { clients: allClients } = useListClients();

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

  const [editForm] = Form.useForm<EditUserFormValues>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    editForm.resetFields();
  };

  const handleEdit = async (user: UserTableData) => {
    setIsEditModalOpen(true);
    setIsEditLoading(true);

    const details = await fetchInspectUser(user.id);

    if (!details) {
      handleCloseEditModal();
    } else {
      setEditingUser(details as UserDetails);
    }
    setIsEditLoading(false);
  };

  useEffect(() => {
    if (isEditModalOpen && editingUser) {
      editForm.setFieldsValue({
        name: editingUser.name,
        email: editingUser.email,
        cpf: maskCPF(editingUser.cpf || ""),
        phone: maskPhone(editingUser.phone || ""),
        dateOfBirth: editingUser.dateOfBirth
          ? dayjs(editingUser.dateOfBirth)
          : null,
        clients: (editingUser.clients || []).map((c) => c.id),
      });
    }
  }, [isEditModalOpen, editingUser, editForm]);

  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    (allClients || []).forEach((c: any) => {
      if (c?.id) map.set(c.id, c.name);
    });
    (editingUser?.clients || []).forEach((c) => map.set(c.id, c.name));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [allClients, editingUser]);

  const handleSaveEdit = async (values: EditUserFormValues) => {
    if (!editingUser) return;

    setIsSaving(true);
    try {
      await fetchEditUser(editingUser.id, {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        cpf: values.cpf.replace(/\D/g, ""),
        phone: values.phone.replace(/\D/g, ""),
        dateOfBirth: values.dateOfBirth
          ? dayjs(values.dateOfBirth).toISOString()
          : null,
        clientIds: values.clients ?? [],
      } as any);

      message.success("Usuário atualizado com sucesso");
      handleCloseEditModal();
      fetchUsers();
    } catch (e: any) {
      message.error(e?.message || "Falha ao editar usuário");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = (user: UserTableData) => {
    Modal.confirm({
      title: "Excluir Usuário",
      content: `Tem certeza que deseja excluir o usuário ${user.name}?`,
      okText: "Sim, excluir",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => fetchDeleteUser(user.id, user.name),
    });
  };

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
      onClick: () => handleEdit(record),
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
      onClick: () => handleDeleteUser(record),
    },
  ];

  const columns: ColumnsType<UserTableData> = [
    {
      title: "Usuário",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      render: (email: string) => <Text type="secondary">{email}</Text>,
    },
    {
      title: "CPF",
      dataIndex: "cpf",
      key: "cpf",
      width: 160,
      sorter: (a, b) => a.cpf.localeCompare(b.cpf),
      render: (cpf: string) => <Text>{maskCPF(cpf)}</Text>,
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
                    <FormItemComponent name="cpf" layout="vertical" label="CPF">
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

      <ModalComponent
        title="Editar Usuário"
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onConfirm={() => editForm.submit()}
        width={600}
        okText="Salvar alterações"
        okButtonProps={{
          style: { width: "100%", backgroundColor: "#16302A" },
          loading: isSaving,
          disabled: isEditLoading || !editingUser,
        }}
        hideCancelButton={true}
      >
        <Spin spinning={isEditLoading}>
          <S.ScrollEditModal>
            <FormComponent
              form={editForm}
              name="editUserForm"
              onFinish={handleSaveEdit}
              layout="vertical"
              style={{ marginTop: 16 }}
            >
              <FormItemComponent
                name="name"
                label="Nome"
                rules={[{ required: true, message: "Insira o nome" }]}
              >
                <InputComponent
                  variant="underlined"
                  placeholder="Nome completo"
                  allowClear
                />
              </FormItemComponent>

              <FormItemComponent
                name="email"
                label="E-mail"
                rules={[
                  { required: true, message: "Insira o e-mail" },
                  { type: "email", message: "E-mail inválido" },
                ]}
              >
                <InputComponent
                  variant="underlined"
                  placeholder="Ex: joaoteste@gmail.com"
                  allowClear
                />
              </FormItemComponent>

              <FormItemComponent
                name="cpf"
                label="CPF"
                getValueFromEvent={(e) => maskCPF(e.target.value)}
                normalize={(value) => maskCPF(value)}
                rules={[
                  { required: true, message: "Insira o CPF" },
                  {
                    validator: (_, value) =>
                      !value || value.replace(/\D/g, "").length === 11
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("CPF deve conter 11 dígitos"),
                          ),
                  },
                ]}
              >
                <InputComponent
                  variant="underlined"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  allowClear
                />
              </FormItemComponent>

              <FormItemComponent
                name="phone"
                label="Telefone"
                getValueFromEvent={(e) => maskPhone(e.target.value)}
                normalize={(value) => maskPhone(value)}
                rules={[
                  { required: true, message: "Preencha o telefone de contato" },
                ]}
              >
                <InputComponent
                  variant="underlined"
                  placeholder="Ex: (31) 9 9999-9999"
                  maxLength={16}
                  allowClear
                />
              </FormItemComponent>

              <FormItemComponent
                name="dateOfBirth"
                rules={[
                  { required: true, message: "Por favor selecione a data!" },
                ]}
                layout="vertical"
                label="Data de nascimento"
              >
                <DateComponent />
              </FormItemComponent>

              <FormItemComponent name="clients" label="Empresas vinculadas">
                <Select
                  mode="multiple"
                  variant="outlined"
                  placeholder="Selecione as empresas"
                  options={clientOptions}
                  optionFilterProp="label"
                  allowClear
                />
              </FormItemComponent>
            </FormComponent>
          </S.ScrollEditModal>
        </Spin>
      </ModalComponent>
    </S.ListUsersContainer>
  );
};

export default ListUsersPage;
