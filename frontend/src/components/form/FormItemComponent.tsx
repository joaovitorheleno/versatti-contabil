import { Form } from 'antd';
import type { FormItemProps } from 'antd';

interface FormItemComponentProps<Values = any> extends FormItemProps<Values> {
    labelColor?: string;
}

function FormItemComponent<Values = any>({ labelColor, ...rest }: FormItemComponentProps<Values>) {
    return (
        <Form.Item<Values> {...rest} />
    );
}

export default FormItemComponent;