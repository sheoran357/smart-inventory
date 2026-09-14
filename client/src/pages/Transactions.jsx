import { useEffect, useState } from "react";

import {
    getTransactions,
    getProducts
} from "../services/api";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);

    const [productId, setProductId] = useState("");
    const [transactionType, setTransactionType] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProducts();
        loadTransactions();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await getProducts("?limit=100");
            setProducts(data.products || []);
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError("");

            let query = "";

            const params = new URLSearchParams();

            if (productId) {
                params.append("product_id", productId);
            }

            if (transactionType) {
                params.append(
                    "transaction_type",
                    transactionType
                );
            }

            if (params.toString()) {
                query = `?${params.toString()}`;
            }

            const data = await getTransactions(query);

            setTransactions(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        loadTransactions();
    };

    const handleClear = () => {
        setProductId("");
        setTransactionType("");

        setTimeout(() => {
            loadTransactions();
        }, 0);
    };

    if (loading) {
        return <p>Loading transactions...</p>;
    }

    return (
        <div>
            <h1>Inventory Transactions</h1>

            {error && (
                <p>
                    Error: {error}
                </p>
            )}

            <h2>Filters</h2>

            <div>
                <label>Product</label>
                <br />

                <select
                    value={productId}
                    onChange={(e) =>
                        setProductId(e.target.value)
                    }
                >
                    <option value="">
                        All Products
                    </option>

                    {products.map((product) => (
                        <option
                            key={product.product_id}
                            value={product.product_id}
                        >
                            {product.product_name}
                        </option>
                    ))}
                </select>
            </div>

            <br />

            <div>
                <label>Transaction Type</label>
                <br />

                <select
                    value={transactionType}
                    onChange={(e) =>
                        setTransactionType(e.target.value)
                    }
                >
                    <option value="">
                        All Types
                    </option>

                    <option value="PURCHASE">
                        Purchase
                    </option>

                    <option value="SALE">
                        Sale
                    </option>

                    <option value="ADJUSTMENT">
                        Adjustment
                    </option>

                    <option value="RETURN">
                        Return
                    </option>
                </select>
            </div>

            <br />

            <button onClick={handleFilter}>
                Apply Filter
            </button>

            {" "}

            <button onClick={handleClear}>
                Clear Filter
            </button>

            <hr />

            <h2>Transaction History</h2>

            {transactions.length === 0 ? (
                <p>
                    No transactions found.
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
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Reason</th>
                            <th>User</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {transactions.map(
                            (transaction) => (
                                <tr
                                    key={
                                        transaction.transaction_id
                                    }
                                >
                                    <td>
                                        {
                                            transaction.transaction_id
                                        }
                                    </td>

                                    <td>
                                        {
                                            transaction.product_name
                                        }
                                    </td>

                                    <td>
                                        {
                                            transaction.transaction_type
                                        }
                                    </td>

                                    <td>
                                        {
                                            transaction.quantity
                                        }
                                    </td>

                                    <td>
                                        {transaction.reason ||
                                            "-"}
                                    </td>

                                    <td>
                                        {
                                            transaction.user_name
                                        }
                                    </td>

                                    <td>
                                        {new Date(
                                            transaction.created_at
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Transactions;