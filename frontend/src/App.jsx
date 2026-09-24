import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes/AppRoutes";
import ThemeToggle from "./components/layout/ThemeToggle";
import BackButton from "./components/layout/BackButton";
import UserQuickActions from "./components/layout/UserQuickActions";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { theme } = useTheme();

  return (
    <>
      <AppRoutes />
      <BackButton />
      <UserQuickActions />
      <ThemeToggle />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme={theme === "dark" ? "dark" : "light"}
      />
    </>
  );
}

export default App;
