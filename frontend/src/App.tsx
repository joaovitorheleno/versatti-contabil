import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/registerPassword/RegisterPage';
import RegisterCpfPage from './pages/registerCpf/RegisterCpf';
import AppTheme from './config/AppTheme';
import { AppThemeProvider } from './context/ThemeContext';
import RecoverPasswordPage from './pages/recoverPassword/RecoverPasswordPage';
import ResetPasswordPage from './pages/changePassword/ResetPasswordPage';

function MainLayout() {
  return (
    <AppTheme>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirmCpf" element={<RegisterCpfPage />} />
          <Route path="/recoverPassword" element={<RecoverPasswordPage />} />
          <Route path="/resetPassword" element={<ResetPasswordPage />} />
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