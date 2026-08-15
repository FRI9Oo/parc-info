import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ users, roles, employes }) {
    const { auth, errors: pageErrors } = usePage().props;
    const { t } = useLanguage();
    const currentUser = auth.user;

    // ---------- Search & Filter State ----------
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            // Status filter
            if (statusFilter === 'active' && !u.is_active) return false;
            if (statusFilter === 'inactive' && u.is_active) return false;

            // Role filter
            if (roleFilter !== 'all') {
                if (roleFilter === 'none' && u.role_id) return false;
                if (roleFilter !== 'none' && String(u.role_id) !== String(roleFilter)) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchName = u.name?.toLowerCase().includes(q);
                const matchEmail = u.email?.toLowerCase().includes(q);
                const matchRole = u.role?.nom_role?.toLowerCase().includes(q);
                const matchEmp = u.employe
                    ? `${u.employe.nom} ${u.employe.prenom} ${u.employe.matricule}`.toLowerCase().includes(q)
                    : false;

                return matchName || matchEmail || matchRole || matchEmp;
            }

            return true;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // ---------- Pagination ----------
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: paginatedUsers,
    } = usePagination(filteredUsers, 10, [searchQuery, roleFilter, statusFilter]);

    // ---------- Form Add User ----------
    const [addData, setAddData] = useState({
        name: '',
        email: '',
        password: '',
        role_id: '',
        employe_id: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitAdd = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route('users.store'), addData, {
            onSuccess: () => {
                setAddData({ name: '', email: '', password: '', role_id: '', employe_id: '' });
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    // ---------- Form Edit User ----------
    const [editState, setEditState] = useState(null);

    const openEdit = (u) => {
        setEditState({
            id: u.id,
            name: u.name,
            email: u.email,
            password: '',
            role_id: u.role_id || '',
            employe_id: u.employe_id || '',
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editState) return;

        router.put(route('users.update', editState.id), editState, {
            onSuccess: () => setEditState(null),
        });
    };

    // ---------- Reset Password Modal ----------
    const [resetState, setResetState] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const openReset = (u) => {
        setResetState(u);
        setNewPassword('');
    };

    const submitReset = (e) => {
        e.preventDefault();
        if (!resetState) return;

        router.put(route('users.reset-password', resetState.id), { password: newPassword }, {
            onSuccess: () => setResetState(null),
        });
    };

    // ---------- Toggle Status ----------
    const toggleStatus = (u) => {
        if (u.id === currentUser.id) {
            alert('Vous ne pouvez pas désactiver votre propre compte.');
            return;
        }

        const actionText = u.is_active ? 'désactiver' : 'activer';
        if (confirm(`Voulez-vous ${actionText} le compte de ${u.name} ?`)) {
            router.put(route('users.toggle-status', u.id));
        }
    };

    // ---------- Delete User ----------
    const destroyUser = (u) => {
        if (u.id === currentUser.id) {
            alert('Vous ne pouvez pas supprimer votre propre compte.');
            return;
        }

        if (confirm(`Supprimer définitivement l'utilisateur ${u.name} ?`)) {
            router.delete(route('users.destroy', u.id));
        }
    };

    // ---------- Inline Quick Role Switch ----------
    const changeRole = (userId, roleId) => {
        router.put(route('users.update-role', userId), {
            role_id: roleId || null,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('users_title')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {pageErrors?.delete && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded shadow-sm">
                            {pageErrors.delete}
                        </div>
                    )}
                    {pageErrors?.status && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded shadow-sm">
                            {pageErrors.status}
                        </div>
                    )}

                    {/* Card: Ajouter un utilisateur */}
                    <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                        <h2 className="text-base font-extrabold mb-4 text-slate-800 flex items-center gap-2">
                            <span>➕</span> {t('users_add_new')}
                        </h2>

                        <form onSubmit={submitAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t('users_name')} <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="ex: Youssef El Alami"
                                    value={addData.name}
                                    onChange={(e) => setAddData({ ...addData, name: e.target.value })}
                                    className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                        pageErrors?.name ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                    }`}
                                    required
                                />
                                {pageErrors?.name && <span className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {pageErrors.name}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t('users_email')} <span className="text-rose-500">*</span></label>
                                <input
                                    type="email"
                                    placeholder="ex: y.elalami@example.com"
                                    value={addData.email}
                                    onChange={(e) => setAddData({ ...addData, email: e.target.value })}
                                    className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                        pageErrors?.email ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                    }`}
                                    required
                                />
                                {pageErrors?.email && <span className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {pageErrors.email}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t('users_password')} <span className="text-rose-500">*</span></label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={addData.password}
                                    onChange={(e) => setAddData({ ...addData, password: e.target.value })}
                                    className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                        pageErrors?.password ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                    }`}
                                    required
                                />
                                {pageErrors?.password && <span className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {pageErrors.password}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t('roles')}</label>
                                <select
                                    value={addData.role_id}
                                    onChange={(e) => setAddData({ ...addData, role_id: e.target.value })}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm w-full bg-white focus:ring-2 focus:ring-[#11508f]"
                                >
                                    <option value="">-- {t('users_no_role')} --</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>🛡️ {r.nom_role}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1">{t('employes')} ({t('optional')})</label>
                                <select
                                    value={addData.employe_id}
                                    onChange={(e) => setAddData({ ...addData, employe_id: e.target.value })}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm w-full bg-white focus:ring-2 focus:ring-[#11508f]"
                                >
                                    <option value="">-- {t('none')} --</option>
                                    {employes.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            👤 {e.nom} {e.prenom} ({e.matricule})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-3 flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-[#11508f] text-white px-6 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#0d3d6e] transition shadow-md shadow-[#11508f]/20 disabled:opacity-50"
                                >
                                    {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Card: Liste des utilisateurs */}
                    <div className="lux-card p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('users_title')} ({filteredUsers.length})</h1>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 md:max-w-2xl">
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f] bg-slate-50/50"
                                />

                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                >
                                    <option value="all">{t('all')} {t('roles')}</option>
                                    <option value="none">{t('users_no_role')}</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>{r.nom_role}</option>
                                    ))}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border rounded-lg px-3 py-1.5 text-sm w-full bg-white"
                                >
                                    <option value="all">{t('all')}</option>
                                    <option value="active">{t('active')}</option>
                                    <option value="inactive">{t('inactive')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50 text-xs text-slate-600 font-semibold uppercase tracking-wider">
                                        <th className="py-3 px-3">{t('users_name')}</th>
                                        <th className="py-3 px-3">{t('users_email')}</th>
                                        <th className="py-3 px-3">{t('users_status')}</th>
                                        <th className="py-3 px-3">{t('employes')}</th>
                                        <th className="py-3 px-3">{t('roles')}</th>
                                        <th className="py-3 px-3 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {paginatedUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50 transition">
                                            <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                                                {u.name}
                                                {u.id === currentUser.id && (
                                                    <span className="ms-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">{t('you')}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 whitespace-nowrap text-slate-600">{u.email}</td>
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                {u.is_active ? (
                                                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                                        {t('active')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                                        {t('inactive')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                {u.employe ? (
                                                    <span className="text-slate-700">
                                                        {u.employe.nom} {u.employe.prenom} ({u.employe.matricule})
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">—</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                <select
                                                    value={u.role_id || ''}
                                                    onChange={(e) => changeRole(u.id, e.target.value)}
                                                    className="border rounded-lg px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-[#11508f]"
                                                >
                                                    <option value="">-- {t('users_no_role')} --</option>
                                                    {roles.map((r) => (
                                                        <option key={r.id} value={r.id}>{r.nom_role}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3 px-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEdit(u)}
                                                        title={t('edit')}
                                                        className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                    >
                                                        ✏️
                                                    </button>

                                                    <button
                                                        onClick={() => openReset(u)}
                                                        title={t('users_reset_password')}
                                                        className="p-1.5 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition"
                                                    >
                                                        🔑
                                                    </button>

                                                    {u.id !== currentUser.id && (
                                                        <>
                                                            <button
                                                                onClick={() => toggleStatus(u)}
                                                                title={u.is_active ? t('inactive') : t('active')}
                                                                className={`p-1.5 rounded-lg transition ${u.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                                            >
                                                                {u.is_active ? '🚫' : '✅'}
                                                            </button>

                                                            <button
                                                                onClick={() => destroyUser(u)}
                                                                title={t('delete')}
                                                                className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Éditer Utilisateur */}
            <Modal show={!!editState} onClose={() => setEditState(null)} maxWidth="md">
                {editState && (
                    <form onSubmit={submitEdit} className="p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">{t('users_edit', { name: editState.name })}</h2>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">{t('users_name')} *</label>
                            <input
                                type="text"
                                value={editState.name}
                                onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">{t('users_email')} *</label>
                            <input
                                type="email"
                                value={editState.email}
                                onChange={(e) => setEditState({ ...editState, email: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">{t('roles')}</label>
                            <select
                                value={editState.role_id}
                                onChange={(e) => setEditState({ ...editState, role_id: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                            >
                                <option value="">-- {t('users_no_role')} --</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.nom_role}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">{t('employes')}</label>
                            <select
                                value={editState.employe_id}
                                onChange={(e) => setEditState({ ...editState, employe_id: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                            >
                                <option value="">-- {t('none')} --</option>
                                {employes.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.nom} {e.prenom} ({e.matricule})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setEditState(null)}
                                className="text-slate-600 text-sm font-medium px-4 py-2 hover:text-slate-900"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                className="bg-[#11508f] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0d3d6e] transition"
                            >
                                {t('save')}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal Réinitialiser Mot de passe */}
            <Modal show={!!resetState} onClose={() => setResetState(null)} maxWidth="md">
                {resetState && (
                    <form onSubmit={submitReset} className="p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                            {t('users_reset_password')} : {resetState.name}
                        </h2>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">{t('users_new_password')} *</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setResetState(null)}
                                className="text-slate-600 text-sm font-medium px-4 py-2 hover:text-slate-900"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                className="bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-800 transition"
                            >
                                {t('users_reset_password')}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}