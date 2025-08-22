import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import Game from "./pages/Game";
import Final from "./pages/Final";
import Personalizar from "./pages/Personalizar";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/game" element={<Game />} />
        <Route path="/final" element={<Final />} />
        <Route path="/personalizar" element={<Personalizar />} />
      </Routes>
    </Router>
  );
}
