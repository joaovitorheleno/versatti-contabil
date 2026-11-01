import styled from "styled-components";

export const Container = styled.div`
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

export const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
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

export const ClientPicker = styled.div`
  min-width: 320px;
  flex: 0 1 460px;

  .ant-select {
    width: 100%;
  }

  @media (max-width: 576px) {
    min-width: 100%;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7a73;
  min-width: 180px;
  flex: 1 1 180px;

  .ant-picker,
  .ant-select {
    width: 100%;
  }

  @media (max-width: 576px) {
    min-width: 100%;
  }
`;

export const Actions = styled.div`
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

export const Summary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6b7a73;
`;

export const Money = styled.span<{ $negative?: boolean }>`
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: ${({ $negative }) => ($negative ? "#d03b3b" : "inherit")};
`;

export const StatementTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  td {
    padding: 6px 8px;
    border-bottom: 1px solid #eef0ef;
  }

  td:last-child {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  tr.section td {
    font-weight: 600;
    background: #f7f9f8;
  }

  tr.subtotal td {
    font-weight: 700;
    border-top: 2px solid #d6dbd8;
  }

  tr.total td {
    font-weight: 700;
    background: #16302a;
    color: #fff;
  }
`;

export const SheetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const LineGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px 140px 32px;
  gap: 8px;
  align-items: start;
  margin-bottom: 8px;

  .ant-select,
  .ant-input-number {
    width: 100%;
  }

  @media (max-width: 576px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 32px;

    > :first-child {
      grid-column: 1 / -1;
    }
  }
`;
