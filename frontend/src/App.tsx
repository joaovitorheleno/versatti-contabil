import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/registerPassword/RegisterPage';
import RegisterCpfPage from './pages/registerCpf/RegisterCpf';
import AppTheme from './config/AppTheme';
import { AppThemeProvider, useAppTheme } from './context/ThemeContext';
import { FloatButton } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

function MainLayout() {
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === 'dark';

  return (
    <AppTheme>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirmCpf" element={<RegisterCpfPage />} />
        </Routes>
      </BrowserRouter>
    </AppTheme>
  );
}

function App() {
  return (
    <AppThemeProvider>
      <MainLayout />
    </AppThemeProvider>
  );
}

export default App;