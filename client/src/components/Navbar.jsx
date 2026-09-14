import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isAdmin = user?.role_name === "ADMIN";
    const isManager = user?.role_name === "MANAGER";
    const isStaff = user?.role_name === "STAFF";

    return (
        <nav>
            <h2>Smart Inventory</h2>

            <div>
                <Link to="/dashboard">Dashboard</Link>{" "}

                <Link to="/products">Products</Link>{" "}

                <Link to="/transactions">Transactions</Link>{" "}

                {(isAdmin || isManager) && (
                    <>
                        <Link to="/purchases">Purchases</Link>{" "}
                        <Link to="/categories">Categories</Link>{" "}
                        <Link to="/suppliers">Suppliers</Link>{" "}
                    </>
                )}

                <Link to="/sales">Sales</Link>{" "}

                {(isAdmin || isManager) && (
                    <Link to="/reports">Reports</Link>
                )}{" "}

                {isAdmin && (
                    <Link to="/users">Users</Link>
                )}
            </div>

            <div>
                <span>
                    {user?.name} ({user?.role_name})
                </span>{" "}

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;