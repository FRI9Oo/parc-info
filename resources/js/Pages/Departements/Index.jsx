import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ departements, directions }) {
    const { errors: pageErrors } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        nom_departement: '',
        direction_id: '',
    });

    const editForm = useForm({ nom_departement: '', direction_id: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('departements.store'), { onSuccess: () => reset() });
    };

    const startEdit = (departement) => {
        setEditingId(departement.id);
        editForm.setData({
            nom_departement: departement.nom_departement,
            direction_id: departement.direction_id,
        });
    };

    const saveEdit = (e, id) => {
        e.preventDefault();
        editForm.put(route('departements.update', id), {
            onSuccess: () => setEditingId(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer ce département ?')) {
            router.delete(route('departements.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Départements" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Ajouter un département</h1>
                        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={data.nom_departement}
                                onChange={(e) => setData('nom_departement', e.target.value)}
                                placeholder="Nom du département"
                                className="border rounded px-3 py-2"
                            />
                            <select
                                value={data.direction_id}
                                onChange={(e) => setData('direction_id', e.target.value)}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">Direction...</option>
                                {directions.map((d) => (
                                    <option key={d.id} value={d.id}>{d.nom_direction}</option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gray-800 text-white px-4 py-2 rounded col-span-2"
                            >
                                Ajouter
                            </button>
                            {(errors.nom_departement || errors.direction_id) && (
                                <div className="col-span-2 text-red-600 text-sm">
                                    {errors.nom_departement && <p>{errors.nom_departement}</p>}
                                    {errors.direction_id && <p>{errors.direction_id}</p>}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Départements</h1>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Direction</th>
                                    <th className="py-2">Divisions</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departements.map((departement) => (
                                    <tr key={departement.id} className="border-b">
                                        {editingId === departement.id ? (
                                            <td colSpan={3} className="py-2">
                                                <form
                                                    onSubmit={(e) => saveEdit(e, departement.id)}
                                                    className="flex gap-2"
                                                >
                                                    <input
                                                        value={editForm.data.nom_departement}
                                                        onChange={(e) =>
                                                            editForm.setData('nom_departement', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 flex-1"
                                                        autoFocus
                                                    />
                                                    <select
                                                        value={editForm.data.direction_id}
                                                        onChange={(e) =>
                                                            editForm.setData('direction_id', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1"
                                                    >
                                                        {directions.map((d) => (
                                                            <option key={d.id} value={d.id}>
                                                                {d.nom_direction}
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
                                                <td className="py-2">{departement.nom_departement}</td>
                                                <td className="py-2">{departement.direction?.nom_direction}</td>
                                                <td className="py-2">{departement.divisions_count}</td>
                                            </>
                                        )}
                                        <td className="py-2">
                                            {editingId !== departement.id && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => startEdit(departement)}
                                                        className="text-indigo-600 text-sm"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => destroy(departement.id)}
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