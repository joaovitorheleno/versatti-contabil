import styled from "styled-components";

export const ListDocumentsContainer = styled.div`
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

export const FiltersWrapper = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1.5fr;
  gap: 12px;
  min-width: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .ant-select {
    width: 100%;
  }
`;

export const TabsRow = styled.div`
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 4px;

  .ant-segmented {
    white-space: nowrap;
  }
`;

export const CellStack = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.35;
`;
