import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ users, roles, employes }) {
    const { auth, errors: pageErrors } = usePage().props;
    const currentUser = auth.user;

    // ---------- Search & Filter State ----------
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            if (roleFilter !== 'all') {
                if (roleFilter === 'none' && u.role_id) return false;
                if (roleFilter !== 'none' && String(u.role_id) !== String(roleFilter)) return false;
            }

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
    }, [users, searchQuery, roleFilter]);

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

    // ---------- Delete User ----------
    const destroyUser = (u) => {
        if (u.id === currentUser.id) {
            alert('Vous ne pouvez pas supprimer votre propre compte.');
            return;
        }

        if (confirm(`Supprimer l'utilisateur ${u.name} ?`)) {
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
            <Head title="Gestion des Utilisateurs" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {pageErrors?.delete && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded shadow-sm">
                            {pageErrors.delete}
                        </div>
                    )}

                    {/* Card: Ajouter un utilisateur */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4 text-gray-800">Ajouter un utilisateur</h1>

                        <form onSubmit={submitAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Nom complet *</label>
                                <input
                                    type="text"
                                    placeholder="ex: Ahmed Benali"
                                    value={addData.name}
                                    onChange={(e) => setAddData({ ...addData, name: e.target.value })}
                                    className="border rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                {pageErrors?.name && <span className="text-red-600 text-xs">{pageErrors.name}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Adresse Email *</label>
                                <input
                                    type="email"
                                    placeholder="ex: ahmed@example.com"
                                    value={addData.email}
                                    onChange={(e) => setAddData({ ...addData, email: e.target.value })}
                                    className="border rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                {pageErrors?.email && <span className="text-red-600 text-xs">{pageErrors.email}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe *</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={addData.password}
                                    onChange={(e) => setAddData({ ...addData, password: e.target.value })}
                                    className="border rounded px-3 py-2 text-sm w-full focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                {pageErrors?.password && <span className="text-red-600 text-xs">{pageErrors.password}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Rôle Système</label>
                                <select
                                    value={addData.role_id}
                                    onChange={(e) => setAddData({ ...addData, role_id: e.target.value })}
                                    className="border rounded px-3 py-2 text-sm w-full"
                                >
                                    <option value="">-- Aucun rôle --</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>{r.nom_role}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Employé Associé (Optionnel)</label>
                                <select
                                    value={addData.employe_id}
                                    onChange={(e) => setAddData({ ...addData, employe_id: e.target.value })}
                                    className="border rounded px-3 py-2 text-sm w-full"
                                >
                                    <option value="">-- Aucun employé associé --</option>
                                    {employes.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.nom} {e.prenom} (Matricule: {e.matricule})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gray-800 text-white px-5 py-2 rounded text-sm hover:bg-gray-700 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Création...' : 'Créer l\'utilisateur'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Card: Liste des utilisateurs */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h1 className="text-xl font-semibold text-gray-800">Liste des Utilisateurs ({filteredUsers.length})</h1>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 md:max-w-xl">
                                <input
                                    type="text"
                                    placeholder="Rechercher (Nom, Email, Rôle, Employé...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border rounded px-3 py-1.5 text-sm w-full"
                                />

                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="border rounded px-3 py-1.5 text-sm w-full bg-white"
                                >
                                    <option value="all">Tous les rôles</option>
                                    <option value="none">Sans rôle assigné</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>{r.nom_role}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-sm">
                                        <th className="py-2 px-3 whitespace-nowrap">Nom</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Email</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Employé Fiche</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Rôle</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                                            <td className="py-2 px-3 font-medium text-gray-900 whitespace-nowrap">
                                                {u.name}
                                                {u.id === currentUser.id && (
                                                    <span className="ms-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Vous</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-3 whitespace-nowrap">{u.email}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">
                                                {u.employe ? (
                                                    <span className="text-gray-700">
                                                        {u.employe.nom} {u.employe.prenom} ({u.employe.matricule})
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">—</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-3 whitespace-nowrap">
                                                <select
                                                    value={u.role_id || ''}
                                                    onChange={(e) => changeRole(u.id, e.target.value)}
                                                    className="border rounded px-2 py-1 text-xs bg-white"
                                                >
                                                    <option value="">-- Aucun rôle --</option>
                                                    {roles.map((r) => (
                                                        <option key={r.id} value={r.id}>{r.nom_role}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-2 px-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => openEdit(u)}
                                                        className="text-blue-600 font-medium text-xs hover:underline"
                                                    >
                                                        Éditer
                                                    </button>

                                                    {u.id !== currentUser.id && (
                                                        <button
                                                            onClick={() => destroyUser(u)}
                                                            className="text-red-600 font-medium text-xs hover:underline"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Éditer Utilisateur */}
            <Modal show={!!editState} onClose={() => setEditState(null)} maxWidth="md">
                {editState && (
                    <form onSubmit={submitEdit} className="p-6 space-y-4">
                        <h2 className="text-lg font-medium text-gray-900">Éditer l'utilisateur</h2>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nom complet *</label>
                            <input
                                type="text"
                                value={editState.name}
                                onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                                className="border rounded px-3 py-2 text-sm w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Adresse Email *</label>
                            <input
                                type="email"
                                value={editState.email}
                                onChange={(e) => setEditState({ ...editState, email: e.target.value })}
                                className="border rounded px-3 py-2 text-sm w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nouveau mot de passe <span className="text-gray-400 font-normal">(Laisser vide pour ne pas modifier)</span>
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={editState.password}
                                onChange={(e) => setEditState({ ...editState, password: e.target.value })}
                                className="border rounded px-3 py-2 text-sm w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Rôle Système</label>
                            <select
                                value={editState.role_id}
                                onChange={(e) => setEditState({ ...editState, role_id: e.target.value })}
                                className="border rounded px-3 py-2 text-sm w-full"
                            >
                                <option value="">-- Aucun rôle --</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.nom_role}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Employé Associé</label>
                            <select
                                value={editState.employe_id}
                                onChange={(e) => setEditState({ ...editState, employe_id: e.target.value })}
                                className="border rounded px-3 py-2 text-sm w-full"
                            >
                                <option value="">-- Aucun employé associé --</option>
                                {employes.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.nom} {e.prenom} ({e.matricule})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditState(null)}
                                className="text-gray-500 text-sm"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}