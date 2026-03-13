import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import RoleSelection from './pages/RoleSelection.jsx';
import CourierRegistration from './pages/CourierRegistration.jsx';
import CustomerRegistration from './pages/CustomerRegistration.jsx';
import CourierDashboard from "./pages/CourierDashboard.jsx";
import CourierOrders from "./pages/CourierOrders.jsx";
import WalletCourier from "./pages/WalletCourier.jsx";
import ProfileCourier from "./pages/ProfileCourier.jsx";
function App() {
    return (
        <Router>
            <div className="page-wrapper">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<RoleSelection />} />
                    <Route path="/courier" element={<CourierRegistration />} />
                    <Route path="/customer" element={<CustomerRegistration />} />
                    <Route path="/courier-dash" element={<CourierDashboard />} />
                    <Route path="/courier-orders" element={<CourierOrders />} />
                    <Route path="/courier-wallet" element={<WalletCourier />} />
                    <Route path="/courier-profile" element={<ProfileCourier />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;