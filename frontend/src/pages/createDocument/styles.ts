import styled from "styled-components";

export const PageWrapper = styled.div`
  max-width: 100%;
  padding: 30px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 900px) {
    padding: 20px 12px;
  }
`;

export const PageHeader = styled.div`
  margin-bottom: 14px;
`;

export const PageTitle = styled.h1`
  font-family: Georgia, "Times New Roman", serif;
  font-size: 26px;
  font-weight: 600;
  color: #12231c;
  margin: 0 0 6px 0;
`;

export const PageSubtitle = styled.p`
  font-size: 14px;
  color: #6b7a73;
  margin: 0;
`;

export const FormCard = styled.div`
  background: #ffffff;
  border: 1px solid #e4e7e5;
  border-radius: 12px;
  padding: 32px;

  .ant-form-item {
    margin-bottom: 22px;
    width: 100%;
  }

  .ant-form-item-control-input-content {
    width: 100%;
  }

  .ant-input,
  .ant-select,
  .ant-picker,
  .ant-input-number {
    width: 100% !important;
  }

  .ant-form-item-label > label {
    font-size: 13px;
    font-weight: 500;
    color: #12231c;
  }

  .ant-input:focus,
  .ant-input-focused,
  .ant-picker-focused {
    border-color: #16302a;
    box-shadow: none;
  }

  .ant-upload-wrapper .ant-upload-drag {
    border-radius: 8px;
    background: #f7f9f8;
  }

  .ant-upload-wrapper .ant-upload-drag:hover {
    border-color: #16302a;
  }

  .ant-upload-list {
    max-height: 240px;
    overflow-y: auto;
  }

  @media (max-width: 900px) {
    padding: 20px 16px;
  }
`;

// minmax(0, 1fr) deixa a coluna encolher abaixo da largura do conteúdo;
// com 1fr puro, o select de tipo empurrava o layout para fora do card.
// O breakpoint é maior que o de celular porque o sidebar ocupa 240px da tela.
export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  width: 100%;

  & > * {
    min-width: 0;
  }

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
`;

export const ExpirationHint = styled.p`
  font-size: 12px;
  color: #6b7a73;
  margin: -12px 0 18px 0;
`;

export const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid #eef0ef;
`;

export const CancelButton = styled.button`
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7a73;
  background: transparent;
  border: 1px solid #e4e7e5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #c7cdc9;
    color: #12231c;
  }

  @media (max-width: 600px) {
    flex: 1;
  }
`;

export const SaveButton = styled.button`
  padding: 9px 22px;
  font-size: 14px;
  font-weight: 500;
  color: #fafaf8;
  background: #16302a;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #1d3d33;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    flex: 1;
  }
`;
