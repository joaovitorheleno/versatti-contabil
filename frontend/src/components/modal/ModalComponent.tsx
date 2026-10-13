import React from "react";
import { type ModalProps } from "antd";
import * as S from "./styles";

interface CustomModalProps extends ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: number | string;
  onConfirm?: () => void;
  confirmLoading?: boolean;
  okText?: string;
  cancelText?: string;
  hideCancelButton?: boolean; // Adicionada uma prop limpa e descritiva
}

const ModalComponent: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width,
  onConfirm,
  confirmLoading = false,
  okText,
  cancelText,
  hideCancelButton = false,
  cancelButtonProps,
  ...restProps
}) => {
  return (
    <S.StyledModal
      title={title}
      open={isOpen}
      onCancel={onClose}
      onOk={onConfirm}
      confirmLoading={confirmLoading}
      okText={okText}
      cancelText={cancelText}
      cancelButtonProps={{
        style: hideCancelButton ? { display: "none" } : undefined,
        ...cancelButtonProps,
      }}
      width={width}
      centered
      destroyOnClose
      {...restProps}
    >
      {children}
    </S.StyledModal>
  );
};

export default ModalComponent;
