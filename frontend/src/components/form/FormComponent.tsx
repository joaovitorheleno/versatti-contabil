import { Form } from 'antd';

interface FormComponentProps {
    name: string;
    remember?: boolean;
    children?: React.ReactNode;
    onFinish?: (values: any) => void;
    initialValues?: any;
    layout?: 'horizontal' | 'vertical' | 'inline';
    style?: React.CSSProperties;
    variant?: "filled" | "outlined" | "borderless" | "underlined" | undefined;
}

const FormComponent = (props: FormComponentProps) => {
    const [form] = Form.useForm();

    return (
        <Form
            name={props.name}
            layout={props.layout || 'horizontal'}
            form={form}
            initialValues={{
                remember: props.remember || false,
                ...props.initialValues,
            }}
            onFinish={props.onFinish}
            style={props.style}
            variant={props.variant || 'filled'}
        >
            {props.children}
        </Form>
    )
}

export default FormComponent