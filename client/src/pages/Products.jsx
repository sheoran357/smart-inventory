import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    getInactiveProducts,
    returnStock,
    adjustStock,
    getProductTransactions
} from "../services/api";

function Products() {
    const { user } = useAuth();

    // =========================
    // ROLE CHECK
    // =========================

    const isAdmin = user?.role === "ADMIN";
    const isManager = user?.role === "MANAGER";
    const canManage = isAdmin || isManager;

    // =========================
    // PRODUCTS
    // =========================

    const [products, setProducts] = useState([]);

    // =========================
    // PAGINATION
    // =========================

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // =========================
    // SEARCH
    // =========================

    const [search, setSearch] = useState("");

    // =========================
    // GENERAL LOADING / ERROR
    // =========================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // ADD / EDIT PRODUCT
    // =========================

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        product_name: "",
        description: "",
        category_id: "",
        price: "",
        quantity: "",
        reorder_level: ""
    });

    const [formError, setFormError] = useState("");

    // =========================
    // INACTIVE PRODUCTS
    // =========================

    const [showInactive, setShowInactive] = useState(false);
    const [inactiveProducts, setInactiveProducts] = useState([]);

    // =========================
    // RETURN STOCK
    // =========================

    const [returnProduct, setReturnProduct] = useState(null);

    const [returnData, setReturnData] = useState({
        quantity: "",
        reason: ""
    });

    const [returnError, setReturnError] = useState("");
    const [returnLoading, setReturnLoading] = useState(false);

    // =========================
    // STOCK ADJUSTMENT
    // =========================

    const [adjustProduct, setAdjustProduct] = useState(null);

    const [adjustData, setAdjustData] = useState({
        quantity: "",
        reason: ""
    });

    const [adjustError, setAdjustError] = useState("");
    const [adjustLoading, setAdjustLoading] = useState(false);

    // =========================
    // PRODUCT STOCK HISTORY
    // =========================

    const [historyProduct, setHistoryProduct] = useState(null);
    const [historyTransactions, setHistoryTransactions] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    // =========================
    // LOAD DATA
    // =========================

    useEffect(() => {
        loadProducts();
        loadInactiveProducts();
    }, [page, search]);

    // =========================
    // LOAD PRODUCTS
    // =========================

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                page: page,
                limit: limit,
                search: search
            });

            const data = await getProducts(
                `?${params.toString()}`
            );

            setProducts(data.products || []);
            setTotalProducts(data.totalProducts || 0);
            setTotalPages(data.totalPages || 0);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOAD INACTIVE PRODUCTS
    // =========================

    const loadInactiveProducts = async () => {
        try {
            const data = await getInactiveProducts();

            setInactiveProducts(
                Array.isArray(data)
                    ? data
                    : data.products || []
            );

        } catch (error) {
            setError(error.message);
        }
    };

    // =========================
    // SEARCH
    // =========================

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    // =========================
    // ADD / EDIT PRODUCT
    // =========================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setFormError("");
    };

    const handleEdit = (product) => {
        setEditingProduct(product);

        setFormData({
            product_name: product.product_name,
            description: product.description || "",
            category_id: product.category_id,
            price: product.price,
            quantity: product.quantity,
            reorder_level: product.reorder_level
        });

        setFormError("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setFormError("");

            const productData = {
                product_name: formData.product_name,
                description: formData.description,
                category_id: Number(formData.category_id),
                price: Number(formData.price),
                quantity: Number(formData.quantity),
                reorder_level: Number(formData.reorder_level)
            };

            if (editingProduct) {
                await updateProduct(
                    editingProduct.product_id,
                    productData
                );
            } else {
                await createProduct(productData);
            }

            setFormData({
                product_name: "",
                description: "",
                category_id: "",
                price: "",
                quantity: "",
                reorder_level: ""
            });

            setEditingProduct(null);
            setShowForm(false);

            await loadProducts();

        } catch (error) {
            setFormError(error.message);
        }
    };

    // =========================
    // DELETE PRODUCT
    // =========================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to deactivate this product?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteProduct(id);

            await loadProducts();
            await loadInactiveProducts();

        } catch (error) {
            setError(error.message);
        }
    };

    // =========================
    // RESTORE PRODUCT
    // =========================

    const handleRestore = async (id) => {
        try {
            await restoreProduct(id);

            await loadProducts();
            await loadInactiveProducts();

        } catch (error) {
            setError(error.message);
        }
    };

    // =========================
    // RETURN STOCK
    // =========================

    const handleReturnChange = (e) => {
        setReturnData({
            ...returnData,
            [e.target.name]: e.target.value
        });
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();

        try {
            setReturnError("");
            setReturnLoading(true);

            if (
                returnData.quantity === "" ||
                Number(returnData.quantity) <= 0
            ) {
                setReturnError(
                    "Quantity must be greater than 0"
                );

                return;
            }

            if (!returnData.reason.trim()) {
                setReturnError("Reason is required");
                return;
            }

            await returnStock(
                returnProduct.product_id,
                {
                    quantity: Number(returnData.quantity),
                    reason: returnData.reason.trim()
                }
            );

            setReturnProduct(null);

            setReturnData({
                quantity: "",
                reason: ""
            });

            await loadProducts();

        } catch (error) {
            setReturnError(error.message);
        } finally {
            setReturnLoading(false);
        }
    };

    // =========================
    // STOCK ADJUSTMENT
    // =========================

    const handleAdjustChange = (e) => {
        setAdjustData({
            ...adjustData,
            [e.target.name]: e.target.value
        });
    };

    const handleAdjustSubmit = async (e) => {
        e.preventDefault();

        try {
            setAdjustError("");
            setAdjustLoading(true);

            if (
                adjustData.quantity === "" ||
                Number(adjustData.quantity) === 0
            ) {
                setAdjustError(
                    "Adjustment quantity cannot be zero"
                );

                return;
            }

            if (!adjustData.reason.trim()) {
                setAdjustError("Reason is required");
                return;
            }

            await adjustStock(
                adjustProduct.product_id,
                {
                    quantity: Number(adjustData.quantity),
                    reason: adjustData.reason.trim()
                }
            );

            setAdjustProduct(null);

            setAdjustData({
                quantity: "",
                reason: ""
            });

            await loadProducts();

        } catch (error) {
            setAdjustError(error.message);
        } finally {
            setAdjustLoading(false);
        }
    };

    // =========================
    // PRODUCT HISTORY
    // =========================

    const loadProductHistory = async (product) => {
        try {
            setHistoryLoading(true);
            setHistoryError("");

            const data = await getProductTransactions(
                product.product_id
            );

            setHistoryProduct(product);

            setHistoryTransactions(
                Array.isArray(data)
                    ? data
                    : data.transactions || []
            );

        } catch (error) {
            setHistoryError(error.message);
        } finally {
            setHistoryLoading(false);
        }
    };

    // =========================
    // LOADING / ERROR
    // =========================

    if (loading) {
        return <p>Loading products...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    // =========================
    // UI
    // =========================

    return (
        <div className="products-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">

                <div>
                    <h1>Products</h1>

                    <p className="page-subtitle">
                        Manage your inventory products
                    </p>
                </div>

                {canManage && (
                    <button
                        onClick={() => {
                            setShowForm(!showForm);

                            if (showForm) {
                                setEditingProduct(null);

                                setFormData({
                                    product_name: "",
                                    description: "",
                                    category_id: "",
                                    price: "",
                                    quantity: "",
                                    reorder_level: ""
                                });

                                setFormError("");
                            }
                        }}
                    >
                        {showForm
                            ? "Close Form"
                            : "Add Product"}
                    </button>
                )}

            </div>

            {/* =========================
                FILTER BAR
            ========================= */}

            <div className="filter-bar">

                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={handleSearch}
                />

                <button
                    onClick={() =>
                        setShowInactive(!showInactive)
                    }
                >
                    {showInactive
                        ? "Hide Inactive Products"
                        : "Show Inactive Products"}
                </button>

            </div>

            <p className="product-count">
                Total Products: {totalProducts}
            </p>

            {/* =========================
                ADD / EDIT FORM
            ========================= */}

            {canManage && showForm && (
                <form onSubmit={handleSubmit}>

                    <h2>
                        {editingProduct
                            ? "Edit Product"
                            : "Add Product"}
                    </h2>

                    {formError && (
                        <p>
                            Error: {formError}
                        </p>
                    )}

                    <div>
                        <label>
                            Product Name
                        </label>

                        <br />

                        <input
                            type="text"
                            name="product_name"
                            value={
                                formData.product_name
                            }
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <br />

                    <div>
                        <label>
                            Description
                        </label>

                        <br />

                        <textarea
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={handleChange}
                        />
                    </div>

                    <br />

                    <div>
                        <label>
                            Category ID
                        </label>

                        <br />

                        <input
                            type="number"
                            name="category_id"
                            value={
                                formData.category_id
                            }
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    <br />

                    <div>
                        <label>
                            Price
                        </label>

                        <br />

                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <br />

                    <div>
                        <label>
                            Quantity
                        </label>

                        <br />

                        <input
                            type="number"
                            name="quantity"
                            value={
                                formData.quantity
                            }
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>

                    <br />

                    <div>
                        <label>
                            Reorder Level
                        </label>

                        <br />

                        <input
                            type="number"
                            name="reorder_level"
                            value={
                                formData.reorder_level
                            }
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>

                    <br />

                    <button type="submit">
                        {editingProduct
                            ? "Update Product"
                            : "Create Product"}
                    </button>

                </form>
            )}

            <hr />

            {/* =========================
                PRODUCT TABLE
            ========================= */}

            {products.length === 0 ? (
                <p>
                    No products found.
                </p>
            ) : (
                <table
                    border="1"
                    cellPadding="10"
                >

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Reorder Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {products.map(
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
                                        ₹{product.price}
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

                                    <td>

                                        {/* ADMIN / MANAGER ACTIONS */}

                                        {canManage && (
                                            <>

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            product
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                {" "}

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            product.product_id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                                {" "}

                                                <button
                                                    onClick={() => {
                                                        setReturnProduct(
                                                            product
                                                        );

                                                        setReturnData({
                                                            quantity: "",
                                                            reason: ""
                                                        });

                                                        setReturnError(
                                                            ""
                                                        );
                                                    }}
                                                >
                                                    Return
                                                </button>

                                                {" "}

                                                <button
                                                    onClick={() => {
                                                        setAdjustProduct(
                                                            product
                                                        );

                                                        setAdjustData({
                                                            quantity: "",
                                                            reason: ""
                                                        });

                                                        setAdjustError(
                                                            ""
                                                        );
                                                    }}
                                                >
                                                    Adjust Stock
                                                </button>

                                                {" "}

                                            </>
                                        )}

                                        {/* EVERYONE CAN VIEW HISTORY */}

                                        <button
                                            onClick={() =>
                                                loadProductHistory(
                                                    product
                                                )
                                            }
                                        >
                                            View History
                                        </button>

                                    </td>

                                </tr>
                            )
                        )}

                    </tbody>

                </table>
            )}

            {/* =========================
                INACTIVE PRODUCTS
            ========================= */}

            {showInactive && (
                <div>

                    <hr />

                    <h2>
                        Inactive Products
                    </h2>

                    {inactiveProducts.length === 0 ? (
                        <p>
                            No inactive products.
                        </p>
                    ) : (
                        <table
                            border="1"
                            cellPadding="10"
                        >

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {inactiveProducts.map(
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

                                                {canManage && (
                                                    <button
                                                        onClick={() =>
                                                            handleRestore(
                                                                product.product_id
                                                            )
                                                        }
                                                    >
                                                        Restore
                                                    </button>
                                                )}

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>
                    )}

                </div>
            )}

            {/* =========================
                STOCK ADJUSTMENT FORM
            ========================= */}

            {canManage &&
                adjustProduct && (
                    <div>

                        <hr />

                        <h2>
                            Adjust Stock
                        </h2>

                        <p>
                            Product:{" "}
                            {
                                adjustProduct.product_name
                            }
                        </p>

                        <p>
                            Current Stock:{" "}
                            {
                                adjustProduct.quantity
                            }
                        </p>

                        <p>
                            Use a positive number
                            to increase stock and
                            a negative number to
                            decrease stock.
                        </p>

                        {adjustError && (
                            <p>
                                Error:{" "}
                                {adjustError}
                            </p>
                        )}

                        <form
                            onSubmit={
                                handleAdjustSubmit
                            }
                        >

                            <div>

                                <label>
                                    Adjustment
                                    Quantity
                                </label>

                                <br />

                                <input
                                    type="number"
                                    name="quantity"
                                    value={
                                        adjustData.quantity
                                    }
                                    onChange={
                                        handleAdjustChange
                                    }
                                    placeholder="Example: 10 or -5"
                                    required
                                />

                            </div>

                            <br />

                            <div>

                                <label>
                                    Reason
                                </label>

                                <br />

                                <textarea
                                    name="reason"
                                    value={
                                        adjustData.reason
                                    }
                                    onChange={
                                        handleAdjustChange
                                    }
                                    placeholder="Why is the stock being adjusted?"
                                    required
                                />

                            </div>

                            <br />

                            <button
                                type="submit"
                                disabled={
                                    adjustLoading
                                }
                            >
                                {adjustLoading
                                    ? "Adjusting..."
                                    : "Confirm Adjustment"}
                            </button>

                            {" "}

                            <button
                                type="button"
                                onClick={() => {
                                    setAdjustProduct(
                                        null
                                    );

                                    setAdjustError(
                                        ""
                                    );
                                }}
                            >
                                Cancel
                            </button>

                        </form>

                    </div>
                )}

            {/* =========================
                RETURN STOCK FORM
            ========================= */}

            {canManage &&
                returnProduct && (
                    <div>

                        <hr />

                        <h2>
                            Return Stock
                        </h2>

                        <p>
                            Product:{" "}
                            {
                                returnProduct.product_name
                            }
                        </p>

                        <p>
                            Current Stock:{" "}
                            {
                                returnProduct.quantity
                            }
                        </p>

                        {returnError && (
                            <p>
                                Error:{" "}
                                {returnError}
                            </p>
                        )}

                        <form
                            onSubmit={
                                handleReturnSubmit
                            }
                        >

                            <div>

                                <label>
                                    Return Quantity
                                </label>

                                <br />

                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={
                                        returnData.quantity
                                    }
                                    onChange={
                                        handleReturnChange
                                    }
                                    required
                                />

                            </div>

                            <br />

                            <div>

                                <label>
                                    Reason
                                </label>

                                <br />

                                <textarea
                                    name="reason"
                                    value={
                                        returnData.reason
                                    }
                                    onChange={
                                        handleReturnChange
                                    }
                                    placeholder="Why is the product being returned?"
                                    required
                                />

                            </div>

                            <br />

                            <button
                                type="submit"
                                disabled={
                                    returnLoading
                                }
                            >
                                {returnLoading
                                    ? "Processing Return..."
                                    : "Confirm Return"}
                            </button>

                            {" "}

                            <button
                                type="button"
                                onClick={() => {
                                    setReturnProduct(
                                        null
                                    );

                                    setReturnError(
                                        ""
                                    );
                                }}
                            >
                                Cancel
                            </button>

                        </form>

                    </div>
                )}

            {/* =========================
                PRODUCT STOCK HISTORY
            ========================= */}

            {historyProduct && (
                <div>

                    <hr />

                    <h2>
                        Stock History:{" "}
                        {
                            historyProduct.product_name
                        }
                    </h2>

                    <p>
                        Current Stock:{" "}
                        {
                            historyProduct.quantity
                        }
                    </p>

                    <button
                        onClick={() => {
                            setHistoryProduct(
                                null
                            );

                            setHistoryTransactions(
                                []
                            );

                            setHistoryError("");
                        }}
                    >
                        Close History
                    </button>

                    <br />
                    <br />

                    {historyLoading && (
                        <p>
                            Loading history...
                        </p>
                    )}

                    {historyError && (
                        <p>
                            Error:{" "}
                            {historyError}
                        </p>
                    )}

                    {!historyLoading &&
                        !historyError &&
                        historyTransactions.length ===
                            0 && (
                            <p>
                                No transaction
                                history found.
                            </p>
                        )}

                    {!historyLoading &&
                        !historyError &&
                        historyTransactions.length >
                            0 && (
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

                                    {historyTransactions.map(
                                        (
                                            transaction
                                        ) => (
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

                </div>
            )}

            {/* =========================
                PAGINATION
            ========================= */}

            <div className="pagination">

                <button
                    onClick={() =>
                        setPage(page - 1)
                    }
                    disabled={page === 1}
                >
                    Previous
                </button>

                <span>
                    {" "}
                    Page {page} of {totalPages}{" "}
                </span>

                <button
                    onClick={() =>
                        setPage(page + 1)
                    }
                    disabled={
                        page === totalPages ||
                        totalPages === 0
                    }
                >
                    Next
                </button>

            </div>

        </div>
    );
}

export default Products;