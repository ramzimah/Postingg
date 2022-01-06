import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignPage from "./components/sign";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<SignPage />} />{" "}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
