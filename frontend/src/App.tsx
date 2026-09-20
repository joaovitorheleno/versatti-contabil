import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/registerPassword/RegisterPage';
import RegisterCpfPage from './pages/registerCpf/RegisterCpf';
import AppTheme from './config/AppTheme';
import { AppThemeProvider } from './context/ThemeContext';
import RecoverPasswordPage from './pages/recoverPassword/RecoverPasswordPage';
import ResetPasswordPage from './pages/changePassword/ResetPasswordPage';
import ListUsersPage from './pages/listUsers/ListUsersPage';
import AppLayout from './layouts/AppLayout';
import CreateUserPage from './pages/createUser/CreateUserPage';
import ListClientsPage from './pages/listClients/ListClientsPage';
import CreateClientPage from './pages/createClient/CreateClientPage';

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

          <Route element={<AppLayout />}>
            <Route path="/users" element={<ListUsersPage />} />
            <Route path="/users/register" element={<CreateUserPage />} />

            <Route path="/clients" element={<ListClientsPage />} />
            <Route path="/clients/register" element={<CreateClientPage />} />
          </Route>
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