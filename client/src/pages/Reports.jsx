import { useEffect, useState } from "react";

import {
    getSalesSummary,
    getSalesByProduct,
    getInventoryReport
} from "../services/api";

function Reports() {
    const [salesSummary, setSalesSummary] = useState(null);
    const [salesByProduct, setSalesByProduct] = useState([]);
    const [inventory, setInventory] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (startDate) {
                params.append("startDate", startDate);
            }

            if (endDate) {
                params.append("endDate", endDate);
            }

            const query = params.toString()
                ? `?${params.toString()}`
                : "";

            const [
                summaryData,
                productData,
                inventoryData
            ] = await Promise.all([
                getSalesSummary(query),
                getSalesByProduct(query),
                getInventoryReport()
            ]);

            setSalesSummary(summaryData);
            setSalesByProduct(productData);
            setInventory(inventoryData);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilter = () => {
        loadReports();
    };

    const handleClearFilter = () => {
        setStartDate("");
        setEndDate("");

        setTimeout(() => {
            loadReports();
        }, 0);
    };

    if (loading) {
        return (
            <p>
                Loading reports...
            </p>
        );
    }

    return (
        <div className="reports-page">

            <div className="page-header">
                <div>
                    <h1>Reports</h1>

                    <p className="page-subtitle">
                        Analyze sales and inventory performance
                    </p>
                </div>
            </div>

            {error && (
                <p className="error">
                    Error: {error}
                </p>
            )}

            <div className="report-filters">

                <div>
                    <label>
                        Start Date
                    </label>
                    <br />

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                            setStartDate(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <label>
                        End Date
                    </label>
                    <br />

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                            setEndDate(
                                e.target.value
                            )
                        }
                    />
                </div>

                <div>
                    <button
                        onClick={handleApplyFilter}
                    >
                        Apply Filter
                    </button>

                    {" "}

                    <button
                        onClick={handleClearFilter}
                    >
                        Clear Filter
                    </button>
                </div>

            </div>

            <section className="report-summary">

                <h2>Sales Summary</h2>

                <div className="report-stats">

                    {salesSummary ? (
                        <>
                            <div className="stat-card">
                                <span className="stat-label">
                                    Total Sales
                                </span>

                                <strong>
                                    {
                                        salesSummary.total_sales
                                    }
                                </strong>
                            </div>

                            <div className="stat-card">
                                <span className="stat-label">
                                    Units Sold
                                </span>

                                <strong>
                                    {
                                        salesSummary.units_sold
                                    }
                                </strong>
                            </div>

                            <div className="stat-card">
                                <span className="stat-label">
                                    Total Revenue
                                </span>

                                <strong>
                                    ₹
                                    {
                                        salesSummary.total_revenue
                                    }
                                </strong>
                            </div>
                        </>
                    ) : (
                        <p>
                            No sales summary available.
                        </p>
                    )}

                </div>

            </section>

            <section className="report-section">

                <h2>Sales by Product</h2>

                {salesByProduct.length === 0 ? (
                    <p>
                        No sales data available.
                    </p>
                ) : (
                    <table
                        border="1"
                        cellPadding="10"
                    >
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Units Sold</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>

                        <tbody>
                            {salesByProduct.map(
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
                                            {
                                                product.revenue
                                            }
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                )}

            </section>

            <section className="report-section">

                <h2>Inventory Report</h2>

                {inventory.length === 0 ? (
                    <p>
                        No inventory data available.
                    </p>
                ) : (
                    <table
                        border="1"
                        cellPadding="10"
                    >
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Reorder Level</th>
                            </tr>
                        </thead>

                        <tbody>
                            {inventory.map(
                                (product) => (
                                    <tr
                                        key={
                                            product.product_id
                                        }
                                    >
                                        <td>
                                            {
                                                product.product_id
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.product_name
                                            }
                                        </td>

                                        <td>
                                            {
                                                product.category_name
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {
                                                product.price
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
    );
}

export default Reports;