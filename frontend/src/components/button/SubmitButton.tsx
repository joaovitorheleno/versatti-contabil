import { Button } from 'antd';

interface SubmitButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
    color?: string;
}

const SubmitButton = (props: SubmitButtonProps) => {
    return (
        <Button
            type={props.type}
            htmlType="submit"
            onClick={props.onClick}
            style={{ backgroundColor: props.color }}
        >
            {props.children}
        </Button>
    )
}

export default SubmitButton;