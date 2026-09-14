import { useEffect, useState } from "react";

import {
    getProducts,
    createSale,
    getSales
} from "../services/api";

function Sales() {
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        product_id: "",
        quantity: "",
        selling_price: ""
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");

    const [sales, setSales] = useState([]);
    const [salesLoading, setSalesLoading] = useState(true);
    const [salesError, setSalesError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const loadSales = async () => {
        try {
            setSalesLoading(true);
            setSalesError("");

            const params = new URLSearchParams();

            params.append("page", page);
            params.append("limit", 10);

            if (startDate) {
                params.append("startDate", startDate);
            }

            if (endDate) {
                params.append("endDate", endDate);
            }

            const data = await getSales(`?${params.toString()}`);

            setSales(data.sales);
            setTotalPages(data.totalPages);
            setHasNextPage(data.hasNextPage);
            setHasPreviousPage(data.hasPreviousPage);

        } catch (error) {
            setSalesError(error.message);
        } finally {
            setSalesLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getProducts("?limit=100");

            setProducts(data.products);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        loadSales();
    }, [page, startDate, endDate]);

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
            selling_price: selectedProduct
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
            formData.selling_price === "" ||
            Number(formData.selling_price) < 0
        ) {
            setFormError(
                "Selling price must be 0 or greater"
            );
            return;
        }

        const selectedProduct = products.find(
            (product) =>
                product.product_id ===
                Number(formData.product_id)
        );

        if (
            selectedProduct &&
            Number(formData.quantity) >
                selectedProduct.quantity
        ) {
            setFormError(
                `Only ${selectedProduct.quantity} units are available`
            );
            return;
        }

        try {
            setSubmitting(true);

            const data = await createSale({
                product_id: Number(formData.product_id),
                quantity: Number(formData.quantity),
                selling_price: Number(
                    formData.selling_price
                )
            });

            setSuccess(
                `${data.message}. Remaining stock: ${data.remaining_stock}`
            );

            setFormData({
                product_id: "",
                quantity: "",
                selling_price: ""
            });

            await loadProducts();
            await loadSales();

        } catch (error) {
            setFormError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedProduct = products.find(
        (product) =>
            product.product_id ===
            Number(formData.product_id)
    );

    if (loading) {
        return <p>Loading products...</p>;
    }

    return (
        <div className="sales-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">

                <div>
                    <h1>Sales</h1>

                    <p className="page-subtitle">
                        Create sales and view sales history
                    </p>
                </div>

            </div>

            {error && (
                <p className="error">
                    Error: {error}
                </p>
            )}

            {/* =========================
                CREATE SALE FORM
            ========================= */}

            <section className="form-card">

                <h2>Create Sale</h2>

                <form onSubmit={handleSubmit}>

                    {formError && (
                        <p className="error">
                            {formError}
                        </p>
                    )}

                    {success && (
                        <p className="success">
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
                                    {product.product_name} -
                                    {" "}
                                    Stock: {product.quantity}
                                </option>
                            ))}
                        </select>
                    </div>

                    <br />

                    {selectedProduct && (
                        <p>
                            Available Stock:{" "}
                            <strong>
                                {selectedProduct.quantity}
                            </strong>
                        </p>
                    )}

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
                        <label>Selling Price</label>
                        <br />

                        <input
                            type="number"
                            name="selling_price"
                            min="0"
                            step="0.01"
                            value={
                                formData.selling_price
                            }
                            onChange={handleChange}
                        />
                    </div>

                    <br />

                    <button
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Creating Sale..."
                            : "Create Sale"}
                    </button>

                </form>

            </section>

            {/* =========================
                SALES HISTORY
            ========================= */}

            <section className="sales-history">

                <div className="section-header">

                    <div>
                        <h2>Sales History</h2>

                        <p className="page-subtitle">
                            View previously recorded sales
                        </p>
                    </div>

                </div>

                {/* =========================
                    DATE FILTERS
                ========================= */}

                <div className="filter-bar">

                    <div>
                        <label>Start Date</label>
                        <br />

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(
                                    e.target.value
                                );
                                setPage(1);
                            }}
                        />
                    </div>

                    <div>
                        <label>End Date</label>
                        <br />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(
                                    e.target.value
                                );
                                setPage(1);
                            }}
                        />
                    </div>

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

                </div>

                {salesError && (
                    <p className="error">
                        Error: {salesError}
                    </p>
                )}

                {salesLoading ? (
                    <p>Loading sales...</p>
                ) : sales.length === 0 ? (
                    <p>No sales found.</p>
                ) : (
                    <table
                        border="1"
                        cellPadding="10"
                    >

                        <thead>
                            <tr>
                                <th>Sale ID</th>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Selling Price</th>
                                <th>Total Amount</th>
                                <th>Date</th>
                                <th>Sold By</th>
                            </tr>
                        </thead>

                        <tbody>

                            {sales.map((sale) => (
                                <tr
                                    key={sale.sale_id}
                                >

                                    <td>
                                        {sale.sale_id}
                                    </td>

                                    <td>
                                        {sale.product_name}
                                    </td>

                                    <td>
                                        {sale.quantity}
                                    </td>

                                    <td>
                                        ₹
                                        {
                                            sale.selling_price
                                        }
                                    </td>

                                    <td>
                                        ₹
                                        {(
                                            Number(
                                                sale.quantity
                                            ) *
                                            Number(
                                                sale.selling_price
                                            )
                                        ).toFixed(2)}
                                    </td>

                                    <td>
                                        {new Date(
                                            sale.sale_date
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {sale.sold_by}
                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>
                )}

                {/* =========================
                    PAGINATION
                ========================= */}

                {!salesLoading &&
                    sales.length > 0 && (
                        <div className="pagination">

                            <button
                                onClick={() =>
                                    setPage(page - 1)
                                }
                                disabled={
                                    !hasPreviousPage
                                }
                            >
                                Previous
                            </button>

                            {" "}

                            <span>
                                Page {page} of{" "}
                                {totalPages}
                            </span>

                            {" "}

                            <button
                                onClick={() =>
                                    setPage(page + 1)
                                }
                                disabled={
                                    !hasNextPage
                                }
                            >
                                Next
                            </button>

                        </div>
                    )}

            </section>

        </div>
    );
}

export default Sales;