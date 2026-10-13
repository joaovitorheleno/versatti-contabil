import {
  Table,
  Card,
  Typography,
  Button,
  Dropdown,
  Modal,
  type MenuProps,
  Select,
  Form,
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
import SubmitButton from "../../components/button/SubmitButton";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import { isAdmin } from "../../common/auth/user-is-admin";
import type { ColumnsType } from "antd/es/table";
import useListClients from "../../hooks/clients/useListClients";
import { maskCnpj } from "../../functions/maskCnpj";
import ModalComponent from "../../components/modal/ModalComponent";
import { maskPhone } from "../../functions/maskPhone";
import useEditClient from "../../hooks/clients/useEditClient";
import { TaxRegimeEnum } from "../../common/enum/tax-regime.enum";
import useDeleteClient from "../../hooks/clients/useDeleteClient";
import { maskCep } from "../../functions/maskCep";
import EmptyState from "../../components/empty/Empty";

const { Text } = Typography;

const taxRegimeOptions = [
  { value: TaxRegimeEnum.SIMPLES_NACIONAL, label: "Simples Nacional" },
  { value: TaxRegimeEnum.LUCRO_PRESUMIDO, label: "Lucro Presumido" },
  { value: TaxRegimeEnum.LUCRO_REAL, label: "Lucro Real" },
  { value: TaxRegimeEnum.MEI, label: "MEI" },
];

interface ClientTableData {
  id: string;
  name: string;
  cnpj: string;
  taxRegime: string;
  tradeName: string;
  stateRegistration: string;
  municipalRegistration: string;
  phone: string;
  nfeEmail: string;
  contactPerson: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const ListClientsPage = () => {
  const { loading, clients, registerClient, fetchClients } = useListClients();
  const {
    form,
    isEditModalOpen,
    handleSaveEdit,
    handleEdit,
    handleCloseEditModal,
  } = useEditClient(fetchClients);

  const [viewForm] = Form.useForm();

  const { handleDelete } = useDeleteClient(fetchClients);

  const [search, setSearch] = useState("");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState<ClientTableData | null>(
    null,
  );

  const admin = isAdmin();

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedClient(null);
    viewForm.resetFields();
  };

  const handleViewDelete = (client: ClientTableData) => {
    Modal.confirm({
      title: "Excluir Empresa",
      content: `Tem certeza que deseja excluir a empresa ${client.name}?`,
      okText: "Sim, excluir",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => handleDelete(client),
    });
  };

  const handleView = (client: ClientTableData) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  useEffect(() => {
    if (isViewModalOpen && selectedClient) {
      viewForm.setFieldsValue(selectedClient);
    }
  }, [isViewModalOpen, selectedClient, viewForm]);

  const mappedClients: ClientTableData[] = useMemo(
    () =>
      (clients || [])
        .map((client) => ({
          id: client.id ?? "",
          name: client.name || "",
          cnpj: client.cnpj || "",
          taxRegime: client.taxRegime || "",
          tradeName: client.tradeName || "",
          stateRegistration:
            client.stateRegistration != null
              ? String(client.stateRegistration)
              : "",
          municipalRegistration:
            client.municipalRegistration != null
              ? String(client.municipalRegistration)
              : "",
          phone: client.phone || "",
          nfeEmail: client.nfeEmail || "",
          contactPerson: client.contactPerson || "",
          zipCode: client.zipCode || "",
          street: client.street || "",
          number: client.number || "",
          complement: client.complement || "",
          neighborhood: client.neighborhood || "",
          city: client.city || "",
          state: client.state || "",
        }))
        .filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.cnpj.toLowerCase().includes(search.toLowerCase()),
        ),
    [clients, search],
  );

  const getActionMenuItems = (record: ClientTableData): MenuProps["items"] => [
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
      onClick: () => handleViewDelete(record),
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
      title: "Razão Social",
      dataIndex: "tradeName",
      key: "tradeName",
      sorter: (a, b) => (a.tradeName || "").localeCompare(b.tradeName || ""),
      render: (tradeName: string) => <Text type="secondary">{tradeName}</Text>,
    },
    {
      title: "Registro Estadual",
      dataIndex: "stateRegistration",
      key: "stateRegistration",
      sorter: (a, b) =>
        (a.stateRegistration || "").localeCompare(b.stateRegistration || ""),
      render: (stateRegistration: string) => (
        <Text type="secondary">{stateRegistration}</Text>
      ),
    },
    {
      title: "Registro Municipal",
      dataIndex: "municipalRegistration",
      key: "municipalRegistration",
      sorter: (a, b) =>
        (a.municipalRegistration || "").localeCompare(
          b.municipalRegistration || "",
        ),
      render: (municipalRegistration: string) => (
        <Text type="secondary">{municipalRegistration}</Text>
      ),
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
        variant="borderless"
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
          locale={{
            emptyText: (
              <EmptyState
                title={
                  search
                    ? "Nenhuma empresa corresponde à busca"
                    : "Nenhuma empresa cadastrada"
                }
                description={search ? "Tente outro nome ou CNPJ." : undefined}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title="Detalhes da Empresa"
        open={isViewModalOpen}
        width={1200}
        onCancel={handleCloseViewModal}
        footer={[
          <SubmitButton key="close" onClick={handleCloseViewModal}>
            Fechar
          </SubmitButton>,
        ]}
        centered
      >
        {selectedClient && (
          <S.ScrollEditModal>
            <S.FormCard>
              <FormComponent
                form={viewForm}
                name="viewForm"
                onFinish={() => {}}
                variant="underlined"
              >
                <S.FieldRow>
                  <FormItemComponent
                    name="cnpj"
                    normalize={(value) => maskCnpj(value)}
                    layout="vertical"
                    label="CNPJ"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>

                  <FormItemComponent
                    name="taxRegime"
                    layout="vertical"
                    label="Regime Tributário"
                  >
                    <Select
                      disabled
                      variant="outlined"
                      options={taxRegimeOptions}
                    />
                  </FormItemComponent>
                </S.FieldRow>

                <S.FieldRow>
                  <FormItemComponent
                    name="name"
                    layout="vertical"
                    label="Razão Social"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>

                  <FormItemComponent
                    name="tradeName"
                    layout="vertical"
                    label="Nome Fantasia"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>
                </S.FieldRow>

                <S.FieldRow>
                  <FormItemComponent
                    name="stateRegistration"
                    layout="vertical"
                    label="Inscrição Estadual"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>

                  <FormItemComponent
                    name="municipalRegistration"
                    layout="vertical"
                    label="Inscrição Municipal"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>
                </S.FieldRow>

                <S.FieldRow>
                  <FormItemComponent
                    name="phone"
                    normalize={(value) => maskPhone(value)}
                    layout="vertical"
                    label="Telefone"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>

                  <FormItemComponent
                    name="contactPerson"
                    layout="vertical"
                    label="Pessoa de Contato"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>
                </S.FieldRow>

                <FormItemComponent
                  name="nfeEmail"
                  layout="vertical"
                  label="E-mail para NF-e"
                >
                  <InputComponent disabled variant="filled" />
                </FormItemComponent>

                <S.FieldRow>
                  <FormItemComponent
                    name="zipCode"
                    normalize={(value) => maskCep(value)}
                    layout="vertical"
                    label="CEP"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>

                  <FormItemComponent
                    name="street"
                    layout="vertical"
                    label="Rua / Logradouro"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>
                </S.FieldRow>

                <S.FieldRow>
                  <FormItemComponent
                    name="number"
                    layout="vertical"
                    label="Número"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>

                  <FormItemComponent
                    name="complement"
                    layout="vertical"
                    label="Complemento"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>
                </S.FieldRow>

                <S.FieldRow>
                  <FormItemComponent
                    name="neighborhood"
                    layout="vertical"
                    label="Bairro"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>

                  <FormItemComponent
                    name="city"
                    layout="vertical"
                    label="Cidade"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>
                </S.FieldRow>

                <S.FieldRow>
                  <FormItemComponent
                    name="state"
                    layout="vertical"
                    label="Estado (UF)"
                  >
                    <InputComponent disabled variant="filled" />
                  </FormItemComponent>
                </S.FieldRow>
              </FormComponent>
            </S.FormCard>
          </S.ScrollEditModal>
        )}
      </Modal>

      <ModalComponent
        title="Editar Empresa"
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onConfirm={() => form.submit()}
        width={600}
        okText="Salvar alterações"
        okButtonProps={{ style: { width: "100%", backgroundColor: "#16302A" } }}
        hideCancelButton={true}
      >
        <S.ScrollEditModal>
          <FormComponent
            form={form}
            name="editClientForm"
            onFinish={handleSaveEdit}
            layout="vertical"
            style={{ marginTop: 16 }}
          >
            <FormItemComponent
              name="name"
              label="Razão Social / Nome"
              rules={[{ required: true, message: "Insira o nome" }]}
            >
              <InputComponent
                variant="underlined"
                placeholder="Nome da empresa"
                allowClear
              />
            </FormItemComponent>

            <FormItemComponent
              name="cnpj"
              label="CNPJ"
              rules={[{ required: true, message: "Insira o CNPJ" }]}
            >
              <InputComponent placeholder="00.000.000/0000-00" disabled />
            </FormItemComponent>

            <FormItemComponent name="tradeName" label="Nome Fantasia">
              <InputComponent
                variant="underlined"
                placeholder="Nome Fantasia"
                allowClear
              />
            </FormItemComponent>

            <FormItemComponent
              name="taxRegime"
              label="Regime Tributário"
              rules={[{ required: true, message: "Selecione o regime" }]}
            >
              <Select
                variant="outlined"
                placeholder="Regime Tributário"
                options={taxRegimeOptions}
              />
            </FormItemComponent>

            <FormItemComponent
              name="stateRegistration"
              label="Inscrição Estadual"
            >
              <InputComponent
                variant="underlined"
                placeholder="Inscrição Estadual"
                allowClear
              />
            </FormItemComponent>

            <FormItemComponent
              name="municipalRegistration"
              rules={[
                { required: true, message: "Preencha o registro municipal" },
              ]}
              label="Inscrição Municipal"
            >
              <InputComponent
                variant="underlined"
                placeholder="Inscrição Municipal"
                allowClear
              />
            </FormItemComponent>

            <FormItemComponent
              name="phone"
              rules={[
                { required: true, message: "Preencha o telefone de contato" },
              ]}
              getValueFromEvent={(e) => maskPhone(e.target.value)}
              normalize={(value) => maskPhone(value)}
              layout="vertical"
              label="Telefone"
            >
              <InputComponent
                placeholder="Ex: (31) 9 9999-9999"
                maxLength={16}
                allowClear
                variant="underlined"
              />
            </FormItemComponent>

            <FormItemComponent
              name="nfeEmail"
              layout="vertical"
              label="Email NF-e"
            >
              <InputComponent
                variant="underlined"
                placeholder="Ex: joaoteste@gmail.com"
                allowClear
              />
            </FormItemComponent>

            <FormItemComponent
              name="contactPerson"
              layout="vertical"
              label="Pessoa Responsável"
            >
              <InputComponent variant="underlined" allowClear />
            </FormItemComponent>
          </FormComponent>
        </S.ScrollEditModal>
      </ModalComponent>
    </S.ListClientsContainer>
  );
};

export default ListClientsPage;
