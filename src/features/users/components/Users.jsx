import { useEffect, useMemo, useState } from "react"
import { useUserManagmentStore } from "../store/useUserManagmentStore.js"
import { Spinner } from "../../../shared/components/layouts/Spinner.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast.js";
import { CreateUserModal } from "./CreateUserModal.jsx";
import { useAuthStore } from "../../auth/store/authStore.js";
import { UserDetailModal } from "./UserDetailModel.jsx";

const PAGE_SIZE = 8;
const ROLE_OPTIONS = ["PLATFORM_ADMIN", "RESTAURANT_ADMIN", "CUSTOMER"];

const roleBadgeClass = {
    PLATFORM_ADMIN: "bg-accent/20 text-accent border border-accent/30",
    RESTAURANT_ADMIN: "bg-warning/20 text-warning border border-warning/30",
    CUSTOMER: "bg-success/20 text-success border border-success/30",
};

export const Users = () => {

    const { users, loading, error, fetchUsers, updateUserRole } = useUserManagmentStore();
    const registerUser = useAuthStore((state) => state.register)
    const currentUser = useAuthStore((state) => state.user)

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers])

    useEffect(() => {
        if (error) {
            showError(error);
        }
    }, [error])

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return users.filter((u) => {
            const fullName = `${u.name || ""} ${u.surname || ""}`
                .trim()
                .toLowerCase();

            const username = (u.username || "").toLowerCase();
            const role = (u.role || "").toUpperCase();

            const matchesSearch =
                !normalizedSearch ||
                fullName.includes(normalizedSearch) ||
                username.includes(normalizedSearch);

            const matchesRole =
                roleFilter === "ALL" ? true : role === roleFilter.toUpperCase();

            return matchesRole && matchesSearch;
        })
    }, [users, search, roleFilter])

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredUsers, currentPage])

    const handleCreate = async (formData) => {
        const res = await registerUser(formData)
        console.log(res)
        if (res.success) {
            showSuccess("Usuairo creado. Se envió un correo de verificación.");
            await fetchUsers(undefined, { force: true });
            return true;
        }
        showError(res.error || "No se puedo crear el usuario");
        return false;
    }

    const handleSaveRole = async (user, newRole) => {
        const res = await updateUserRole(user.id, newRole);
        if (res.success) {
            showSuccess("Rol actualizado correctamente")
            setOpenDetailModal(false);
            setSelectedUser(null);
        } else {
            showError(res.error || "No se pudo actualizar el rol");
        }
    }

    const handleOpenDetail = (user) => {
        setSelectedUser(user)
        setOpenDetailModal(true);
    }

    return (
        <div className="p-4">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-accent font-serif">Usuarios</h1>
                    <p className="text-accent/80 mt-1 text-sm font-medium">
                        Administra usuarios, consulta su información y cambia su rol
                    </p>
                </div>

                <button
                    className="bg-accent px-6 py-2 rounded-xl text-bg-dark font-bold hover:bg-gold-light shadow-lg transition flex items-center gap-2"
                    onClick={() => setOpenCreateModal(true)}
                >
                    + Agregar Usuario
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Buscar por nombre o username..."
                        className="md:col-span-2 w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value)
                            setPage(1)
                        }}
                        className="w-full px-4 py-2 border border-accent/20 bg-bg-page rounded-lg text-text-body focus:outline-none focus:border-accent transition-colors cursor-pointer"
                    >
                        <option value="ALL">Todos los roles</option>
                        {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-bg-card rounded-xl border border-accent/10 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">

                        {/* Head */}
                        <thead className="bg-bg-page/50 text-text-body border-b border-accent/10">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Nombre</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Username</th>
                                <th className="text-left px-6 py-4 font-semibold uppercase tracking-wider text-xs">Rol</th>
                                <th className="text-right px-6 py-4 font-semibold uppercase tracking-wider text-xs">Acciones</th>
                            </tr>
                        </thead>

                        {/* Body (datos de ejemplo) */}
                        <tbody className="divide-y divide-accent/10">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td
                                        className="px-6 py-8 text-center text-text-muted"
                                        colSpan={4}
                                    >
                                        No hay usuarios para mostrar.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-bg-page/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-text-body">
                                            {[u.name, u.surname].filter(Boolean).join(" ") || "-"}
                                        </td>

                                        <td className="px-6 py-4 text-text-muted">
                                            @{u.username}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${roleBadgeClass[u.role] || "bg-bg-page text-text-muted border border-accent/20"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className="px-4 py-2 rounded-lg bg-bg-page/50 hover:bg-accent/10 border border-accent/20 text-accent text-xs font-semibold transition-colors"
                                                onClick={() => handleOpenDetail(u)}
                                            >
                                                Ver / Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-accent/10 bg-bg-page/20">
                    <p className="text-xs text-text-muted">
                        Mostrando {" "}
                        {(currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0)}
                        {" - "}
                        {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de{" "}
                        {filteredUsers.length}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>

                        <span className="px-4 py-2 text-sm font-semibold text-text-body">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-accent/20 bg-bg-page hover:bg-accent/10 text-text-body text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            <CreateUserModal
                isOpen={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onCreate={handleCreate}
                loading={loading}
                error={error}
            />

            <UserDetailModal
                key={selectedUser?.id || "no-user"}
                isOpen={openDetailModal}
                onClose={() => {
                    setOpenDetailModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                onSaveRole={handleSaveRole}
                currentUserId={currentUser?.id}
                loading={loading}
            />
        </div >
    );
}