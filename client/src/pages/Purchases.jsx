import { useEffect, useState } from "react";

import {
    getProducts,
    getSuppliers,
    createPurchase,
    getPurchases
} from "../services/api";

function Purchases() {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [purchases, setPurchases] = useState([]);

    const [formData, setFormData] = useState({
        product_id: "",
        supplier_id: "",
        quantity: "",
        cost_price: ""
    });

    const [editingPurchase] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [purchasesLoading, setPurchasesLoading] = useState(true);

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");
    const [purchasesError, setPurchasesError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadPurchases();
    }, [page, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [productData, supplierData] = await Promise.all([
                getProducts("?limit=100"),
                getSuppliers()
            ]);

            setProducts(productData.products);
            setSuppliers(supplierData);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadPurchases = async () => {
        try {
            setPurchasesLoading(true);
            setPurchasesError("");

            const params = new URLSearchParams();

            params.append("page", page);
            params.append("limit", 10);

            if (startDate) {
                params.append("startDate", startDate);
            }

            if (endDate) {
                params.append("endDate", endDate);
            }

            const data = await getPurchases(
                `?${params.toString()}`
            );

            setPurchases(data.purchases);
            setTotalPages(data.totalPages);
            setHasNextPage(data.hasNextPage);
            setHasPreviousPage(data.hasPreviousPage);

        } catch (error) {
            setPurchasesError(error.message);
        } finally {
            setPurchasesLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setFormError("");
        setSuccess("");
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;

        const selectedProduct = products.find(
            (product) =>
                product.product_id === Number(productId)
        );

        setFormData({
            ...formData,
            product_id: productId,
            cost_price: selectedProduct
                ? selectedProduct.price
                : ""
        });

        setFormError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError("");
        setSuccess("");

        if (!formData.product_id) {
            setFormError("Please select a product");
            return;
        }

        if (!formData.supplier_id) {
            setFormError("Please select a supplier");
            return;
        }

        if (
            !formData.quantity ||
            Number(formData.quantity) <= 0
        ) {
            setFormError(
                "Quantity must be greater than 0"
            );
            return;
        }

        if (
            formData.cost_price === "" ||
            Number(formData.cost_price) < 0
        ) {
            setFormError(
                "Cost price must be 0 or greater"
            );
            return;
        }

        try {
            setSubmitting(true);

            const data = await createPurchase({
                product_id: Number(formData.product_id),
                supplier_id: Number(formData.supplier_id),
                quantity: Number(formData.quantity),
                cost_price: Number(formData.cost_price)
            });

            setSuccess(
                `${data.message}. New stock: ${data.new_stock}`
            );

            setFormData({
                product_id: "",
                supplier_id: "",
                quantity: "",
                cost_price: ""
            });

            await loadData();
            await loadPurchases();

        } catch (error) {
            setFormError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedProduct = products.find(
        (product) =>
            product.product_id === Number(
                formData.product_id
            )
    );

    if (loading) {
        return <p>Loading purchase data...</p>;
    }

    return (
        <div>
            <h1>Purchases</h1>

            {error && (
                <p>
                    Error: {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <h2>
                    {editingPurchase
                        ? "Edit Purchase"
                        : "Create Purchase"}
                </h2>

                {formError && (
                    <p>
                        {formError}
                    </p>
                )}

                {success && (
                    <p>
                        {success}
                    </p>
                )}

                <div>
                    <label>Product</label>
                    <br />

                    <select
                        name="product_id"
                        value={formData.product_id}
                        onChange={handleProductChange}
                    >
                        <option value="">
                            Select Product
                        </option>

                        {products.map((product) => (
                            <option
                                key={product.product_id}
                                value={product.product_id}
                            >
                                {product.product_name}
                                {" - "}
                                Stock: {product.quantity}
                            </option>
                        ))}
                    </select>
                </div>

                <br />

                {selectedProduct && (
                    <p>
                        Current Stock:{" "}
                        <strong>
                            {selectedProduct.quantity}
                        </strong>
                    </p>
                )}

                <div>
                    <label>Supplier</label>
                    <br />

                    <select
                        name="supplier_id"
                        value={formData.supplier_id}
                        onChange={handleChange}
                    >
                        <option value="">
                            Select Supplier
                        </option>

                        {suppliers.map((supplier) => (
                            <option
                                key={supplier.supplier_id}
                                value={supplier.supplier_id}
                            >
                                {supplier.supplier_name}
                            </option>
                        ))}
                    </select>
                </div>

                <br />

                <div>
                    <label>Quantity</label>
                    <br />

                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        value={formData.quantity}
                        onChange={handleChange}
                    />
                </div>

                <br />

                <div>
                    <label>Cost Price</label>
                    <br />

                    <input
                        type="number"
                        name="cost_price"
                        min="0"
                        step="0.01"
                        value={formData.cost_price}
                        onChange={handleChange}
                    />
                </div>

                <br />

                <button
                    type="submit"
                    disabled={submitting}
                >
                    {submitting
                        ? "Creating Purchase..."
                        : "Create Purchase"}
                </button>
            </form>

            <hr />

            <h2>Purchase History</h2>

            <div>
                <label>Start Date</label>
                <br />

                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                    }}
                />
            </div>

            <br />

            <div>
                <label>End Date</label>
                <br />

                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                    }}
                />
            </div>

            <br />

            <button
                type="button"
                onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setPage(1);
                }}
            >
                Clear Filters
            </button>

            <br />
            <br />

            {purchasesError && (
                <p>
                    Error: {purchasesError}
                </p>
            )}

            {purchasesLoading ? (
                <p>Loading purchases...</p>
            ) : purchases.length === 0 ? (
                <p>No purchases found.</p>
            ) : (
                <>
                    <table
                        border="1"
                        cellPadding="10"
                    >
                        <thead>
                            <tr>
                                <th>Purchase ID</th>
                                <th>Product</th>
                                <th>Supplier</th>
                                <th>Quantity</th>
                                <th>Cost Price</th>
                                <th>Total Cost</th>
                                <th>Date</th>
                                <th>Purchased By</th>
                            </tr>
                        </thead>

                        <tbody>
                            {purchases.map((purchase) => (
                                <tr
                                    key={
                                        purchase.purchase_id
                                    }
                                >
                                    <td>
                                        {purchase.purchase_id}
                                    </td>

                                    <td>
                                        {purchase.product_name}
                                    </td>

                                    <td>
                                        {purchase.supplier_name}
                                    </td>

                                    <td>
                                        {purchase.quantity}
                                    </td>

                                    <td>
                                        ₹
                                        {purchase.cost_price}
                                    </td>

                                    <td>
                                        ₹
                                        {(
                                            Number(
                                                purchase.quantity
                                            ) *
                                            Number(
                                                purchase.cost_price
                                            )
                                        ).toFixed(2)}
                                    </td>

                                    <td>
                                        {new Date(
                                            purchase.purchase_date
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {
                                            purchase.purchased_by
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <br />

                    <button
                        onClick={() =>
                            setPage(page - 1)
                        }
                        disabled={!hasPreviousPage}
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
                        disabled={!hasNextPage}
                    >
                        Next
                    </button>
                </>
            )}
        </div>
    );
}

export default Purchases;