import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ affectations, employes, materiels }) {
    const { errors: pageErrors } = usePage().props;
    const today = new Date().toISOString().slice(0, 10);

    const { data, setData, post, processing, reset, errors } = useForm({
        employe_id: '',
        materiel_id: '',
        date_affectation: today,
    });

    const [restitutingId, setRestitutingId] = useState(null);
    const [restitutionDates, setRestitutionDates] = useState({});
    const [isSubmittingRestitution, setIsSubmittingRestitution] = useState(false);
    
    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        employe_id: '',
        materiel_id: '',
        date_affectation: '',
    });
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('affectations.store'), { 
            onSuccess: () => {
                reset('materiel_id');
                setData('employe_id', '');
                setData('date_affectation', today);
            },
            onError: () => {}
        });
    };

    // Open edit mode for an affectation
    const openEdit = (affectation) => {
        setEditingId(affectation.id);
        setEditData({
            employe_id: affectation.employe_id,
            materiel_id: affectation.materiel_id,
            date_affectation: getDateForInput(affectation.date_affectation),
        });
    };

    // Cancel edit mode
    const cancelEdit = () => {
        setEditingId(null);
        setEditData({
            employe_id: '',
            materiel_id: '',
            date_affectation: '',
        });
    };

    // Submit edit
    const submitEdit = (affectation) => {
        setIsSubmittingEdit(true);
        router.put(
            route('affectations.update', affectation.id),
            editData,
            {
                onSuccess: () => {
                    setEditingId(null);
                    setIsSubmittingEdit(false);
                    setEditData({
                        employe_id: '',
                        materiel_id: '',
                        date_affectation: '',
                    });
                },
                onError: () => {
                    setIsSubmittingEdit(false);
                }
            },
        );
    };

    const openRestituer = (affectation) => {
        setRestitutingId(affectation.id);
        
        // Calculate minimum date (affectation date + 1 day)
        const affectationDate = new Date(affectation.date_affectation);
        const minDate = new Date(affectationDate);
        minDate.setDate(minDate.getDate() + 1);
        const minDateStr = minDate.toISOString().slice(0, 10);
        
        // Default to minDate or today, whichever is later
        const defaultDate = new Date(today) > new Date(minDateStr) 
            ? today 
            : minDateStr;
            
        setRestitutionDates((prev) => ({
            ...prev,
            [affectation.id]: prev[affectation.id] ?? defaultDate,
        }));
    };

    const confirmRestituer = (affectation) => {
        const date = restitutionDates[affectation.id] ?? today;
        setIsSubmittingRestitution(true);
        router.put(
            route('affectations.restituer', affectation.id),
            { date_restitution: date },
            {
                onSuccess: () => {
                    setRestitutingId(null);
                    setIsSubmittingRestitution(false);
                },
                onError: () => {
                    setIsSubmittingRestitution(false);
                }
            },
        );
    };

    const cancelRestitution = (affectation) => {
        if (confirm('Annuler la planification de restitution ?')) {
            router.put(
                route('affectations.cancel-restitution', affectation.id),
                {},
                {
                    onSuccess: () => {
                        setRestitutingId(null);
                    }
                }
            );
        }
    };

    const destroy = (id) => {
        if (confirm('Supprimer cette affectation ?')) {
            router.delete(route('affectations.destroy', id));
        }
    };

    // Check if affectation is pending (future affectation date)
    const isPending = (affectation) => {
        return new Date(affectation.date_affectation) > new Date();
    };

    // Check if restitution is completed (past date)
    const isCompleted = (affectation) => {
        return affectation.date_restitution && new Date(affectation.date_restitution) <= new Date();
    };

    // Check if restitution is planned (any date set)
    const hasRestitutionDate = (affectation) => {
        return affectation.date_restitution !== null;
    };

    // Get the minimum restitution date (affectation date + 1 day)
    const getMinRestitutionDate = (affectationDate) => {
        const date = new Date(affectationDate);
        date.setDate(date.getDate() + 1);
        return date.toISOString().slice(0, 10);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            let dateStr = dateString;
            if (dateString.includes('T')) {
                dateStr = dateString.split('T')[0];
            }
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parts[0];
                const month = parts[1];
                const day = parts[2];
                return `${day}/${month}/${year}`;
            }
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            }
            return dateString;
        } catch (error) {
            return dateString;
        }
    };

    // Get date for input field
    const getDateForInput = (dateString) => {
        if (!dateString) return today;
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return dateString;
    };

    // Get status display
    const getStatusDisplay = (affectation) => {
        if (isPending(affectation)) {
            return <span className="text-blue-700 text-sm font-medium bg-blue-50 px-2 py-1 rounded">En attente</span>;
        }
        
        if (isCompleted(affectation)) {
            return <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">Restitué</span>;
        }
        
        return <span className="text-green-700 text-sm font-medium bg-green-50 px-2 py-1 rounded">En cours</span>;
    };

    // Get available materials for edit (excluding the current one)
    const getAvailableMaterialsForEdit = (currentMaterielId) => {
        // Get all materiels that are available (not affected)
        const availableIds = materiels.map(m => m.id);
        
        // Add the current material if it's not in the list (because it's currently affected)
        const currentMaterial = affectations.find(a => a.id === editingId)?.materiel;
        if (currentMaterial && !availableIds.includes(currentMaterial.id)) {
            // Add the current material to the list so the user can keep it
            return [...materiels, currentMaterial];
        }
        
        return materiels;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Affectations" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}
                    {pageErrors?.cancel && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.cancel}
                        </div>
                    )}
                    {pageErrors?.date_restitution && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.date_restitution}
                        </div>
                    )}
                    {pageErrors?.materiel_id && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.materiel_id}
                        </div>
                    )}
                    {pageErrors?.date_affectation && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.date_affectation}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Affecter un matériel</h1>
                        <form onSubmit={submit} className="grid grid-cols-3 gap-3">
                            <select
                                value={data.employe_id}
                                onChange={(e) => setData('employe_id', e.target.value)}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">Employé...</option>
                                {employes.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.nom} {emp.prenom} ({emp.matricule})
                                    </option>
                                ))}
                            </select>
                            <select
                                value={data.materiel_id}
                                onChange={(e) => setData('materiel_id', e.target.value)}
                                className="border rounded px-3 py-2"
                            >
                                <option value="">Matériel disponible...</option>
                                {materiels.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.nom} - {m.numero_inventaire}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={data.date_affectation}
                                onChange={(e) => setData('date_affectation', e.target.value)}
                                className="border rounded px-3 py-2"
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gray-800 text-white px-4 py-2 rounded col-span-3 hover:bg-gray-700 transition disabled:opacity-50"
                            >
                                {processing ? 'Affectation en cours...' : 'Affecter'}
                            </button>
                            {Object.keys(errors).length > 0 && (
                                <div className="col-span-3 text-red-600 text-sm">
                                    {Object.values(errors).map((err, i) => (
                                        <p key={i}>{err}</p>
                                    ))}
                                </div>
                            )}
                        </form>
                        {materiels.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                                Aucun matériel disponible actuellement.
                            </p>
                        )}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Historique des affectations</h1>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="py-2 px-3">Employé</th>
                                        <th className="py-2 px-3">Matériel</th>
                                        <th className="py-2 px-3">Date affectation</th>
                                        <th className="py-2 px-3">Date restitution</th>
                                        <th className="py-2 px-3">Statut</th>
                                        <th className="py-2 px-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {affectations.map((a) => (
                                        <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                                            {editingId === a.id ? (
                                                // Edit mode
                                                <>
                                                    <td className="py-2 px-3">
                                                        <select
                                                            value={editData.employe_id}
                                                            onChange={(e) => setEditData({...editData, employe_id: e.target.value})}
                                                            className="border rounded px-2 py-1 text-sm w-full"
                                                        >
                                                            <option value="">Employé...</option>
                                                            {employes.map((emp) => (
                                                                <option key={emp.id} value={emp.id}>
                                                                    {emp.nom} {emp.prenom} ({emp.matricule})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <select
                                                            value={editData.materiel_id}
                                                            onChange={(e) => setEditData({...editData, materiel_id: e.target.value})}
                                                            className="border rounded px-2 py-1 text-sm w-full"
                                                        >
                                                            <option value="">Matériel...</option>
                                                            {getAvailableMaterialsForEdit(a.materiel_id).map((m) => (
                                                                <option key={m.id} value={m.id}>
                                                                    {m.nom} - {m.numero_inventaire}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input
                                                            type="date"
                                                            value={editData.date_affectation}
                                                            onChange={(e) => setEditData({...editData, date_affectation: e.target.value})}
                                                            className="border rounded px-2 py-1 text-sm w-full"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        {formatDate(a.date_restitution)}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        {getStatusDisplay(a)}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => submitEdit(a)}
                                                                disabled={isSubmittingEdit}
                                                                className="text-green-700 text-sm font-medium hover:text-green-900 disabled:opacity-50"
                                                            >
                                                                {isSubmittingEdit ? '...' : 'Sauvegarder'}
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="text-gray-500 text-sm font-medium hover:text-gray-700"
                                                            >
                                                                Annuler
                                                            </button>
                                                        </div>
                                                        {pageErrors?.materiel_id && editingId === a.id && (
                                                            <div className="text-xs text-red-600 mt-1">
                                                                {pageErrors.materiel_id}
                                                            </div>
                                                        )}
                                                    </td>
                                                </>
                                            ) : (
                                                // View mode
                                                <>
                                                    <td className="py-2 px-3">
                                                        {a.employe?.nom} {a.employe?.prenom}
                                                        <div className="text-xs text-gray-500">
                                                            {a.employe?.service?.nom || ''}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        {a.materiel?.nom}
                                                        <div className="text-xs text-gray-500">
                                                            {a.materiel?.numero_inventaire}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-3">{formatDate(a.date_affectation)}</td>
                                                    <td className="py-2 px-3">
                                                        {formatDate(a.date_restitution)}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        {getStatusDisplay(a)}
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        {restitutingId === a.id ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="date"
                                                                    min={getMinRestitutionDate(a.date_affectation)}
                                                                    value={restitutionDates[a.id] ?? today}
                                                                    onChange={(e) =>
                                                                        setRestitutionDates((prev) => ({
                                                                            ...prev,
                                                                            [a.id]: e.target.value,
                                                                        }))
                                                                    }
                                                                    className="border rounded px-2 py-1 text-sm"
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    onClick={() => confirmRestituer(a)}
                                                                    disabled={isSubmittingRestitution}
                                                                    className="text-green-700 text-sm font-medium hover:text-green-900 disabled:opacity-50"
                                                                >
                                                                    {isSubmittingRestitution ? '...' : 'Confirmer'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setRestitutingId(null)}
                                                                    className="text-gray-500 text-sm hover:text-gray-700"
                                                                >
                                                                    Annuler
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex gap-2 flex-wrap">
                                                                    {!isCompleted(a) && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => openEdit(a)}
                                                                                className="text-blue-600 text-sm font-medium hover:text-blue-800"
                                                                            >
                                                                                Modifier
                                                                            </button>
                                                                            <button
                                                                                onClick={() => openRestituer(a)}
                                                                                className="text-indigo-600 text-sm font-medium hover:text-indigo-800"
                                                                            >
                                                                                {hasRestitutionDate(a) ? 'Modifier restitution' : 'Planifier restitution'}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {hasRestitutionDate(a) && (
                                                                        <button
                                                                            onClick={() => cancelRestitution(a)}
                                                                            className="text-orange-600 text-sm font-medium hover:text-orange-800"
                                                                        >
                                                                            Annuler rest.
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => destroy(a.id)}
                                                                        className="text-red-600 text-sm font-medium hover:text-red-800"
                                                                    >
                                                                        Supprimer
                                                                    </button>
                                                                </div>
                                                                {hasRestitutionDate(a) && (
                                                                    <div className="text-xs text-gray-400">
                                                                        Restitution prévue le {formatDate(a.date_restitution)}
                                                                    </div>
                                                                )}
                                                                {isPending(a) && (
                                                                    <div className="text-xs text-blue-600">
                                                                        Débute le {formatDate(a.date_affectation)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {affectations.length === 0 && (
                            <p className="text-center text-gray-500 py-8">
                                Aucune affectation enregistrée.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}