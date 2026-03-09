import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import RoleSelection from './pages/RoleSelection.jsx';
import CourierRegistration from './pages/CourierRegistration.jsx';
import CustomerRegistration from './pages/CustomerRegistration.jsx';

function App() {
    return (
        <Router>
            <div className="page-wrapper">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<RoleSelection />} />
                    <Route path="/courier" element={<CourierRegistration />} />
                    <Route path="/customer" element={<CustomerRegistration />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;