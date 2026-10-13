import { Form, type FormInstance } from "antd";

interface FormComponentProps {
  name: string;
  remember?: boolean;
  children?: React.ReactNode;
  onFinish?: (values: any) => void;
  initialValues?: any;
  layout?: "horizontal" | "vertical" | "inline";
  style?: React.CSSProperties;
  variant?: "filled" | "outlined" | "borderless" | "underlined";
  form?: FormInstance;
}

const FormComponent = (props: FormComponentProps) => {
  return (
    <Form
      form={props.form}
      name={props.name}
      layout={props.layout || "horizontal"}
      initialValues={{
        remember: props.remember || false,
        ...props.initialValues,
      }}
      onFinish={props.onFinish}
      style={props.style}
      variant={props.variant || "filled"}
    >
      {props.children}
    </Form>
  );
};

export default FormComponent;
