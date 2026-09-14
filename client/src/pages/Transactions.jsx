import { useEffect, useState } from "react";

import {
    getTransactions,
    getProductTransactions,
    getProducts
} from "../services/api";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);

    const [productId, setProductId] = useState("");
    const [transactionType, setTransactionType] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productTransactions, setProductTransactions] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadProductTransactions = async (id) => {
        try {
            setError("");

            const data = await getProductTransactions(id);

            setSelectedProduct(id);
            setProductTransactions(
                Array.isArray(data)
                    ? data
                    : data.transactions || []
            );
        } catch (error) {
            setError(error.message);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await getProducts("?limit=100");

            setProducts(data.products || []);
        } catch (error) {
            console.error(
                "Failed to load products:",
                error
            );
        }
    };

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            params.append("page", page);
            params.append("limit", 10);

            if (productId) {
                params.append(
                    "product_id",
                    productId
                );
            }

            if (transactionType) {
                params.append(
                    "transaction_type",
                    transactionType
                );
            }

            const data = await getTransactions(
                `?${params.toString()}`
            );

            /*
             * Your API currently returns an array directly.
             *
             * Example:
             * [
             *   {
             *      transaction_id: 20,
             *      product_name: "Mechanical Keyboard"
             *   }
             * ]
             */

            if (Array.isArray(data)) {
                setTransactions(data);
                setTotalPages(1);
            } else {
                setTransactions(
                    data.transactions || []
                );

                setTotalPages(
                    data.totalPages || 1
                );
            }

        } catch (error) {
            setError(error.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [
        page,
        productId,
        transactionType
    ]);

    const handleFilter = () => {
        setPage(1);
    };

    const handleClear = () => {
        setProductId("");
        setTransactionType("");
        setPage(1);
    };

    if (loading) {
        return (
            <p>
                Loading transactions...
            </p>
        );
    }

    return (
        <div className="transactions-page">

            <div className="page-header">
                <div>
                    <h1>Transactions</h1>

                    <p className="page-subtitle">
                        Track all inventory stock movements
                    </p>
                </div>
            </div>

            {error && (
                <p className="error">
                    Error: {error}
                </p>
            )}

            <div className="transaction-filters">

                <div>
                    <label>
                        Product
                    </label>
                    <br />

                    <select
                        value={productId}
                        onChange={(e) =>
                            setProductId(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            All Products
                        </option>

                        {products.map(
                            (product) => (
                                <option
                                    key={
                                        product.product_id
                                    }
                                    value={
                                        product.product_id
                                    }
                                >
                                    {
                                        product.product_name
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <br />

                <div>
                    <label>
                        Transaction Type
                    </label>
                    <br />

                    <select
                        value={transactionType}
                        onChange={(e) =>
                            setTransactionType(
                                e.target.value
                            )
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

            </div>

            <section className="transaction-list">

                <div className="section-header">
                    <div>
                        <h2>
                            Inventory Transactions
                        </h2>

                        <p className="page-subtitle">
                            Purchase, sale, return and
                            adjustment history
                        </p>
                    </div>
                </div>

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
                                <th>Action</th>
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
                                            {
                                                transaction.reason ||
                                                "-"
                                            }
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

                                        <td>
                                            <button
                                                onClick={() =>
                                                    loadProductTransactions(
                                                        transaction.product_id
                                                    )
                                                }
                                            >
                                                View Product History
                                            </button>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                )}

                <br />

                <div className="pagination">

                    <button
                        onClick={() =>
                            setPage(page - 1)
                        }
                        disabled={page === 1}
                    >
                        Previous
                    </button>

                    {" "}

                    <span>
                        Page {page} of {totalPages}
                    </span>

                    {" "}

                    <button
                        onClick={() =>
                            setPage(page + 1)
                        }
                        disabled={
                            page >= totalPages
                        }
                    >
                        Next
                    </button>

                </div>

            </section>

            {selectedProduct && (
                <section className="product-history">

                    <div className="section-header">
                        <div>
                            <h2>
                                Product History
                            </h2>

                            <p className="page-subtitle">
                                Detailed transaction history
                                for the selected product
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedProduct(null);
                            setProductTransactions([]);
                        }}
                    >
                        Close History
                    </button>

                    <br />
                    <br />

                    {productTransactions.length === 0 ? (
                        <p>
                            No transactions found for
                            this product.
                        </p>
                    ) : (
                        <table
                            border="1"
                            cellPadding="10"
                        >
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Reason</th>
                                    <th>User</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>
                                {productTransactions.map(
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
                                                    transaction.transaction_type
                                                }
                                            </td>

                                            <td>
                                                {
                                                    transaction.quantity
                                                }
                                            </td>

                                            <td>
                                                {
                                                    transaction.reason ||
                                                    "-"
                                                }
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

                </section>
            )}

        </div>
    );
}

export default Transactions;