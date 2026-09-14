
import { useEffect, useState } from "react";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    getInactiveProducts
} from "../services/api";

function Products() {
    const [products, setProducts] = useState([]);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        product_name: "",
        description: "",
        category_id: "",
        price: "",
        quantity: "",
        reorder_level: ""
    });

    const [showInactive, setShowInactive] = useState(false);

    const [inactiveProducts, setInactiveProducts] = useState([]);

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

    const handleRestore = async (id) => {
        try {
            await restoreProduct(id);

            await loadProducts();
            await loadInactiveProducts();

        } catch (error) {
            setError(error.message);
        }
    };


    const [editingProduct, setEditingProduct] = useState(null);

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

        setShowForm(true);
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        loadProducts();
        loadInactiveProducts();
    }, [page, search]);

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

            setProducts(data.products);
            setTotalProducts(data.totalProducts);
            setTotalPages(data.totalPages);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadInactiveProducts = async () => {
        try {
            const data = await getInactiveProducts();

            setInactiveProducts(data);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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

    if (loading) {
        return <p>Loading products...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h1>Products</h1>

            {/* Search */}
            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearch}
            />

            {" "}

            <button
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? "Cancel" : "Add Product"}
            </button>

            {" "}

            <button
                onClick={() => setShowInactive(!showInactive)}
            >
                {showInactive
                    ? "Hide Inactive Products"
                    : "Show Inactive Products"}
            </button>

            <p>
                Total Products: {totalProducts}
            </p>

            {/* Add Product Form */}
            {showForm && (
                <form onSubmit={handleSubmit}>

                    <h2>
                        {editingProduct ? "Edit Product" : "Add Product"}
                    </h2>

                    {formError && (
                        <p>{formError}</p>
                    )}

                    <div>
                        <label>Product Name</label>
                        <br />

                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <br />

                    <div>
                        <label>Description</label>
                        <br />

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <br />

                    <div>
                        <label>Category ID</label>
                        <br />

                        <input
                            type="number"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    <br />

                    <div>
                        <label>Price</label>
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
                        <label>Quantity</label>
                        <br />

                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>

                    <br />

                    <div>
                        <label>Reorder Level</label>
                        <br />

                        <input
                            type="number"
                            name="reorder_level"
                            value={formData.reorder_level}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>

                    <br />

                    <button type="submit">
                        {editingProduct ? "Update Product" : "Create Product"}
                    </button>

                </form>
            )}

            <hr />

            {/* Product Table */}

            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <table border="1" cellPadding="10">
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
                        {products.map((product) => (
                            <tr key={product.product_id}>

                                <td>{product.product_id}</td>

                                <td>{product.product_name}</td>

                                <td>{product.category_name}</td>

                                <td>₹{product.price}</td>

                                <td>{product.quantity}</td>

                                <td>{product.reorder_level}</td>

                                <td>
                                    <button
                                        onClick={() => handleEdit(product)}
                                    >
                                        Edit
                                    </button>

                                    {" "}

                                    <button
                                        onClick={() => handleDelete(product.product_id)}
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            )}


            {showInactive && (
                <div>
                    <hr />

                    <h2>Inactive Products</h2>

                    {inactiveProducts.length === 0 ? (
                        <p>No inactive products.</p>
                    ) : (
                        <table border="1" cellPadding="10">

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
                                {inactiveProducts.map((product) => (
                                    <tr key={product.product_id}>

                                        <td>
                                            {product.product_id}
                                        </td>

                                        <td>
                                            {product.product_name}
                                        </td>

                                        <td>
                                            {product.category_name}
                                        </td>

                                        <td>
                                            ₹{product.price}
                                        </td>

                                        <td>
                                            {product.quantity}
                                        </td>

                                        <td>
                                            <button
                                                onClick={() =>
                                                    handleRestore(
                                                        product.product_id
                                                    )
                                                }
                                            >
                                                Restore
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    )}
                </div>
            )}


            <br />

            {/* Pagination */}

            <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
            >
                Previous
            </button>

            <span>
                {" "}
                Page {page} of {totalPages}{" "}
            </span>

            <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
            >
                Next
            </button>

        </div>
    );
}

export default Products;