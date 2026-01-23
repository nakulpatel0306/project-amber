import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Spotlight } from "./components/Spotlight";
import { AuthPage } from "./components/AuthPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900">
        <Routes>
          <Route path="/" element={<Spotlight />} />
          <Route path="/signup" element={<AuthPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
