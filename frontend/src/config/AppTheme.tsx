import { ConfigProvider } from 'antd';

const SIDEBAR_GREEN = "#14342b";

const AppTheme = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider
        theme={{
            token: {
            colorPrimary: SIDEBAR_GREEN,
            colorPrimaryHover: "#1e4d3c",
            colorPrimaryActive: "#0d2620",
            },
        }}
        >
        {children}
    </ConfigProvider>
);

export default AppTheme;