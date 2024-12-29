import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from './components/Home';
import Test from './components/Test';
import AbilityViewer from './components/AbilityViewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="ability" element={<AbilityViewer />} />
          <Route path="test" element={<Test />} />
        </Route>
        <Route path="*" element={<h1>404 Not Found</h1>} />          
      </Routes>
    </BrowserRouter>
  );
}

export default App;
