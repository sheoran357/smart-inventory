import { useEffect, useState } from "react";

import {
    getUsers,
    updateUserRole
} from "../services/api";

import { useAuth } from "../context/AuthContext";

function Users() {
    const { user } = useAuth();

    const [users, setUsers] = useState([]);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updatingUser, setUpdatingUser] = useState(null);

    const isAdmin = user?.role_name === "ADMIN";

    useEffect(() => {
        loadUsers();
    }, [page, search, role]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            params.append("page", page);
            params.append("limit", limit);

            if (search.trim() !== "") {
                params.append("search", search.trim());
            }

            if (role !== "") {
                params.append("role", role);
            }

            const data = await getUsers(
                `?${params.toString()}`
            );

            setUsers(data.users);
            setTotalUsers(data.totalUsers);
            setTotalPages(data.totalPages);
            setHasNextPage(data.hasNextPage);
            setHasPreviousPage(data.hasPreviousPage);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleRoleFilter = (e) => {
        setRole(e.target.value);
        setPage(1);
    };

    const handleRoleChange = async (userId, currentRole) => {
        if (!isAdmin) {
            return;
        }

        const newRole =
            currentRole === "ADMIN"
                ? "MANAGER"
                : currentRole === "MANAGER"
                    ? "STAFF"
                    : "ADMIN";

        const confirmed = window.confirm(
            `Change this user's role from ${currentRole} to ${newRole}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingUser(userId);
            setError("");

            await updateUserRole(
                userId,
                newRole
            );

            await loadUsers();

        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingUser(null);
        }
    };

    if (loading) {
        return <p>Loading users...</p>;
    }

    return (
        <div>
            <h1>Users</h1>

            <p>
                Total Users: {totalUsers}
            </p>

            {error && (
                <p>
                    Error: {error}
                </p>
            )}

            <div>
                <label>Search</label>
                <br />

                <input
                    type="text"
                    placeholder="Search name or email"
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            <br />

            <div>
                <label>Role</label>
                <br />

                <select
                    value={role}
                    onChange={handleRoleFilter}
                >
                    <option value="">
                        All Roles
                    </option>

                    <option value="ADMIN">
                        ADMIN
                    </option>

                    <option value="MANAGER">
                        MANAGER
                    </option>

                    <option value="STAFF">
                        STAFF
                    </option>
                </select>
            </div>

            <br />

            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <>
                    <table
                        border="1"
                        cellPadding="10"
                    >
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>

                                {isAdmin && (
                                    <th>Action</th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((item) => (
                                <tr
                                    key={item.user_id}
                                >
                                    <td>
                                        {item.user_id}
                                    </td>

                                    <td>
                                        {item.name}
                                    </td>

                                    <td>
                                        {item.email}
                                    </td>

                                    <td>
                                        {item.role_name}
                                    </td>

                                    {isAdmin && (
                                        <td>
                                            <button
                                                onClick={() =>
                                                    handleRoleChange(
                                                        item.user_id,
                                                        item.role_name
                                                    )
                                                }
                                                disabled={
                                                    updatingUser ===
                                                    item.user_id
                                                }
                                            >
                                                {updatingUser ===
                                                item.user_id
                                                    ? "Updating..."
                                                    : "Change Role"}
                                            </button>
                                        </td>
                                    )}
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

export default Users;