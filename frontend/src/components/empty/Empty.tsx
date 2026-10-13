import { Empty, Typography } from "antd";
import { versattiIcon512 } from "../../assets";

const { Text } = Typography;

interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState = ({
  title = "Nenhum registro encontrado",
  description,
}: EmptyStateProps) => (
  <Empty
    styles={{ image: { height: 80, opacity: 0.35, marginBottom: 16 } }}
    description={
      <>
        <Text strong style={{ display: "block", color: "#16302A" }}>
          {title}
        </Text>
        {description && <Text type="secondary">{description}</Text>}
      </>
    }
    style={{ padding: "32px 0" }}
  />
);

export default EmptyState;
