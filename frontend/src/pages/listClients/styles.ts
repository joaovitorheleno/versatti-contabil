import styled from "styled-components";

export const ListClientsContainer = styled.div`
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