import { Link } from "react-router-dom";
import "./style/Menu.css";

export default function Menu() {
  return (
    <div className="menu-container">
      <h1 className="menu-title">No se me ocurre nombre</h1>
      <nav className="menu-nav">
        <Link className="menu-link" to="/game">▶️ Play</Link>
        <Link className="menu-link" to="/personalizar">⚙️ Personalizar</Link>
      </nav>
    </div>
  );
}
