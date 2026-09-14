import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public route */}
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/transactions"
                        element={<Transactions />}
                    />

                    <Route
                        path="/products"
                        element={<Products />}
                    />

                    <Route
                        path="/purchases"
                        element={<Purchases />}
                    />

                    <Route
                        path="/sales"
                        element={<Sales />}
                    />

                    <Route
                        path="/categories"
                        element={<Categories />}
                    />

                    <Route
                        path="/suppliers"
                        element={<Suppliers />}
                    />

                    <Route
                        path="/users"
                        element={<Users />}
                    />

                    <Route
                        path="/reports"
                        element={<Reports />}
                    />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;