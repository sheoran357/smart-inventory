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
    const [totalPages, setTotalPages] = useState(1);

    const [hasNextPage, setHasNextPage] =
        useState(false);

    const [hasPreviousPage, setHasPreviousPage] =
        useState(false);

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updatingUser, setUpdatingUser] =
        useState(null);

    const isAdmin = user?.role_name === "ADMIN";

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            params.append("page", page);
            params.append("limit", limit);

            if (search.trim() !== "") {
                params.append(
                    "search",
                    search.trim()
                );
            }

            if (role !== "") {
                params.append("role", role);
            }

            const data = await getUsers(
                `?${params.toString()}`
            );

            /*
             * Backend may return either:
             *
             * {
             *     users: [...],
             *     totalUsers: 10,
             *     totalPages: 1,
             *     hasNextPage: false,
             *     hasPreviousPage: false
             * }
             *
             * OR directly:
             *
             * [
             *     {...},
             *     {...}
             * ]
             */

            if (Array.isArray(data)) {
                setUsers(data);
                setTotalUsers(data.length);
                setTotalPages(1);
                setHasNextPage(false);
                setHasPreviousPage(false);
            } else {
                setUsers(
                    Array.isArray(data.users)
                        ? data.users
                        : []
                );

                setTotalUsers(
                    data.totalUsers || 0
                );

                setTotalPages(
                    data.totalPages || 1
                );

                setHasNextPage(
                    data.hasNextPage || false
                );

                setHasPreviousPage(
                    data.hasPreviousPage || false
                );
            }

        } catch (error) {
            setUsers([]);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, search, role]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleRoleFilter = (e) => {
        setRole(e.target.value);
        setPage(1);
    };

    const handleRoleChange = async (
        userId,
        currentRole
    ) => {
        if (!isAdmin) {
            return;
        }

        let newRole;

        if (currentRole === "ADMIN") {
            newRole = "MANAGER";
        } else if (currentRole === "MANAGER") {
            newRole = "STAFF";
        } else {
            newRole = "ADMIN";
        }

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
        return (
            <p>
                Loading users...
            </p>
        );
    }

    return (
        <div className="users-page">

            <div className="page-header">
                <div>
                    <h1>Users</h1>

                    <p className="page-subtitle">
                        Manage system users and their roles
                    </p>
                </div>
            </div>

            <p className="user-count">
                Total Users: {totalUsers}
            </p>

            {error && (
                <p className="error">
                    Error: {error}
                </p>
            )}

            <div className="user-filters">

                <div>
                    <label>
                        Search
                    </label>
                    <br />

                    <input
                        type="text"
                        placeholder="Search name or email"
                        value={search}
                        onChange={handleSearch}
                    />
                </div>

                <div>
                    <label>
                        Role
                    </label>
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

            </div>

            <section className="user-list">

                <div className="section-header">
                    <div>
                        <h2>User List</h2>

                        <p className="page-subtitle">
                            Manage registered users and access roles
                        </p>
                    </div>
                </div>

                {users.length === 0 ? (
                    <p>
                        No users found.
                    </p>
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
                                        <th>
                                            Action
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {users.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item.user_id
                                            }
                                        >
                                            <td>
                                                {
                                                    item.user_id
                                                }
                                            </td>

                                            <td>
                                                {item.name}
                                            </td>

                                            <td>
                                                {item.email}
                                            </td>

                                            <td>
                                                {
                                                    item.role_name ||
                                                    item.role
                                                }
                                            </td>

                                            {isAdmin && (
                                                <td>
                                                    <button
                                                        onClick={() =>
                                                            handleRoleChange(
                                                                item.user_id,
                                                                item.role_name ||
                                                                    item.role
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
                                    )
                                )}
                            </tbody>
                        </table>

                        <br />

                        <div className="pagination">

                            <button
                                onClick={() =>
                                    setPage(
                                        page - 1
                                    )
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
                                    setPage(
                                        page + 1
                                    )
                                }
                                disabled={
                                    !hasNextPage
                                }
                            >
                                Next
                            </button>

                        </div>
                    </>
                )}

            </section>

        </div>
    );
}

export default Users;