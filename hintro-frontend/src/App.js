import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Board from "./pages/Board";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/board" element={<Board />} />
        <Route path="/board/:id" element={<Board />} />
      </Routes>
    </Router>
  );
}

export default App;
