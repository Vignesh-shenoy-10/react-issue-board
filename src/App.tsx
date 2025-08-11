import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import BoardPage from "./pages/BoardPage";
import IssueDetailPage from "./pages/IssueDetailPage/IssueDetailPage";
import { SettingsPage } from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RequireAuth from "./components/RequireAuth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { IssuesProvider } from "./context/IssuesContext";
import { MainLayout } from "./components/MainLayout/MainLayout";
import { UserProvider } from "./context/UserContext";

import "./globals.css";

export const App = () => {
  return (
    <ThemeProvider>
    <UserProvider>
      <IssuesProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/board"
              element={
                <RequireAuth>
                  <MainLayout>
                    <BoardPage />
                  </MainLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/issue/:id"
              element={
                <RequireAuth>
                  <MainLayout>
                    <IssueDetailPage />
                  </MainLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                </RequireAuth>
              }
            />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/board" />} />
          </Routes>

          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"
          />
        </Router>
      </IssuesProvider>
    </UserProvider>
    </ThemeProvider>
  );
};
