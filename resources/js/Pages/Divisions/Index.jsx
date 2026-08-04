import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ divisions, departements }) {
    const { errors: pageErrors } = usePage().props;
    const [editingId, setEditingId] = useState(null);

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
        setEditingId(division.id);
        editForm.setData({
            nom_division: division.nom_division,
            departement_id: division.departement_id,
        });
    };

    const saveEdit = (e, id) => {
        e.preventDefault();
        editForm.put(route('divisions.update', id), {
            onSuccess: () => setEditingId(null),
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
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Ajouter une division</h1>
                        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={data.nom_division}
                                onChange={(e) => setData('nom_division', e.target.value)}
                                placeholder="Nom de la division"
                                className="border rounded px-3 py-2"
                            />
                            <select
                                value={data.departement_id}
                                onChange={(e) => setData('departement_id', e.target.value)}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">Département...</option>
                                {departements.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.nom_departement} ({d.direction?.nom_direction})
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gray-800 text-white px-4 py-2 rounded col-span-2"
                            >
                                Ajouter
                            </button>
                            {(errors.nom_division || errors.departement_id) && (
                                <div className="col-span-2 text-red-600 text-sm">
                                    {errors.nom_division && <p>{errors.nom_division}</p>}
                                    {errors.departement_id && <p>{errors.departement_id}</p>}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Divisions</h1>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Département</th>
                                    <th className="py-2">Services</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {divisions.map((division) => (
                                    <tr key={division.id} className="border-b">
                                        {editingId === division.id ? (
                                            <td colSpan={3} className="py-2">
                                                <form
                                                    onSubmit={(e) => saveEdit(e, division.id)}
                                                    className="flex gap-2"
                                                >
                                                    <input
                                                        value={editForm.data.nom_division}
                                                        onChange={(e) =>
                                                            editForm.setData('nom_division', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 flex-1"
                                                        autoFocus
                                                    />
                                                    <select
                                                        value={editForm.data.departement_id}
                                                        onChange={(e) =>
                                                            editForm.setData('departement_id', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1"
                                                    >
                                                        {departements.map((d) => (
                                                            <option key={d.id} value={d.id}>
                                                                {d.nom_departement}
                                                            </option>
                                                        ))}
                                                    </select>
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
                                                <td className="py-2">{division.nom_division}</td>
                                                <td className="py-2">
                                                    {division.departement?.nom_departement}
                                                    {division.departement?.direction &&
                                                        ` (${division.departement.direction.nom_direction})`}
                                                </td>
                                                <td className="py-2">{division.services_count}</td>
                                            </>
                                        )}
                                        <td className="py-2">
                                            {editingId !== division.id && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => startEdit(division)}
                                                        className="text-indigo-600 text-sm"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => destroy(division.id)}
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