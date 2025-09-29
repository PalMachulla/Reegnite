import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useGameStore } from "./stores/gameStore";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import GameMap from "./pages/GameMap";
import Collection from "./pages/Collection";
import CaptureScreen from "./pages/CaptureScreen";

function App() {
  const { isAuthenticated } = useAuthStore();
  const { currentView } = useGameStore();

  if (currentView === "splash") {
    return <SplashScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/map" />}
          />
          <Route
            path="/map"
            element={isAuthenticated ? <GameMap /> : <Navigate to="/login" />}
          />
          <Route
            path="/capture"
            element={
              isAuthenticated ? <CaptureScreen /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/collection"
            element={
              isAuthenticated ? <Collection /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/map" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
