import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/registerPassword/RegisterPage";
import RegisterCpfPage from "./pages/registerCpf/RegisterCpf";
import AppTheme from "./config/AppTheme";
import { AppThemeProvider } from "./context/ThemeContext";
import RecoverPasswordPage from "./pages/recoverPassword/RecoverPasswordPage";
import ResetPasswordPage from "./pages/changePassword/ResetPasswordPage";
import ListUsersPage from "./pages/listUsers/ListUsersPage";
import AppLayout from "./layouts/AppLayout";
import CreateUserPage from "./pages/createUser/CreateUserPage";
import ListClientsPage from "./pages/listClients/ListClientsPage";
import CreateClientPage from "./pages/createClient/CreateClientPage";
import { isAdmin } from "./common/auth/user-is-admin";
import ListDocumentsPage from "./pages/listDocuments/ListDocumentsPage";
import CreateDocumentPage from "./pages/createDocument/CreateDocumentPage";
import ListDocumentTypesPage from "./pages/listDocumentTypes/ListDocumentTypesPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ReportsPage from "./pages/reports/ReportsPage";

function MainLayout() {
  return (
    <AppTheme>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirmCpf" element={<RegisterCpfPage />} />
          <Route path="/recoverPassword" element={<RecoverPasswordPage />} />
          <Route path="/resetPassword" element={<ResetPasswordPage />} />

          <Route element={<AppLayout />}>
            {isAdmin() && (
              <>
                <Route path="/users" element={<ListUsersPage />} />
                <Route path="/users/register" element={<CreateUserPage />} />
                <Route
                  path="/clients/register"
                  element={<CreateClientPage />}
                />
                <Route
                  path="/document-types"
                  element={<ListDocumentTypesPage />}
                />
              </>
            )}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/clients" element={<ListClientsPage />} />
            <Route path="/documents" element={<ListDocumentsPage />} />
            <Route
              path="/documents/register"
              element={<CreateDocumentPage />}
            />
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
