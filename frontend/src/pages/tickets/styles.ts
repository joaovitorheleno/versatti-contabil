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

export const DrawerMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #6b7a73;
`;

export const Thread = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 16px;
`;

export const Bubble = styled.div<{ $office: boolean }>`
  align-self: ${({ $office }) => ($office ? "flex-start" : "flex-end")};
  max-width: 85%;
  background: ${({ $office }) => ($office ? "#f3f6f4" : "#e8f0ec")};
  border: 1px solid ${({ $office }) => ($office ? "#e4e7e5" : "#cfe0d6")};
  border-radius: 10px;
  padding: 10px 12px;

  .bubble-author {
    font-size: 12px;
    font-weight: 600;
    color: #16302a;
    margin-bottom: 4px;
  }

  .bubble-body {
    font-size: 14px;
    color: #12231c;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .bubble-time {
    font-size: 11px;
    color: #6b7a73;
    margin-top: 6px;
    text-align: right;
  }
`;

export const ReplyBox = styled.div`
  border-top: 1px solid #eef0ef;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ReplyActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
`;
