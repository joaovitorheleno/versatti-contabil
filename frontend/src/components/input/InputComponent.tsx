import { Input } from 'antd';
import type { InputProps } from 'antd';

const InputComponent = ({ status, ...props }: InputProps) => {
  return (
    <Input 
      status={status} 
      {...props} 
    />
  );
};

export default InputComponent;