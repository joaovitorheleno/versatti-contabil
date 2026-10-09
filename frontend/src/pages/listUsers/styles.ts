import styled from "styled-components";

export const ListUsersContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;

  @media (max-width: 576px) {
    .ant-card-body {
      padding: 12px !important;
    }
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 576px) {
    width: 100%;

    .ant-input-affix-wrapper,
    input {
      width: 100% !important;
    }
  }
`;

export const ScrollEditModal = styled.div`
  max-height: calc(80vh - 150px);
  overflow-y: auto;
  padding-right: 8px;
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
