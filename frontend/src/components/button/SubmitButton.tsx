import { Button } from 'antd';

interface SubmitButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
    style?: React.CSSProperties;
}

const SubmitButton = (props: SubmitButtonProps) => {
    return (
        <Button
            type={props.type}
            htmlType="submit"
            onClick={props.onClick}
            style={props.style}
        >
            {props.children}
        </Button>
    )
}

export default SubmitButton;