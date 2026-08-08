import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ services, divisions }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;

    const canCreate = isAdmin || permissions.includes('gerer_structure') || permissions.includes('modifier_structure');
    const canEdit = isAdmin || permissions.includes('gerer_structure') || permissions.includes('modifier_structure');
    const canDelete = isAdmin || permissions.includes('gerer_structure') || permissions.includes('supprimer_structure');
    const hasAnyAction = canEdit || canDelete;

    const [editingService, setEditingService] = useState(null);

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
        setEditingService(service);
        editForm.setData({
            nom_service: service.nom_service,
            division_id: service.division_id,
        });
        editForm.clearErrors();
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingService) return;
        editForm.put(route('services.update', editingService.id), {
            onSuccess: () => setEditingService(null),
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
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {pageErrors?.delete && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded shadow-sm">
                            {pageErrors.delete}
                        </div>
                    )}

                    {canCreate && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <h1 className="text-xl font-semibold mb-4 text-gray-800">Ajouter un service</h1>
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={data.nom_service}
                                    onChange={(e) => setData('nom_service', e.target.value)}
                                    placeholder="Nom du service *"
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#11508f]"
                                    required
                                />
                                <select
                                    value={data.division_id}
                                    onChange={(e) => setData('division_id', e.target.value)}
                                    className="border rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#11508f]"
                                    required
                                >
                                    <option value="">Sélectionner une division...</option>
                                    {divisions.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nom_division} ({d.departement?.nom_departement})
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
                            {(errors.nom_service || errors.division_id) && (
                                <div className="mt-2 text-red-600 text-xs">
                                    {errors.nom_service && <p>{errors.nom_service}</p>}
                                    {errors.division_id && <p>{errors.division_id}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4 text-gray-800">Liste des Services</h1>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50 text-sm">
                                    <th className="py-2.5 px-3">Nom</th>
                                    <th className="py-2.5 px-3">Division / Département / Direction</th>
                                    <th className="py-2.5 px-3 text-center">Employés Rattachés</th>
                                    {hasAnyAction && <th className="py-2.5 px-3 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {services.map((service) => (
                                    <tr key={service.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="py-2.5 px-3 font-medium text-gray-900">{service.nom_service}</td>
                                        <td className="py-2.5 px-3 text-gray-600">
                                            {service.division?.nom_division}
                                            {service.division?.departement &&
                                                ` / ${service.division.departement.nom_departement}`}
                                            {service.division?.departement?.direction &&
                                                ` / ${service.division.departement.direction.nom_direction}`}
                                        </td>
                                        <td className="py-2.5 px-3 text-center text-gray-600">{service.employes_count}</td>
                                        {hasAnyAction && (
                                            <td className="py-2.5 px-3 text-right">
                                                <div className="flex justify-end items-center gap-1.5">
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => startEdit(service)}
                                                            title="Modifier le service"
                                                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                        >
                                                            ✏️
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => destroy(service.id)}
                                                            title="Supprimer le service"
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

            {/* Modal de Modification d'un Service */}
            <Modal show={editingService !== null} onClose={() => setEditingService(null)} maxWidth="md">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                        Modifier le service
                    </h2>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du service *</label>
                            <input
                                type="text"
                                value={editForm.data.nom_service}
                                onChange={(e) => editForm.setData('nom_service', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                            {editForm.errors.nom_service && (
                                <p className="text-red-600 text-xs mt-1">{editForm.errors.nom_service}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Division de rattachement *</label>
                            <select
                                value={editForm.data.division_id}
                                onChange={(e) => editForm.setData('division_id', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                required
                            >
                                <option value="">Sélectionner une division...</option>
                                {divisions.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.nom_division} ({d.departement?.nom_departement})
                                    </option>
                                ))}
                            </select>
                            {editForm.errors.division_id && (
                                <p className="text-red-600 text-xs mt-1">{editForm.errors.division_id}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setEditingService(null)}
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