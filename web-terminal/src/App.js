import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TerminalComponent from './terminal';
import TerminalContainer from './TerminalContainer';
import Terminal3 from './terminal3';
// import TerminalComponent2 from './Terminal2';

const App = () => {
  return (
    <div>
      <Router>
      <Routes>
        {/* Define your routes using Route */}
        <Route path="/terminal" element={<TerminalContainer />} />
        {/* Add more routes as needed */}
        <Route path="/terminal2" element={<TerminalComponent />} />
        <Route path="/terminal3" element={<Terminal3 />} />
      </Routes>
    </Router>
    </div>
  )
}

export default App