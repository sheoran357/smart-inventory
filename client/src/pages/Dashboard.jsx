import { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/api";

function Dashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getDashboardSummary()
            .then((result) => {
                setData(result);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, []);

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!data) {
        return <p>Loading dashboard...</p>;
    }

    return (
        <div>
            <h1>Dashboard</h1>

            <h2>Products</h2>
            <p>
                Total Products: {data.productStats.total_products}
            </p>
            <p>
                Total Units: {data.productStats.total_units}
            </p>
            <p>
                Inventory Value: ₹{data.productStats.inventory_value}
            </p>

            <h2>Sales</h2>
            <p>
                Total Sales: {data.salesStats.total_sales}
            </p>
            <p>
                Units Sold: {data.salesStats.units_sold}
            </p>
            <p>
                Total Revenue: ₹{data.salesStats.total_revenue}
            </p>

            <h2>Purchases</h2>
            <p>
                Total Purchases: {data.purchaseStats.total_purchases}
            </p>
            <p>
                Units Purchased: {data.purchaseStats.units_purchased}
            </p>
            <p>
                Total Purchase Cost: ₹{data.purchaseStats.total_purchase_cost}
            </p>

            <h2>Today</h2>
            <p>
                Today's Sales: {data.todaySales.sales_today}
            </p>
            <p>
                Today's Revenue: ₹{data.todaySales.revenue_today}
            </p>

            <h2>Low Stock Products</h2>

            {data.lowStockProducts.length === 0 ? (
                <p>No low stock products.</p>
            ) : (
                <ul>
                    {data.lowStockProducts.map((product) => (
                        <li key={product.product_id}>
                            {product.product_name}
                        </li>
                    ))}
                </ul>
            )}

            <h2>Top Selling Products</h2>

            {data.topSellingProducts.length === 0 ? (
                <p>No sales data available.</p>
            ) : (
                <ul>
                    {data.topSellingProducts.map((product) => (
                        <li key={product.product_id}>
                            {product.product_name} -{" "}
                            {product.units_sold} units sold - ₹
                            {product.revenue}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Dashboard;