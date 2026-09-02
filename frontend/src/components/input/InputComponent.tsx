import { Form, Input } from 'antd';
import type { InputProps } from 'antd';

interface InputComponentProps extends InputProps {
    labelColor?: string;
}

function InputComponent({ labelColor, ...rest }: InputComponentProps) {
    return (
        <Form.Item>
            <Input {...rest} />
        </Form.Item>
    );
}

export default InputComponent;