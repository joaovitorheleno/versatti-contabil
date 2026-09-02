import { ConfigProvider } from 'antd';

const AppTheme = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider
        theme={{
            token: {
                colorPrimary: '#16302A',
                colorPrimaryHover: '#16302A',
                colorPrimaryActive: '#16302A',
            },
        }}
    >
        {children}
    </ConfigProvider>
);

export default AppTheme;