import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChordViewer from './pages/ChordViewer';
import CircleOfFifths from './pages/CircleOfFifths';
import HarmonicField from './pages/HarmonicField';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chord-viewer" element={<ChordViewer />} />
          <Route path="/circle-of-fifths" element={<CircleOfFifths />} />
          <Route path="/harmonic-field" element={<HarmonicField />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
