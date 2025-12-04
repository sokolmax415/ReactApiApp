import { HashRouter, Routes, Route, Link } from "react-router-dom";
import Currency from "./pages/Currency.tsx";
import Books from "./pages/Books.tsx";
import Weather from "./pages/Weather.tsx";

function App() {
  return (
    <HashRouter>
      <nav className="navbar">
        <div className="nav-container">
          <ul className="nav-menu">
            <li><Link to="/currency" className="nav-link">Валюты</Link></li>
            <li><Link to="/books" className="nav-link">Книги</Link></li>
            <li><Link to="/weather" className="nav-link">Погода</Link></li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/currency" element={<Currency />} />
        <Route path="/books" element={<Books />} />
        <Route path="/weather" element={<Weather />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
