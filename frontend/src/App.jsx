import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import RoleSelection from './pages/RoleSelection.jsx';
import CourierRegistration from './pages/courier/CourierRegistration.jsx';
import CustomerRegistration from './pages/customer/CustomerRegistration.jsx';
import CourierDashboard from "./pages/courier/CourierDashboard.jsx";
import CourierOrders from "./pages/courier/CourierOrders.jsx";
import WalletCourier from "./pages/courier/WalletCourier.jsx";
import ProfileCourier from "./pages/courier/ProfileCourier.jsx";
import OrderDetails from "./pages/courier/OrderDetails.jsx";
import CompletedOrderDetails from "./pages/courier/CompletedOrderDetails.jsx";
import CourierWithdrawMoney from "./pages/courier/CourierWithdrawMoney.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import CustomerDashboard from "./pages/customer/CustomerDashboard.jsx";
import TopUpBalance from "./pages/customer/TopUpBalance.jsx";
import CustomerOrderHistory from "./pages/customer/CustomerOrderHistory.jsx";
import CustomerProfile from "./pages/customer/CustomerProfile.jsx";
import CustomerOrderDetails from "./pages/customer/CustomerOrderDetails.jsx";
import CreateOrder from "./pages/customer/CreateOrder.jsx";
import ApproveOrder from "./pages/customer/ApproveOrder.jsx";
import LoginPage from "./pages/Login.jsx";
import RoleSelectionPage from "./pages/ChooseRoleEnterence.jsx";
import ChooseRoleAdmin from "./pages/ChooseRoleAdmin.jsx";
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
                    <Route path="/order-details" element={<OrderDetails />} />
                    <Route path="/order-history/:id" element={<CompletedOrderDetails />} />
                    <Route path="/courier-withdraw" element={<CourierWithdrawMoney />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                    <Route path="/top-up-balance" element={<TopUpBalance />} />
                    <Route path="/customer-history" element={<CustomerOrderHistory />} />
                    <Route path="/customer-profile" element={<CustomerProfile />} />
                    <Route path="/order/:id" element={<CustomerOrderDetails />} />
                    <Route path="/create-order" element={<CreateOrder />} />
                    <Route path="/approve-order" element={<ApproveOrder />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/choose-role" element={<RoleSelectionPage />} />
                    <Route path="/choose-role-admin" element={<ChooseRoleAdmin />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;