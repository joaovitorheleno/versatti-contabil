
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Oswald:wght@200..700&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');

  * {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Work Sans', sans-serif;
    background: #f4f6f9;
  }

  h1, h2, h3, h4, h5,
  .ant-typography {
    font-family: 'Oswald', sans-serif;
    letter-spacing: 0.2px;
  }

  .ant-layout,
  .ant-layout-sider,
  .ant-layout-header,
  .ant-layout-content,
  .ant-card,
  .ant-table,
  .ant-table-container,
  .ant-input-affix-wrapper {
    border: none !important;
  }

  .ant-table-thead > tr > th {
    border-bottom: none !important;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #f0f0f0 !important;
  }
`;