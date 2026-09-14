import { useEffect, useState } from "react";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../services/api";

function Categories() {
    const [categories, setCategories] = useState([]);

    const [categoryName, setCategoryName] = useState("");

    const [editingCategory, setEditingCategory] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getCategories();

            setCategories(data);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setFormError("");

            if (!categoryName.trim()) {
                setFormError(
                    "Category name is required"
                );
                return;
            }

            if (editingCategory) {
                await updateCategory(
                    editingCategory.category_id,
                    {
                        category_name:
                            categoryName.trim()
                    }
                );
            } else {
                await createCategory({
                    category_name:
                        categoryName.trim()
                });
            }

            setCategoryName("");
            setEditingCategory(null);

            await loadCategories();

        } catch (error) {
            setFormError(error.message);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);

        setCategoryName(
            category.category_name
        );

        setFormError("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await deleteCategory(id);

            await loadCategories();

        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        setEditingCategory(null);
        setCategoryName("");
        setFormError("");
    };

    if (loading) {
        return (
            <p>
                Loading categories...
            </p>
        );
    }

    if (error) {
        return (
            <p>
                Error: {error}
            </p>
        );
    }

    return (
        <div className="categories-page">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="page-header">

                <div>
                    <h1>Categories</h1>

                    <p className="page-subtitle">
                        Manage product categories
                    </p>
                </div>

            </div>

            {/* =========================
                CATEGORY FORM
            ========================= */}

            <section className="form-card">

                <h2>
                    {editingCategory
                        ? "Edit Category"
                        : "Add Category"}
                </h2>

                <form onSubmit={handleSubmit}>

                    {formError && (
                        <p className="error">
                            {formError}
                        </p>
                    )}

                    <input
                        type="text"
                        placeholder="Category name"
                        value={categoryName}
                        onChange={(e) =>
                            setCategoryName(
                                e.target.value
                            )
                        }
                    />

                    {" "}

                    <button type="submit">
                        {editingCategory
                            ? "Update"
                            : "Add"}
                    </button>

                    {editingCategory && (
                        <>
                            {" "}

                            <button
                                type="button"
                                onClick={
                                    handleCancel
                                }
                            >
                                Cancel
                            </button>
                        </>
                    )}

                </form>

            </section>

            {/* =========================
                CATEGORY LIST
            ========================= */}

            <section className="category-list">

                <div className="section-header">

                    <div>
                        <h2>
                            Category List
                        </h2>

                        <p className="page-subtitle">
                            All available product
                            categories
                        </p>
                    </div>

                </div>

                {categories.length === 0 ? (
                    <p>
                        No categories found.
                    </p>
                ) : (
                    <table
                        border="1"
                        cellPadding="10"
                    >

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>
                                    Category Name
                                </th>
                                <th>
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {categories.map(
                                (category) => (
                                    <tr
                                        key={
                                            category.category_id
                                        }
                                    >

                                        <td>
                                            {
                                                category.category_id
                                            }
                                        </td>

                                        <td>
                                            {
                                                category.category_name
                                            }
                                        </td>

                                        <td>

                                            <button
                                                onClick={() =>
                                                    handleEdit(
                                                        category
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            {" "}

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        category.category_id
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

export default Categories;