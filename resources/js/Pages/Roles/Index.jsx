import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ roles, permissions }) {
    const { errors: pageErrors } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        nom_role: '',
        description_role: '',
        permission_ids: [],
    });

    const openAdd = () => {
        setEditingRole(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setData({
            nom_role: role.nom_role,
            description_role: role.description_role || '',
            permission_ids: role.permissions.map((p) => p.id),
        });
        clearErrors();
        setShowModal(true);
    };

    const togglePermission = (id) => {
        setData(
            'permission_ids',
            data.permission_ids.includes(id)
                ? data.permission_ids.filter((p) => p !== id)
                : [...data.permission_ids, id]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingRole) {
            put(route('roles.update', editingRole.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('roles.store'), {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const destroy = (id) => {
        if (confirm('Supprimer ce rôle ?')) {
            router.delete(route('roles.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Rôles" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-xl font-semibold">Rôles</h1>
                        <button
                            onClick={openAdd}
                            className="bg-gray-800 text-white px-4 py-2 rounded"
                        >
                            Ajouter un rôle
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Description</th>
                                    <th className="py-2">Permissions</th>
                                    <th className="py-2">Utilisateurs</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map((role) => (
                                    <tr key={role.id} className="border-b align-top">
                                        <td className="py-2 font-medium">{role.nom_role}</td>
                                        <td className="py-2 text-gray-600">{role.description_role}</td>
                                        <td className="py-2">
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.length === 0 && (
                                                    <span className="text-gray-400 text-sm">Aucune</span>
                                                )}
                                                {role.permissions.map((p) => (
                                                    <span
                                                        key={p.id}
                                                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                                    >
                                                        {p.nom_permission}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-2">{role.users_count}</td>
                                        <td className="py-2">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => openEdit(role)}
                                                    className="text-indigo-600 text-sm"
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => destroy(role.id)}
                                                    className="text-red-600 text-sm"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="lg">
                <form onSubmit={submit} className="p-6 space-y-4">
                    <h2 className="text-lg font-medium">
                        {editingRole ? 'Modifier le rôle' : 'Ajouter un rôle'}
                    </h2>

                    <div>
                        <input
                            type="text"
                            placeholder="Nom du rôle"
                            value={data.nom_role}
                            onChange={(e) => setData('nom_role', e.target.value)}
                            className="border rounded px-3 py-2 w-full"
                        />
                        {errors.nom_role && <p className="text-red-600 text-sm mt-1">{errors.nom_role}</p>}
                    </div>

                    <div>
                        <textarea
                            placeholder="Description"
                            value={data.description_role}
                            onChange={(e) => setData('description_role', e.target.value)}
                            className="border rounded px-3 py-2 w-full"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Permissions</p>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                            {permissions.length === 0 && (
                                <p className="text-gray-400 text-sm col-span-2">
                                    Aucune permission créée pour le moment.
                                </p>
                            )}
                            {permissions.map((p) => (
                                <label key={p.id} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.permission_ids.includes(p.id)}
                                        onChange={() => togglePermission(p.id)}
                                    />
                                    {p.nom_permission}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 text-sm">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-gray-800 text-white px-4 py-2 rounded text-sm"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}