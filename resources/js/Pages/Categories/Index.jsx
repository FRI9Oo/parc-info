import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ categories }) {
    const { errors: pageErrors } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        nom_categorie: '',
    });

    const editForm = useForm({ nom_categorie: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('categories.store'), { onSuccess: () => reset() });
    };

    const startEdit = (categorie) => {
        setEditingId(categorie.id);
        editForm.setData('nom_categorie', categorie.nom_categorie);
    };

    const saveEdit = (e, id) => {
        e.preventDefault();
        editForm.put(route('categories.update', id), {
            onSuccess: () => setEditingId(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer cette catégorie ?')) {
            router.delete(route('categories.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Catégories" />
            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Ajouter une catégorie</h1>
                        <form onSubmit={submit} className="flex gap-3">
                            <input
                                type="text"
                                value={data.nom_categorie}
                                onChange={(e) => setData('nom_categorie', e.target.value)}
                                placeholder="Nom de la catégorie"
                                className="border rounded px-3 py-2 flex-1"
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gray-800 text-white px-4 py-2 rounded"
                            >
                                Ajouter
                            </button>
                        </form>
                        {errors.nom_categorie && (
                            <p className="text-red-600 text-sm mt-2">{errors.nom_categorie}</p>
                        )}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Catégories</h1>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Matériels</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="border-b">
                                        {editingId === cat.id ? (
                                            <td colSpan={2} className="py-2">
                                                <form
                                                    onSubmit={(e) => saveEdit(e, cat.id)}
                                                    className="flex gap-2"
                                                >
                                                    <input
                                                        value={editForm.data.nom_categorie}
                                                        onChange={(e) =>
                                                            editForm.setData('nom_categorie', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 flex-1"
                                                        autoFocus
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
                                                <td className="py-2">{cat.nom_categorie}</td>
                                                <td className="py-2">{cat.materiels_count}</td>
                                            </>
                                        )}
                                        <td className="py-2">
                                            {editingId !== cat.id && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => startEdit(cat)}
                                                        className="text-indigo-600 text-sm"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => destroy(cat.id)}
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