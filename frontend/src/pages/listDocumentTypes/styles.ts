import styled from "styled-components";

export const ListDocumentTypesContainer = styled.div`
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
  gap: 12px;
  width: 100%;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ModalForm = styled.div`
  margin-top: 16px;

  .ant-select,
  .ant-input-number {
    width: 100% !important;
  }
`;
