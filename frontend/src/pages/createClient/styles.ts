import styled from "styled-components";

export const PageWrapper = styled.div`
  max-width: 100%;
  padding: 30px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 600px) {
    padding: 24px 16px;
  }
`;

export const ClientNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
`;

export const RegisterContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 100%;
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
  .ant-picker {
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

  @media (max-width: 600px) {
    padding: 24px 20px;
  }
`;

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

export const DateFieldWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
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
`;
