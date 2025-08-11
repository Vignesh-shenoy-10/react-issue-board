import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import BoardPage from "./pages/BoardPage";
import IssueDetailPage from "./pages/IssueDetailPage/IssueDetailPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IssuesProvider } from "./context/IssuesContext";
import { MainLayout } from "./components/MainLayout/MainLayout";
import "./globals.css";

export const App = () => {
  return (
    <IssuesProvider>
      <Router>
        <Routes>
          <Route
            path="/board"
            element={
              <MainLayout>
                <BoardPage />
              </MainLayout>
            }
          />
          <Route
            path="/issue/:id"
            element={
              <MainLayout>
                <IssueDetailPage />
              </MainLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            }
          />
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
  );
};
