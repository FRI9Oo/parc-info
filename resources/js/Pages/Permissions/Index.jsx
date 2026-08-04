import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ permissions }) {
    const { errors: pageErrors } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        nom_permission: '',
        description_permission: '',
    });

    const editForm = useForm({ nom_permission: '', description_permission: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('permissions.store'), { onSuccess: () => reset() });
    };

    const startEdit = (permission) => {
        setEditingId(permission.id);
        editForm.setData({
            nom_permission: permission.nom_permission,
            description_permission: permission.description_permission || '',
        });
    };

    const saveEdit = (e, id) => {
        e.preventDefault();
        editForm.put(route('permissions.update', id), {
            onSuccess: () => setEditingId(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer cette permission ?')) {
            router.delete(route('permissions.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Permissions" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Ajouter une permission</h1>
                        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={data.nom_permission}
                                onChange={(e) => setData('nom_permission', e.target.value)}
                                placeholder="Nom de la permission"
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="text"
                                value={data.description_permission}
                                onChange={(e) => setData('description_permission', e.target.value)}
                                placeholder="Description"
                                className="border rounded px-3 py-2"
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gray-800 text-white px-4 py-2 rounded col-span-2"
                            >
                                Ajouter
                            </button>
                            {(errors.nom_permission || errors.description_permission) && (
                                <div className="col-span-2 text-red-600 text-sm">
                                    {errors.nom_permission && <p>{errors.nom_permission}</p>}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Permissions</h1>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Description</th>
                                    <th className="py-2">Rôles</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.map((permission) => (
                                    <tr key={permission.id} className="border-b">
                                        {editingId === permission.id ? (
                                            <td colSpan={3} className="py-2">
                                                <form
                                                    onSubmit={(e) => saveEdit(e, permission.id)}
                                                    className="flex gap-2"
                                                >
                                                    <input
                                                        value={editForm.data.nom_permission}
                                                        onChange={(e) =>
                                                            editForm.setData('nom_permission', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 flex-1"
                                                        autoFocus
                                                    />
                                                    <input
                                                        value={editForm.data.description_permission}
                                                        onChange={(e) =>
                                                            editForm.setData('description_permission', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 flex-1"
                                                    />
                                                    <button type="submit" className="text-green-700 text-sm">
                                                        Enregistrer
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingId(null)}
                                                        className="text-gray-500 text-sm"
                                                    >
                                                        Annuler
                                                    </button>
                                                </form>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="py-2">{permission.nom_permission}</td>
                                                <td className="py-2 text-gray-600">
                                                    {permission.description_permission}
                                                </td>
                                                <td className="py-2">{permission.roles_count}</td>
                                            </>
                                        )}
                                        <td className="py-2">
                                            {editingId !== permission.id && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => startEdit(permission)}
                                                        className="text-indigo-600 text-sm"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => destroy(permission.id)}
                                                        className="text-red-600 text-sm"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}