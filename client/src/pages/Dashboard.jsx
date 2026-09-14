import { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/api";

function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getDashboardSummary();

            setData(result);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Get individual sections from API response
    const productStats = data?.productStats;
    const salesStats = data?.salesStats;
    const purchaseStats = data?.purchaseStats;
    const todaySales = data?.todaySales;
    const lowStockProducts = data?.lowStockProducts || [];
    const topSellingProducts = data?.topSellingProducts || [];

    return (
        <div className="dashboard">

            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>

                    <p className="page-subtitle">
                        Overview of your inventory and business activity
                    </p>
                </div>
            </div>

            {error && (
                <div className="error">
                    {error}

                    <button onClick={loadDashboard}>
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <p>Loading dashboard...</p>
            ) : (
                <>
                    {/* Statistics */}

                    <div className="stats-grid">

                        <div className="stat-card">
                            <span className="stat-label">
                                Total Products
                            </span>

                            <strong>
                                {productStats?.total_products || 0}
                            </strong>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Total Units
                            </span>

                            <strong>
                                {productStats?.total_units || 0}
                            </strong>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Inventory Value
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    productStats?.inventory_value || 0
                                ).toLocaleString()}
                            </strong>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Total Sales
                            </span>

                            <strong>
                                {salesStats?.total_sales || 0}
                            </strong>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Total Revenue
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    salesStats?.total_revenue || 0
                                ).toLocaleString()}
                            </strong>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Total Purchases
                            </span>

                            <strong>
                                {purchaseStats?.total_purchases || 0}
                            </strong>
                        </div>

                    </div>

                    {/* Today's Sales + Low Stock */}

                    <div className="dashboard-grid">

                        <section className="dashboard-card">

                            <h2>Today's Sales</h2>

                            <div className="today-sales">

                                <div>
                                    <span>Sales</span>

                                    <strong>
                                        {todaySales?.sales_today || 0}
                                    </strong>
                                </div>

                                <div>
                                    <span>Revenue</span>

                                    <strong>
                                        ₹
                                        {Number(
                                            todaySales?.revenue_today || 0
                                        ).toLocaleString()}
                                    </strong>
                                </div>

                            </div>

                        </section>

                        <section className="dashboard-card">

                            <h2>Low Stock Products</h2>

                            {lowStockProducts.length === 0 ? (
                                <p>
                                    No low-stock products.
                                </p>
                            ) : (
                                <table>

                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Stock</th>
                                            <th>Reorder Level</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {lowStockProducts.map(
                                            (product) => (
                                                <tr
                                                    key={
                                                        product.product_id
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            product.product_name
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            product.quantity
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            product.reorder_level
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>
                            )}

                        </section>

                    </div>

                    {/* Top Selling Products */}

                    <section className="dashboard-card">

                        <h2>Top Selling Products</h2>

                        {topSellingProducts.length === 0 ? (
                            <p>
                                No sales data available.
                            </p>
                        ) : (
                            <table>

                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Units Sold</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {topSellingProducts.map(
                                        (product) => (
                                            <tr
                                                key={
                                                    product.product_id
                                                }
                                            >
                                                <td>
                                                    {
                                                        product.product_name
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        product.units_sold
                                                    }
                                                </td>

                                                <td>
                                                    ₹
                                                    {Number(
                                                        product.revenue || 0
                                                    ).toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>
                        )}

                    </section>
                </>
            )}

        </div>
    );
}

export default Dashboard;