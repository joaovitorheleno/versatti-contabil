import React from 'react';
import { Select, type SelectProps } from 'antd';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface CustomSelectProps extends Omit<SelectProps, 'options'> {
  options: SelectOption[];
  placeholder?: string;
  mode?: 'multiple' | 'tags';
  loading?: boolean;
  disabled?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  className?: string;
}

export const SelectComponent: React.FC<CustomSelectProps> = ({
  options,
  placeholder = 'Selecione uma opção',
  mode,
  loading = false,
  disabled = false,
  value,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <Select
      mode={mode}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      loading={loading}
      disabled={disabled}
      allowClear
      showSearch
      className={`w-full ${className}`}
      filterOption={(input, option) =>
        (option?.label ?? '')
          .toString()
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      {...props}
    />
  );
};

export default SelectComponent;