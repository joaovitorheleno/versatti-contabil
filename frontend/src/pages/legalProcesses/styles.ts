import styled from "styled-components";

export const Container = styled.div`
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
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Filters = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr;
  gap: 12px;
  min-width: 0;

  .ant-select {
    width: 100%;
  }

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const CellStack = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.35;
`;

export const DetailMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  margin-bottom: 20px;
  font-size: 13px;

  span {
    display: block;
    color: #6b7a73;
    font-size: 12px;
  }

  @media (max-width: 576px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StepItem = styled.li<{ $done: boolean }>`
  border: 1px solid ${({ $done }) => ($done ? "#cfe8d5" : "#e4e7e5")};
  background: ${({ $done }) => ($done ? "#f3faf5" : "#ffffff")};
  border-radius: 8px;
  padding: 10px 12px;

  .step-head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .step-name {
    flex: 1;
    font-size: 14px;
    color: #12231c;
    text-decoration: ${({ $done }) => ($done ? "line-through" : "none")};
    text-decoration-color: #6b7a73;
  }

  .step-date {
    font-size: 12px;
    color: #6b7a73;
    white-space: nowrap;
  }

  .step-notes {
    margin: 6px 0 0 28px;
    font-size: 12px;
    color: #6b7a73;
  }
`;

export const AddStepRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;
