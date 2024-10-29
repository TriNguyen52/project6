import React from 'react';
import './App.css';
import Centercard from './Components/centercard.jsx';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BreweryDetail from "./Components/BreweryDetail.jsx";

function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Centercard />} />
          <Route path="/brewery/:id" element={<BreweryDetail />} />
        </Routes>
      </Router>
    );
  }
  
  export default App;

