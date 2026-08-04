import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ services, divisions }) {
    const { errors: pageErrors } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        nom_service: '',
        division_id: '',
    });

    const editForm = useForm({ nom_service: '', division_id: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('services.store'), { onSuccess: () => reset() });
    };

    const startEdit = (service) => {
        setEditingId(service.id);
        editForm.setData({
            nom_service: service.nom_service,
            division_id: service.division_id,
        });
    };

    const saveEdit = (e, id) => {
        e.preventDefault();
        editForm.put(route('services.update', id), {
            onSuccess: () => setEditingId(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer ce service ?')) {
            router.delete(route('services.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Services" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Ajouter un service</h1>
                        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={data.nom_service}
                                onChange={(e) => setData('nom_service', e.target.value)}
                                placeholder="Nom du service"
                                className="border rounded px-3 py-2"
                            />
                            <select
                                value={data.division_id}
                                onChange={(e) => setData('division_id', e.target.value)}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">Division...</option>
                                {divisions.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.nom_division} ({d.departement?.nom_departement})
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
                            {(errors.nom_service || errors.division_id) && (
                                <div className="col-span-2 text-red-600 text-sm">
                                    {errors.nom_service && <p>{errors.nom_service}</p>}
                                    {errors.division_id && <p>{errors.division_id}</p>}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Services</h1>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Division / Département / Direction</th>
                                    <th className="py-2">Employés</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.id} className="border-b">
                                        {editingId === service.id ? (
                                            <td colSpan={3} className="py-2">
                                                <form
                                                    onSubmit={(e) => saveEdit(e, service.id)}
                                                    className="flex gap-2"
                                                >
                                                    <input
                                                        value={editForm.data.nom_service}
                                                        onChange={(e) =>
                                                            editForm.setData('nom_service', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 flex-1"
                                                        autoFocus
                                                    />
                                                    <select
                                                        value={editForm.data.division_id}
                                                        onChange={(e) =>
                                                            editForm.setData('division_id', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1"
                                                    >
                                                        {divisions.map((d) => (
                                                            <option key={d.id} value={d.id}>
                                                                {d.nom_division}
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
                                                <td className="py-2">{service.nom_service}</td>
                                                <td className="py-2">
                                                    {service.division?.nom_division}
                                                    {service.division?.departement &&
                                                        ` / ${service.division.departement.nom_departement}`}
                                                    {service.division?.departement?.direction &&
                                                        ` / ${service.division.departement.direction.nom_direction}`}
                                                </td>
                                                <td className="py-2">{service.employes_count}</td>
                                            </>
                                        )}
                                        <td className="py-2">
                                            {editingId !== service.id && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => startEdit(service)}
                                                        className="text-indigo-600 text-sm"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => destroy(service.id)}
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