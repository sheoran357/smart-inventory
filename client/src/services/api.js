const API_URL = "http://localhost:5000/api";

const api = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && {
                Authorization: `Bearer ${token}`
            }),
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

export const loginUser = (credentials) => {
    return api("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
    });
};

export const getProducts = (params = "") => {
    return api(`/products${params}`);
};

export const getProduct = (id) => {
    return api(`/products/${id}`);
};

export const createProduct = (product) => {
    return api("/products", {
        method: "POST",
        body: JSON.stringify(product)
    });
};

export const updateProduct = (id, product) => {
    return api(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(product)
    });
};

export const deleteProduct = (id) => {
    return api(`/products/${id}`, {
        method: "DELETE"
    });
};

export const restoreProduct = (id) => {
    return api(`/products/${id}/restore`, {
        method: "PATCH"
    });
};

export const getDashboardSummary = () => {
    return api("/dashboard/summary");
};

export const getInactiveProducts = () => {
    return api("/products/inactive");
};


export const getCategories = () => {
    return api("/categories");
};

export const createCategory = (category) => {
    return api("/categories", {
        method: "POST",
        body: JSON.stringify(category)
    });
};

export const updateCategory = (id, category) => {
    return api(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(category)
    });
};

export const deleteCategory = (id) => {
    return api(`/categories/${id}`, {
        method: "DELETE"
    });
};

export const getSuppliers = () => {
    return api("/suppliers");
};

export const createSupplier = (supplier) => {
    return api("/suppliers", {
        method: "POST",
        body: JSON.stringify(supplier)
    });
};

export const updateSupplier = (id, supplier) => {
    return api(`/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(supplier)
    });
};

export const deleteSupplier = (id) => {
    return api(`/suppliers/${id}`, {
        method: "DELETE"
    });
};

export const createSale = (sale) => {
    return api("/sales", {
        method: "POST",
        body: JSON.stringify(sale)
    });
};

export const getSales = (params = "") => {
    return api(`/sales${params}`);
};

export const createPurchase = (purchase) => {
    return api("/purchases", {
        method: "POST",
        body: JSON.stringify(purchase)
    });
};

export const getPurchases = (params = "") => {
    return api(`/purchases${params}`);
};

export const getUsers = (params = "") => {
    return api(`/users${params}`);
};

export const getUser = (id) => {
    return api(`/users/${id}`);
};

export const updateUserRole = (id, role_name) => {
    return api(`/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({
            role_name
        })
    });
};

export const getSalesReport = (params = "") => {
    return api(`/reports/sales${params}`);
};

export const getSalesSummary = (params = "") => {
    return api(`/reports/sales/summary${params}`);
};

export const getSalesByProduct = (params = "") => {
    return api(`/reports/sales/by-product${params}`);
};

export const getInventoryReport = () => {
    return api("/reports/inventory");
};

export const getTransactions = (params = "") => {
    return api(`/transactions${params}`);
};

export const getProductTransactions = (id, params = "") => {
    return api(`/transactions/product/${id}${params}`);
};
export default api;