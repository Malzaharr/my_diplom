import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import BrowserRouter, Routes, Route
import './index.css'; // Your CSS
import App from './App.jsx'   // Импортируем компонент Home
import Bd from './bd/main_bd'
import Header from './Page/Page.jsx';
import Main_Page from './Page/Main_Page.jsx';
// import App from './App'; // Import App component (if you have it)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  {/* Use BrowserRouter to enable routing */}
      <Routes>       {/* Define your routes */}
        <Route path="/" element={<App />} />     {/* Route for the Home component */}
        <Route path="/Bd" element={<Bd />} />  {/* Route for the About component */}
        <Route path='/Header' element={<Header />} />
        <Route path='/Main_Page' element={<Main_Page />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);