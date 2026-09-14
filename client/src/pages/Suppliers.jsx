import { useEffect, useState } from "react";

import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
} from "../services/api";

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);

    const [formData, setFormData] = useState({
        supplier_name: "",
        email: "",
        phone: "",
        address: ""
    });

    const [editingSupplier, setEditingSupplier] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getSuppliers();

            setSuppliers(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
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

            if (!formData.supplier_name.trim()) {
                setFormError(
                    "Supplier name is required"
                );
                return;
            }

            const supplierData = {
                supplier_name:
                    formData.supplier_name.trim(),

                email:
                    formData.email.trim(),

                phone:
                    formData.phone.trim(),

                address:
                    formData.address.trim()
            };

            if (editingSupplier) {
                await updateSupplier(
                    editingSupplier.supplier_id,
                    supplierData
                );
            } else {
                await createSupplier(
                    supplierData
                );
            }

            resetForm();

            await loadSuppliers();

        } catch (error) {
            setFormError(error.message);
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);

        setFormData({
            supplier_name:
                supplier.supplier_name || "",

            email:
                supplier.email || "",

            phone:
                supplier.phone || "",

            address:
                supplier.address || ""
        });

        setFormError("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this supplier?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await deleteSupplier(id);

            await loadSuppliers();

        } catch (error) {
            setError(error.message);
        }
    };

    const resetForm = () => {
        setEditingSupplier(null);

        setFormData({
            supplier_name: "",
            email: "",
            phone: "",
            address: ""
        });

        setFormError("");
    };

    if (loading) {
        return <p>Loading suppliers...</p>;
    }

    return (
        <div className="suppliers-page">

            <div className="page-header">
                <div>
                    <h1>Suppliers</h1>

                    <p className="page-subtitle">
                        Manage your product suppliers
                    </p>
                </div>
            </div>

            {error && (
                <p className="error">
                    Error: {error}
                </p>
            )}

            <section className="form-card">

                <h2>
                    {editingSupplier
                        ? "Edit Supplier"
                        : "Add Supplier"}
                </h2>

                <form onSubmit={handleSubmit}>

                    {formError && (
                        <p className="error">
                            {formError}
                        </p>
                    )}

                    <div>
                        <label>
                            Supplier Name
                        </label>
                        <br />

                        <input
                            type="text"
                            name="supplier_name"
                            value={
                                formData.supplier_name
                            }
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <br />

                    <div>
                        <label>Email</label>
                        <br />

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <br />

                    <div>
                        <label>Phone</label>
                        <br />

                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <br />

                    <div>
                        <label>Address</label>
                        <br />

                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <br />

                    <button type="submit">
                        {editingSupplier
                            ? "Update Supplier"
                            : "Add Supplier"}
                    </button>

                    {editingSupplier && (
                        <>
                            {" "}

                            <button
                                type="button"
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                        </>
                    )}

                </form>

            </section>

            <section className="supplier-list">

                <div className="section-header">

                    <div>
                        <h2>Supplier List</h2>

                        <p className="page-subtitle">
                            All registered suppliers
                        </p>
                    </div>

                </div>

                {suppliers.length === 0 ? (
                    <p>No suppliers found.</p>
                ) : (
                    <table
                        border="1"
                        cellPadding="10"
                    >
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {suppliers.map(
                                (supplier) => (
                                    <tr
                                        key={
                                            supplier.supplier_id
                                        }
                                    >
                                        <td>
                                            {
                                                supplier.supplier_id
                                            }
                                        </td>

                                        <td>
                                            {
                                                supplier.supplier_name
                                            }
                                        </td>

                                        <td>
                                            {
                                                supplier.email
                                            }
                                        </td>

                                        <td>
                                            {
                                                supplier.phone
                                            }
                                        </td>

                                        <td>
                                            {
                                                supplier.address
                                            }
                                        </td>

                                        <td>
                                            <button
                                                onClick={() =>
                                                    handleEdit(
                                                        supplier
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            {" "}

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        supplier.supplier_id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
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

export default Suppliers;