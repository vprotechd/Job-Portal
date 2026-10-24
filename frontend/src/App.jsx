import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <>
      <AppRoutes />
            <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
      />
    </>
  );
}

export default App;
