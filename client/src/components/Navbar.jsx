import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isAdmin = user?.role === "ADMIN";
    const isManager = user?.role === "MANAGER";

    return (
        <nav className="navbar">

            {/* Brand */}
            <div className="navbar-brand">
                Smart Inventory
            </div>

            {/* Navigation Links */}
            <div className="navbar-links">

                {/* ADMIN + MANAGER */}
                {(isAdmin || isManager) && (
                    <Link to="/dashboard">
                        Dashboard
                    </Link>
                )}

                {/* EVERYONE */}
                <Link to="/products">
                    Products
                </Link>

                {/* EVERYONE */}
                <Link to="/transactions">
                    Transactions
                </Link>

                {/* ADMIN + MANAGER */}
                {(isAdmin || isManager) && (
                    <>
                        <Link to="/purchases">
                            Purchases
                        </Link>

                        <Link to="/categories">
                            Categories
                        </Link>

                        <Link to="/suppliers">
                            Suppliers
                        </Link>
                    </>
                )}

                {/* EVERYONE */}
                <Link to="/sales">
                    Sales
                </Link>

                {/* ADMIN + MANAGER */}
                {(isAdmin || isManager) && (
                    <Link to="/reports">
                        Reports
                    </Link>
                )}

                {/* ADMIN ONLY */}
                {isAdmin && (
                    <Link to="/users">
                        Users
                    </Link>
                )}

            </div>

            {/* User Information + Logout */}
            <div className="navbar-user">

                <span>
                    {user?.name} ({user?.role})
                </span>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;