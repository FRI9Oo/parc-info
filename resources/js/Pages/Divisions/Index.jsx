import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ divisions, departements }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;

    const canCreate = isAdmin || permissions.includes('creer_division') || permissions.includes('gerer_divisions') || permissions.includes('gerer_structure') || permissions.includes('modifier_structure');
    const canEdit = isAdmin || permissions.includes('modifier_division') || permissions.includes('gerer_divisions') || permissions.includes('gerer_structure') || permissions.includes('modifier_structure');
    const canDelete = isAdmin || permissions.includes('supprimer_division') || permissions.includes('gerer_divisions') || permissions.includes('gerer_structure') || permissions.includes('supprimer_structure');
    const hasAnyAction = canEdit || canDelete;

    const [editingDivision, setEditingDivision] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        nom_division: '',
        departement_id: '',
    });

    const editForm = useForm({ nom_division: '', departement_id: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('divisions.store'), { onSuccess: () => reset() });
    };

    const startEdit = (division) => {
        setEditingDivision(division);
        editForm.setData({
            nom_division: division.nom_division,
            departement_id: division.departement_id,
        });
        editForm.clearErrors();
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingDivision) return;
        editForm.put(route('divisions.update', editingDivision.id), {
            onSuccess: () => setEditingDivision(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer cette division ?')) {
            router.delete(route('divisions.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Divisions" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {pageErrors?.delete && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded shadow-sm">
                            {pageErrors.delete}
                        </div>
                    )}

                    {canCreate && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <h1 className="text-xl font-semibold mb-4 text-gray-800">Ajouter une division</h1>
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={data.nom_division}
                                    onChange={(e) => setData('nom_division', e.target.value)}
                                    placeholder="Nom de la division *"
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#11508f]"
                                    required
                                />
                                <select
                                    value={data.departement_id}
                                    onChange={(e) => setData('departement_id', e.target.value)}
                                    className="border rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#11508f]"
                                    required
                                >
                                    <option value="">Sélectionner un département...</option>
                                    {departements.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nom_departement} ({d.direction?.nom_direction})
                                        </option>
                                    ))}
                                </select>
                                <div className="md:col-span-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#11508f] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#0d3d6e] transition disabled:opacity-50"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            </form>
                            {(errors.nom_division || errors.departement_id) && (
                                <div className="mt-2 text-red-600 text-xs">
                                    {errors.nom_division && <p>{errors.nom_division}</p>}
                                    {errors.departement_id && <p>{errors.departement_id}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4 text-gray-800">Liste des Divisions</h1>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50 text-sm">
                                    <th className="py-2.5 px-3">Nom</th>
                                    <th className="py-2.5 px-3">Département</th>
                                    <th className="py-2.5 px-3 text-center">Services Rattachés</th>
                                    {hasAnyAction && <th className="py-2.5 px-3 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {divisions.map((division) => (
                                    <tr key={division.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="py-2.5 px-3 font-medium text-gray-900">{division.nom_division}</td>
                                        <td className="py-2.5 px-3 text-gray-600">
                                            {division.departement?.nom_departement}
                                            {division.departement?.direction &&
                                                ` (${division.departement.direction.nom_direction})`}
                                        </td>
                                        <td className="py-2.5 px-3 text-center text-gray-600">{division.services_count}</td>
                                        {hasAnyAction && (
                                            <td className="py-2.5 px-3 text-right">
                                                <div className="flex justify-end items-center gap-1.5">
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => startEdit(division)}
                                                            title="Modifier la division"
                                                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                        >
                                                            ✏️
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => destroy(division.id)}
                                                            title="Supprimer la division"
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

            {/* Modal de Modification d'une Division */}
            <Modal show={editingDivision !== null} onClose={() => setEditingDivision(null)} maxWidth="md">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                        Modifier la division
                    </h2>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de la division *</label>
                            <input
                                type="text"
                                value={editForm.data.nom_division}
                                onChange={(e) => editForm.setData('nom_division', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                            {editForm.errors.nom_division && (
                                <p className="text-red-600 text-xs mt-1">{editForm.errors.nom_division}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Département de rattachement *</label>
                            <select
                                value={editForm.data.departement_id}
                                onChange={(e) => editForm.setData('departement_id', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                required
                            >
                                <option value="">Sélectionner un département...</option>
                                {departements.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.nom_departement} ({d.direction?.nom_direction})
                                    </option>
                                ))}
                            </select>
                            {editForm.errors.departement_id && (
                                <p className="text-red-600 text-xs mt-1">{editForm.errors.departement_id}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setEditingDivision(null)}
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