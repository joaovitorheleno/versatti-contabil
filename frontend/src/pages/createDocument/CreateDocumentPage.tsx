import { InboxOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
  type UploadFile,
} from "antd";
import { useMemo } from "react";
import { isAdmin } from "../../common/auth/user-is-admin";
import { useNavigate } from "react-router-dom";
import {
  documentCategoryLabels,
  type DocumentCategoryEnum,
} from "../../common/enum/document-category.enum";
import DateComponent from "../../components/date/DateComponent";
import FormComponent from "../../components/form/FormComponent";
import FormItemComponent from "../../components/form/FormItemComponent";
import InputComponent from "../../components/input/InputComponent";
import SelectComponent, {
  type SelectOption,
} from "../../components/selectButton/SelectComponent";
import { openErrorNotification } from "../../components/notification/error";
import { maskCnpj } from "../../functions/maskCnpj";
import useCreateDocument, {
  type FormDocumentType,
} from "../../hooks/documents/useCreateDocument";
import * as S from "./styles";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_FILES = ".xml,.pdf,.png,.jpg,.jpeg,.docx,.xlsx";

const MAX_FILES = 50;

const CreateDocumentPage = () => {
  const {
    form,
    clients,
    documentTypes,
    selectedType,
    loadingOptions,
    submitting,
    onSubmit,
  } = useCreateDocument();

  const navigate = useNavigate();

  const admin = isAdmin();

  const fileList = Form.useWatch("file", form) as UploadFile[] | undefined;
  const clientId = Form.useWatch("clientId", form) as string | undefined;
  const visibleToClient = Form.useWatch("visibleToClient", form) as
    | boolean
    | undefined;

  const responsibleEmail = clients.find(
    (client) => client.id === clientId,
  )?.responsibleEmail;
  const fileCount = fileList?.length ?? 0;

  const clientOptions: SelectOption[] = useMemo(
    () =>
      clients.map((client) => ({
        label: `${client.name} - ${maskCnpj(client.cnpj)}`,
        value: client.id,
      })),
    [clients],
  );

  const documentTypeOptions = useMemo(() => {
    const groups = new Map<DocumentCategoryEnum, SelectOption[]>();

    documentTypes.forEach((type) => {
      const group = groups.get(type.category) ?? [];
      group.push({ label: type.name, value: type.id });
      groups.set(type.category, group);
    });

    return Array.from(groups.entries()).map(([category, options]) => ({
      label: documentCategoryLabels[category] ?? category,
      options,
    }));
  }, [documentTypes]);

  const beforeUpload = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      openErrorNotification({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10 MB.",
      });
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const requiresExpiration = selectedType?.requiresExpiration ?? false;

  return (
    <S.PageWrapper>
      <S.PageHeader>
        <S.PageTitle>Enviar documento</S.PageTitle>
        <S.PageSubtitle>
          Anexe um documento à empresa e defina o vencimento para receber
          alertas
        </S.PageSubtitle>
      </S.PageHeader>

      <S.FormCard>
        <FormComponent
          form={form}
          name="createDocument"
          onFinish={onSubmit}
          variant="underlined"
          layout="vertical"
          initialValues={{ visibleToClient: true, notifyResponsible: true }}
        >
          <S.FieldRow>
            <FormItemComponent<FormDocumentType>
              name="clientId"
              rules={[{ required: true, message: "Selecione a empresa" }]}
              label="Empresa"
            >
              <SelectComponent
                placeholder="Selecione a empresa"
                options={clientOptions}
                loading={loadingOptions}
              />
            </FormItemComponent>

            <FormItemComponent<FormDocumentType>
              name="documentTypeId"
              rules={[
                { required: true, message: "Selecione o tipo de documento" },
              ]}
              label="Tipo de documento"
            >
              <Select
                placeholder="Selecione o tipo de documento"
                options={documentTypeOptions}
                loading={loadingOptions}
                allowClear
                showSearch
                optionFilterProp="label"
              />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <FormItemComponent<FormDocumentType>
              name="title"
              rules={[
                { required: true, message: "Preencha o título" },
                { max: 255, message: "Máximo de 255 caracteres" },
              ]}
              label="Título"
            >
              <InputComponent
                placeholder="Ex: Alvará de Funcionamento 2026"
                allowClear
              />
            </FormItemComponent>

            <FormItemComponent<FormDocumentType>
              name="number"
              rules={[{ max: 100, message: "Máximo de 100 caracteres" }]}
              label="Número do documento"
            >
              <InputComponent placeholder="Ex: ALV-2026/00123" allowClear />
            </FormItemComponent>
          </S.FieldRow>

          <S.FieldRow>
            <FormItemComponent<FormDocumentType>
              name="issueDate"
              label="Data de emissão"
            >
              <DateComponent style={{ width: "100%" }} />
            </FormItemComponent>

            <FormItemComponent<FormDocumentType>
              name="expirationDate"
              label="Data de vencimento"
              dependencies={["issueDate"]}
              rules={[
                {
                  required: requiresExpiration,
                  message: "Este tipo de documento exige data de vencimento",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const issueDate = getFieldValue("issueDate");
                    if (
                      !value ||
                      !issueDate ||
                      !value.isBefore(issueDate, "day")
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("O vencimento não pode ser antes da emissão"),
                    );
                  },
                }),
              ]}
            >
              <DateComponent
                style={{ width: "100%" }}
                disabled={!requiresExpiration}
              />
            </FormItemComponent>
          </S.FieldRow>

          {selectedType && !requiresExpiration && (
            <S.ExpirationHint>
              Este tipo de documento não possui vencimento.
            </S.ExpirationHint>
          )}

          <S.FieldRow>
            <FormItemComponent<FormDocumentType>
              name="alertDays"
              label="Alertar quantos dias antes do vencimento"
            >
              <InputNumber
                min={0}
                placeholder="Ex: 30"
                variant="underlined"
                disabled={!requiresExpiration}
              />
            </FormItemComponent>

            {admin && (
              <FormItemComponent<FormDocumentType>
                name="visibleToClient"
                label="Visível para o cliente"
                valuePropName="checked"
              >
                <Switch />
              </FormItemComponent>
            )}
          </S.FieldRow>

          {admin && (
            <FormItemComponent<FormDocumentType>
              name="notifyResponsible"
              label="Enviar por e-mail ao responsável da empresa"
              valuePropName="checked"
              extra={
                !clientId
                  ? "Selecione a empresa para ver o e-mail do responsável."
                  : !responsibleEmail
                    ? "Esta empresa não tem e-mail do responsável cadastrado. Cadastre na tela de Clientes."
                    : visibleToClient === false
                      ? "O documento não está visível para o cliente, então não será enviado por e-mail."
                      : `Os arquivos serão enviados para ${responsibleEmail}.`
              }
            >
              <Switch disabled={!!clientId && !responsibleEmail} />
            </FormItemComponent>
          )}

          <FormItemComponent<FormDocumentType> name="notes" label="Observações">
            <Input.TextArea
              placeholder="Informações adicionais sobre o documento"
              autoSize={{ minRows: 2, maxRows: 5 }}
              allowClear
            />
          </FormItemComponent>

          <FormItemComponent<FormDocumentType>
            name="file"
            label="Arquivos"
            valuePropName="fileList"
            getValueFromEvent={(e: { fileList: UploadFile[] }) =>
              e?.fileList?.slice(0, MAX_FILES)
            }
            extra={
              fileCount > 1
                ? `Serão criados ${fileCount} documentos com os mesmos dados. O nome de cada arquivo será adicionado ao título.`
                : undefined
            }
          >
            <Upload.Dragger
              accept={ACCEPTED_FILES}
              beforeUpload={beforeUpload}
              multiple
              maxCount={MAX_FILES}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#16302a" }} />
              </p>
              <p className="ant-upload-text">
                Clique ou arraste os arquivos para esta área
              </p>
              <p className="ant-upload-hint">
                Até {MAX_FILES} arquivos · XML de notas fiscais, PDF, imagem,
                Word ou Excel, até 10 MB cada
              </p>
            </Upload.Dragger>
          </FormItemComponent>

          <S.ActionsRow>
            <S.CancelButton type="button" onClick={() => navigate("/documents")}>
              Cancelar
            </S.CancelButton>
            <S.SaveButton type="submit" disabled={submitting}>
              {submitting
                ? "Enviando..."
                : fileCount > 1
                  ? `Enviar ${fileCount} documentos`
                  : "Enviar documento"}
            </S.SaveButton>
          </S.ActionsRow>
        </FormComponent>
      </S.FormCard>
    </S.PageWrapper>
  );
};

export default CreateDocumentPage;
