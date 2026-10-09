import { Modal } from "antd";
import styled from "styled-components";

export const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .ant-modal-header {
    margin-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;
  }

  .ant-modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .ant-modal-footer {
    margin-top: 24px;
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
    width: 100%;
  }
`;
