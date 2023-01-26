import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Dashboard } from "./scenes/dashboard";
import { Login } from "./scenes/login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard/:name/:EmpID/:userId" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
