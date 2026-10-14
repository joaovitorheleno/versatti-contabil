import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  InputNumber,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import {
  DocumentCategoryEnum,
  documentCategoryLabels,
} from "../../common/enum/document-category.enum";
import { DocumentTypeEnum } from "../../common/enum/document-type.enum";
import SubmitButton from "../../components/button/SubmitButton";
import EmptyState from "../../components/empty/Empty";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import InputComponent from "../../components/input/InputComponent";
import ModalComponent from "../../components/modal/ModalComponent";
import SelectComponent, {
  type SelectOption,
} from "../../components/selectButton/SelectComponent";
import useDocumentTypes from "../../hooks/documents/useDocumentTypes";
import type {
  CreateDocumentTypePayload,
  DocumentTypeResponse,
} from "../../service/documents/types";
import * as S from "./styles";

const { Text } = Typography;

const categoryOptions: SelectOption[] = Object.values(DocumentCategoryEnum).map(
  (category) => ({
    label: documentCategoryLabels[category],
    value: category,
  }),
);

const ListDocumentTypesPage = () => {
  const {
    form,
    loading,
    documentTypes,
    isCreateModalOpen,
    saving,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleCreate,
    handleDelete,
  } = useDocumentTypes();

  const [search, setSearch] = useState("");

  const requiresExpiration = Form.useWatch("requiresExpiration", form);

  // Cada código só pode ser usado uma vez; esconde os que já estão cadastrados
  const codeOptions: SelectOption[] = useMemo(() => {
    const usedCodes = new Set(documentTypes.map((type) => type.code));

    return Object.values(DocumentTypeEnum)
      .filter((code) => !usedCodes.has(code))
      .map((code) => ({ label: code, value: code }));
  }, [documentTypes]);

  const filteredTypes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return documentTypes;

    return documentTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(term) ||
        type.code.toLowerCase().includes(term),
    );
  }, [documentTypes, search]);

  const columns: ColumnsType<DocumentTypeResponse> = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Código",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <Text type="secondary">{code}</Text>,
    },
    {
      title: "Categoria",
      dataIndex: "category",
      key: "category",
      filters: categoryOptions.map((option) => ({
        text: option.label,
        value: option.value,
      })),
      onFilter: (value, record) => record.category === value,
      render: (category: DocumentCategoryEnum) => (
        <Tag>{documentCategoryLabels[category] ?? category}</Tag>
      ),
    },
    {
      title: "Exige vencimento",
      dataIndex: "requiresExpiration",
      key: "requiresExpiration",
      align: "center",
      render: (requires: boolean) =>
        requires ? <Tag color="orange">Sim</Tag> : <Tag>Não</Tag>,
    },
    {
      title: "Alerta padrão",
      dataIndex: "defaultAlertDays",
      key: "defaultAlertDays",
      align: "center",
      render: (days: number | null) => (
        <Text type="secondary">{days != null ? `${days} dias antes` : "-"}</Text>
      ),
    },
    {
      title: "Ação",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Excluir tipo">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <S.ListDocumentTypesContainer>
      <Card
        variant="borderless"
        style={{ borderRadius: 6, width: "100%", overflow: "hidden" }}
      >
        <S.HeaderRow>
          <InputComponent
            placeholder="Buscar por nome ou código"
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            allowClear
            style={{ borderRadius: 4, width: "100%" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <SubmitButton
            htmlType="button"
            type="primary"
            style={{ backgroundColor: "#16302A" }}
            onClick={handleOpenCreateModal}
          >
            + Novo Tipo
          </SubmitButton>
        </S.HeaderRow>

        <Table
          dataSource={filteredTypes}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, simple: true }}
          scroll={{ x: 700 }}
          showSorterTooltip={false}
          style={{ marginTop: 16, width: "100%" }}
          locale={{
            emptyText: (
              <EmptyState
                title={
                  search
                    ? "Nenhum tipo corresponde à busca"
                    : "Nenhum tipo de documento cadastrado"
                }
                description={
                  search ? undefined : 'Clique em "+ Novo Tipo" para cadastrar.'
                }
              />
            ),
          }}
        />
      </Card>

      <ModalComponent
        title="Novo tipo de documento"
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onConfirm={() => form.submit()}
        confirmLoading={saving}
        width={560}
        okText="Cadastrar tipo"
        okButtonProps={{ style: { width: "100%", backgroundColor: "#16302A" } }}
        hideCancelButton={true}
      >
        <S.ModalForm>
          <FormComponent
            form={form}
            name="createDocumentTypeForm"
            onFinish={handleCreate}
            layout="vertical"
            variant="underlined"
            initialValues={{ requiresExpiration: false }}
          >
            <FormItemComponent<CreateDocumentTypePayload>
              name="code"
              label="Código"
              rules={[{ required: true, message: "Selecione o código" }]}
              extra="Identificador fixo do sistema. Cada código só pode ser cadastrado uma vez."
            >
              <SelectComponent
                placeholder="Selecione o código"
                options={codeOptions}
                notFoundContent="Todos os códigos já foram cadastrados"
              />
            </FormItemComponent>

            <FormItemComponent<CreateDocumentTypePayload>
              name="name"
              label="Nome de exibição"
              rules={[
                { required: true, message: "Preencha o nome" },
                { max: 100, message: "Máximo de 100 caracteres" },
              ]}
            >
              <InputComponent
                placeholder="Ex: Alvará de Funcionamento"
                allowClear
              />
            </FormItemComponent>

            <FormItemComponent<CreateDocumentTypePayload>
              name="category"
              label="Categoria"
              rules={[{ required: true, message: "Selecione a categoria" }]}
            >
              <SelectComponent
                placeholder="Selecione a categoria"
                options={categoryOptions}
              />
            </FormItemComponent>

            <FormItemComponent<CreateDocumentTypePayload>
              name="requiresExpiration"
              label="Exige data de vencimento"
              valuePropName="checked"
            >
              <Switch />
            </FormItemComponent>

            {requiresExpiration && (
              <FormItemComponent<CreateDocumentTypePayload>
                name="defaultAlertDays"
                label="Alertar quantos dias antes do vencimento (padrão)"
                rules={[
                  { required: true, message: "Informe os dias de alerta" },
                ]}
              >
                <InputNumber min={0} placeholder="Ex: 30" variant="underlined" />
              </FormItemComponent>
            )}
          </FormComponent>
        </S.ModalForm>
      </ModalComponent>
    </S.ListDocumentTypesContainer>
  );
};

export default ListDocumentTypesPage;
