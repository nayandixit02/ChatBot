import Header from "./components/Header";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/useAuth";
import { Box, CircularProgress, Typography } from "@mui/material";

function App() {
  const auth = useAuth();

  if (auth?.loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        bgcolor="#05101c"
        gap={2}
      >
        <CircularProgress sx={{ color: "#00fffc" }} size={60} thickness={4} />
        <Typography variant="h6" color="white" fontWeight={500}>
          Loading ChatBOT...
        </Typography>
      </Box>
    );
  }

  return (
    <main>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={auth?.isLoggedIn ? <Navigate to="/chat" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={auth?.isLoggedIn ? <Navigate to="/chat" replace /> : <Signup />}
        />
        <Route
          path="/chat"
          element={auth?.isLoggedIn ? <Chat /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default App;
