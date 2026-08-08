import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ categories }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;

    const canCreate = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('creer_materiel');
    const canEdit = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('modifier_materiel');
    const canDelete = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('supprimer_materiel');
    const hasAnyAction = canEdit || canDelete;

    const [editingCategorie, setEditingCategorie] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        nom_categorie: '',
    });

    const editForm = useForm({ nom_categorie: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('categories.store'), { onSuccess: () => reset() });
    };

    const startEdit = (categorie) => {
        setEditingCategorie(categorie);
        editForm.setData('nom_categorie', categorie.nom_categorie);
        editForm.clearErrors();
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingCategorie) return;
        editForm.put(route('categories.update', editingCategorie.id), {
            onSuccess: () => setEditingCategorie(null),
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
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {pageErrors?.delete && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}

                    {canCreate && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <h1 className="text-xl font-semibold mb-4">Ajouter une catégorie</h1>
                            <form onSubmit={submit} className="flex gap-3">
                                <input
                                    type="text"
                                    value={data.nom_categorie}
                                    onChange={(e) => setData('nom_categorie', e.target.value)}
                                    placeholder="Nom de la catégorie *"
                                    className="border rounded px-3 py-2 text-sm flex-1 focus:ring-1 focus:ring-[#11508f]"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#11508f] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#0d3d6e] transition disabled:opacity-50"
                                >
                                    Ajouter
                                </button>
                            </form>
                            {errors.nom_categorie && (
                                <p className="text-red-600 text-xs mt-2">{errors.nom_categorie}</p>
                            )}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4 text-gray-800">Inventaire des Catégories</h1>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50 text-sm">
                                    <th className="py-2.5 px-3">Nom</th>
                                    <th className="py-2.5 px-3 text-center">Matériels Associés</th>
                                    {hasAnyAction && <th className="py-2.5 px-3 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="py-2.5 px-3 font-medium text-gray-900">{cat.nom_categorie}</td>
                                        <td className="py-2.5 px-3 text-center text-gray-600">{cat.materiels_count}</td>
                                        {hasAnyAction && (
                                            <td className="py-2.5 px-3 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => startEdit(cat)}
                                                            title="Modifier la catégorie"
                                                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                        >
                                                            ✏️
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => destroy(cat.id)}
                                                            title="Supprimer la catégorie"
                                                            className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Modification d'une Catégorie */}
            <Modal show={editingCategorie !== null} onClose={() => setEditingCategorie(null)} maxWidth="md">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                        Modifier la catégorie
                    </h2>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de la catégorie *</label>
                        <input
                            type="text"
                            value={editForm.data.nom_categorie}
                            onChange={(e) => editForm.setData('nom_categorie', e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                            required
                        />
                        {editForm.errors.nom_categorie && (
                            <p className="text-red-600 text-xs mt-1">{editForm.errors.nom_categorie}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setEditingCategorie(null)}
                            className="text-slate-600 text-sm font-medium px-4 py-2 hover:text-slate-900"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="bg-[#11508f] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0d3d6e] transition disabled:opacity-50"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}