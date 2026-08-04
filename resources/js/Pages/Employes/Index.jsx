import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ employes, services }) {
    const { errors: pageErrors } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        matricule: '',
        prenom: '',
        nom: '',
        fonction: '',
        service_id: '',
    });

    const editForm = useForm({
        matricule: '',
        prenom: '',
        nom: '',
        fonction: '',
        service_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('employes.store'), { onSuccess: () => reset() });
    };

    const startEdit = (employe) => {
        setEditingId(employe.id);
        editForm.setData({
            matricule: employe.matricule,
            prenom: employe.prenom,
            nom: employe.nom,
            fonction: employe.fonction,
            service_id: employe.service_id,
        });
    };

    const saveEdit = (e, id) => {
        e.preventDefault();
        editForm.put(route('employes.update', id), {
            onSuccess: () => setEditingId(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer cet employé ?')) {
            router.delete(route('employes.destroy', id));
        }
    };

    const serviceLabel = (service) => {
        if (!service) return '';
        const dep = service.division?.departement;
        return `${service.nom_service}${dep ? ` (${dep.nom_departement})` : ''}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Employés" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Ajouter un employé</h1>
                        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={data.matricule}
                                onChange={(e) => setData('matricule', e.target.value)}
                                placeholder="Matricule"
                                className="border rounded px-3 py-2"
                            />
                            <select
                                value={data.service_id}
                                onChange={(e) => setData('service_id', e.target.value)}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">Service...</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {serviceLabel(s)}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={data.prenom}
                                onChange={(e) => setData('prenom', e.target.value)}
                                placeholder="Prénom"
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="text"
                                value={data.nom}
                                onChange={(e) => setData('nom', e.target.value)}
                                placeholder="Nom"
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="text"
                                value={data.fonction}
                                onChange={(e) => setData('fonction', e.target.value)}
                                placeholder="Fonction"
                                className="border rounded px-3 py-2 col-span-2"
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gray-800 text-white px-4 py-2 rounded col-span-2"
                            >
                                Ajouter
                            </button>
                            {Object.keys(errors).length > 0 && (
                                <div className="col-span-2 text-red-600 text-sm">
                                    {Object.values(errors).map((err, i) => (
                                        <p key={i}>{err}</p>
                                    ))}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Employés</h1>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Matricule</th>
                                    <th className="py-2">Nom / Prénom</th>
                                    <th className="py-2">Fonction</th>
                                    <th className="py-2">Service</th>
                                    <th className="py-2">Matériels</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employes.map((employe) => (
                                    <tr key={employe.id} className="border-b">
                                        {editingId === employe.id ? (
                                            <td colSpan={5} className="py-2">
                                                <form
                                                    onSubmit={(e) => saveEdit(e, employe.id)}
                                                    className="flex flex-wrap gap-2 items-center"
                                                >
                                                    <input
                                                        value={editForm.data.matricule}
                                                        onChange={(e) =>
                                                            editForm.setData('matricule', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 w-28"
                                                        autoFocus
                                                    />
                                                    <input
                                                        value={editForm.data.prenom}
                                                        onChange={(e) =>
                                                            editForm.setData('prenom', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 w-28"
                                                    />
                                                    <input
                                                        value={editForm.data.nom}
                                                        onChange={(e) =>
                                                            editForm.setData('nom', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 w-28"
                                                    />
                                                    <input
                                                        value={editForm.data.fonction}
                                                        onChange={(e) =>
                                                            editForm.setData('fonction', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1 w-32"
                                                    />
                                                    <select
                                                        value={editForm.data.service_id}
                                                        onChange={(e) =>
                                                            editForm.setData('service_id', e.target.value)
                                                        }
                                                        className="border rounded px-2 py-1"
                                                    >
                                                        {services.map((s) => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.nom_service}
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
                                                <td className="py-2">{employe.matricule}</td>
                                                <td className="py-2">
                                                    {employe.nom} {employe.prenom}
                                                </td>
                                                <td className="py-2">{employe.fonction}</td>
                                                <td className="py-2">
                                                    {employe.service?.nom_service}
                                                </td>
                                                <td className="py-2">{employe.affectations_count}</td>
                                            </>
                                        )}
                                        <td className="py-2">
                                            {editingId !== employe.id && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => startEdit(employe)}
                                                        className="text-indigo-600 text-sm"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => destroy(employe.id)}
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