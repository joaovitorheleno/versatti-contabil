import styled from "styled-components";

export const ReportsContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 576px) {
    .ant-card-body {
      padding: 12px !important;
    }
  }
`;

export const PageTitle = styled.h1`
  font-family: Georgia, "Times New Roman", serif;
  font-size: 26px;
  font-weight: 600;
  color: #12231c;
  margin: 0 0 4px 0;
`;

export const PageSubtitle = styled.p`
  font-size: 14px;
  color: #6b7a73;
  margin: 0;
`;

export const FiltersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
`;

export const FilterField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7a73;
  min-width: 200px;
  flex: 1 1 200px;

  .ant-picker,
  .ant-select {
    width: 100%;
  }

  @media (max-width: 576px) {
    min-width: 100%;
  }
`;

export const FilterActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-left: auto;

  @media (max-width: 576px) {
    width: 100%;

    .ant-btn {
      flex: 1;
    }
  }
`;

export const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6b7a73;
`;

export const CellStack = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.35;
`;

export const ChecklistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
  padding: 4px 0;
`;

export const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #eef0ef;
  border-radius: 8px;
  background: #ffffff;
  font-size: 13px;
  color: #12231c;

  small {
    display: block;
    color: #6b7a73;
    font-size: 12px;
  }
`;
