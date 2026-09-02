import { Button } from 'antd';

interface SubmitButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
    style?: React.CSSProperties;
    block?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    loading?: boolean;
}

const SubmitButton = (props: SubmitButtonProps) => {
    return (
        <Button
            type={props.type}
            htmlType={props.htmlType}
            onClick={props.onClick}
            style={props.style}
            block={props.block}
            loading={props.loading}
        >
            {props.children}
        </Button>
    )
}

export default SubmitButton;