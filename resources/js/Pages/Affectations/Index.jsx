import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ affectations, employes, materiels }) {
    const { errors: pageErrors } = usePage().props;
    const today = new Date().toISOString().slice(0, 10);

    // ---------- helpers ----------
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const dateStr = dateString.includes('T') ? dateString.split('T')[0] : dateString;
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    };

    const getDateForInput = (dateString) => {
        if (!dateString) return today;
        return dateString.includes('T') ? dateString.split('T')[0] : dateString;
    };

    const etatBadge = (etat) => {
        if (etat === 'Clôturé') {
            return <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded whitespace-nowrap">Clôturé</span>;
        }
        return <span className="text-green-700 text-sm font-medium bg-green-50 px-2 py-1 rounded whitespace-nowrap">Affecté</span>;
    };

    // ---------- Ajouter une affectation ----------
    const [addData, setAddData] = useState({
        date_affectation: today,
        matricule: '',
        search_type: 'serie',
        search_value: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const matchedEmploye = useMemo(() => {
        if (!addData.matricule.trim()) return null;
        return employes.find(
            (e) => e.matricule.toLowerCase() === addData.matricule.trim().toLowerCase()
        ) || null;
    }, [addData.matricule, employes]);

    const matchedMateriel = useMemo(() => {
        if (!addData.search_value.trim()) return null;
        return materiels.find((m) => {
            const val = addData.search_type === 'serie' ? m.numero_serie : m.numero_inventaire;
            return val && val.toLowerCase() === addData.search_value.trim().toLowerCase();
        }) || null;
    }, [addData.search_value, addData.search_type, materiels]);

    const submitAdd = (e) => {
        e.preventDefault();
        if (!matchedEmploye || !matchedMateriel) return;

        setIsSubmitting(true);
        router.post(
            route('affectations.store'),
            {
                employe_id: matchedEmploye.id,
                materiel_id: matchedMateriel.id,
                date_affectation: addData.date_affectation,
            },
            {
                onSuccess: () => {
                    setAddData({ date_affectation: today, matricule: '', search_type: 'serie', search_value: '' });
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            }
        );
    };

    // ---------- Voir ----------
    const [voirAffectation, setVoirAffectation] = useState(null);

    // ---------- Modifier (employe / materiel / date_affectation, open only) ----------
    const [editState, setEditState] = useState(null);

    const editMateriels = useMemo(() => {
        if (!editState) return materiels;
        const already = materiels.some((m) => m.id === editState.originalMateriel?.id);
        return already || !editState.originalMateriel
            ? materiels
            : [...materiels, editState.originalMateriel];
    }, [materiels, editState]);

    const openEdit = (a) => {
        setEditState({
            id: a.id,
            date_affectation: getDateForInput(a.date_affectation),
            matricule: a.employe?.matricule ?? '',
            search_type: a.materiel?.numero_serie ? 'serie' : 'inventaire',
            search_value: a.materiel?.numero_serie || a.materiel?.numero_inventaire || '',
            originalMateriel: a.materiel,
        });
    };

    const editMatchedEmploye = useMemo(() => {
        if (!editState || !editState.matricule.trim()) return null;
        return employes.find(
            (e) => e.matricule.toLowerCase() === editState.matricule.trim().toLowerCase()
        ) || null;
    }, [editState, employes]);

    const editMatchedMateriel = useMemo(() => {
        if (!editState || !editState.search_value.trim()) return null;
        return editMateriels.find((m) => {
            const val = editState.search_type === 'serie' ? m.numero_serie : m.numero_inventaire;
            return val && val.toLowerCase() === editState.search_value.trim().toLowerCase();
        }) || null;
    }, [editState, editMateriels]);

    const submitEdit = () => {
        if (!editState || !editMatchedEmploye || !editMatchedMateriel) return;
        router.put(
            route('affectations.update', editState.id),
            {
                employe_id: editMatchedEmploye.id,
                materiel_id: editMatchedMateriel.id,
                date_affectation: editState.date_affectation,
            },
            { onSuccess: () => setEditState(null) }
        );
    };

    // ---------- Clôturer / Modifier la clôture ----------
    const [clotureState, setClotureState] = useState(null);

    const openCloturer = (a) => {
        const minDate = getDateForInput(a.date_affectation);
        const isEditing = a.etat === 'Clôturé';
        setClotureState({
            id: a.id,
            minDate,
            date_cloture: isEditing
                ? getDateForInput(a.date_restitution)
                : (today >= minDate ? today : minDate),
            isEditing,
        });
    };

    const confirmCloture = () => {
        if (!clotureState) return;
        router.put(
            route('affectations.cloturer', clotureState.id),
            { date_cloture: clotureState.date_cloture },
            { onSuccess: () => setClotureState(null) }
        );
    };

    const annulerCloture = (a) => {
        if (confirm('Annuler la clôture de cette affectation ?')) {
            router.put(route('affectations.annuler-cloture', a.id));
        }
    };

    const destroy = (id) => {
        if (confirm('Supprimer cette affectation ?')) {
            router.delete(route('affectations.destroy', id));
        }
    };

    // ---------- Imprimer ----------
    const imprimer = (a) => {
        const w = window.open('', '_blank');
        if (!w) return;

        w.document.write(`
            <html>
            <head>
                <title>Fiche d'affectation</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
                    h1 { font-size: 18px; text-align: center; margin-bottom: 24px; }
                    .header { text-align: center; font-size: 13px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                    td, th { border: 1px solid #333; padding: 6px 8px; font-size: 13px; }
                    .field { margin: 6px 0; font-size: 14px; }
                    .field strong { display: inline-block; width: 120px; }
                    .conditions { font-size: 12px; margin-top: 20px; line-height: 1.6; }
                    .signatures { display: flex; margin-top: 40px; }
                    .signatures div { flex: 1; border: 1px solid #333; padding: 10px; font-size: 12px; min-height: 90px; }
                </style>
            </head>
            <body>
                <div class="header">
                    Direction SI et transformation digitale<br/>
                    Service Infrastructure et supervision SI
                </div>
                <h1>Fiche d'affectation de matériel informatique</h1>

                <div class="field"><strong>Date :</strong> ${formatDate(a.date_affectation)}</div>
                <div class="field"><strong>Nom :</strong> ${a.employe?.nom ?? ''}</div>
                <div class="field"><strong>Prénom :</strong> ${a.employe?.prenom ?? ''}</div>
                <div class="field"><strong>Mle :</strong> ${a.employe?.matricule ?? ''}</div>
                <div class="field"><strong>Service :</strong> ${a.employe?.service?.nom_service ?? ''}</div>

                <table>
                    <thead>
                        <tr>
                            <th>Désignation</th><th>Marque</th><th>Modèle</th><th>S/N</th><th>N° Inventaire</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${a.materiel?.nom ?? ''}</td>
                            <td>${a.materiel?.marque ?? ''}</td>
                            <td>${a.materiel?.modele ?? ''}</td>
                            <td>${a.materiel?.numero_serie ?? ''}</td>
                            <td>${a.materiel?.numero_inventaire ?? ''}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="conditions">
                    <strong>Conditions d'utilisation et engagements :</strong><br/>
                    - Le bénéficiaire s'engage à utiliser ce matériel exclusivement dans le cadre de ses missions professionnelles.<br/>
                    - Il doit assurer la bonne conservation et l'entretien du matériel.<br/>
                    - Tout problème technique ou panne doit être signalé à la DSITD.<br/>
                    - En cas de départ ou de changement de poste, le matériel devra être restitué à la DSITD.
                </div>

                <div class="signatures">
                    <div><strong>Bénéficiaire</strong><br/>Nom et prénom :<br/>Signature :<br/>Date :</div>
                    <div><strong>Responsable hiérarchique</strong><br/>Nom et prénom :<br/>Signature :<br/>Date :</div>
                    <div><strong>Responsable DSITD</strong><br/>Nom et prénom :<br/>Signature :<br/>Date :</div>
                </div>
            </body>
            </html>
        `);
        w.document.close();
        w.focus();
        w.print();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Affectations" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">{pageErrors.delete}</div>
                    )}
                    {pageErrors?.materiel_id && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">{pageErrors.materiel_id}</div>
                    )}
                    {pageErrors?.modifier && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">{pageErrors.modifier}</div>
                    )}
                    {pageErrors?.cloture && !clotureState && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">{pageErrors.cloture}</div>
                    )}

                    {/* Ajouter une affectation */}
                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Affecter un matériel</h1>
                        <form onSubmit={submitAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                                type="date"
                                value={addData.date_affectation}
                                onChange={(e) => setAddData({ ...addData, date_affectation: e.target.value })}
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Matricule employé"
                                value={addData.matricule}
                                onChange={(e) => setAddData({ ...addData, matricule: e.target.value })}
                                className="border rounded px-3 py-2"
                            />
                            <select
                                value={addData.search_type}
                                onChange={(e) => setAddData({ ...addData, search_type: e.target.value, search_value: '' })}
                                className="border rounded px-3 py-2"
                            >
                                <option value="serie">Rechercher par N° Série</option>
                                <option value="inventaire">Rechercher par N° Inventaire</option>
                            </select>
                            <input
                                type="text"
                                placeholder={addData.search_type === 'serie' ? 'N° Série' : 'N° Inventaire'}
                                value={addData.search_value}
                                onChange={(e) => setAddData({ ...addData, search_value: e.target.value })}
                                className="border rounded px-3 py-2"
                            />

                            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div className={`px-3 py-2 rounded border ${matchedEmploye ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    {matchedEmploye
                                        ? `Employé trouvé : ${matchedEmploye.nom} ${matchedEmploye.prenom}`
                                        : addData.matricule
                                            ? 'Aucun employé avec ce matricule'
                                            : 'En attente de matricule...'}
                                </div>
                                <div className={`px-3 py-2 rounded border ${matchedMateriel ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                    {matchedMateriel
                                        ? `Matériel trouvé : ${matchedMateriel.nom} - ${matchedMateriel.marque} ${matchedMateriel.modele}`
                                        : addData.search_value
                                            ? 'Aucun matériel disponible ne correspond'
                                            : 'En attente de numéro...'}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !matchedEmploye || !matchedMateriel}
                                className="bg-gray-800 text-white px-4 py-2 rounded md:col-span-4 hover:bg-gray-700 transition disabled:opacity-50"
                            >
                                {isSubmitting ? 'Affectation en cours...' : 'Affecter'}
                            </button>
                        </form>
                    </div>

                    {/* Tableau */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Historique des affectations</h1>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-sm">
                                        <th className="py-2 px-3 whitespace-nowrap">Date affect.</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Nom</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Prénom</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Matricule</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Nom matériel</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Marque</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Modèle</th>
                                        <th className="py-2 px-3 whitespace-nowrap">N° Série</th>
                                        <th className="py-2 px-3 whitespace-nowrap">N° Inventaire</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Catégorie</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Date restit.</th>
                                        <th className="py-2 px-3 whitespace-nowrap">État</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {affectations.map((a) => (
                                        <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                                            <td className="py-2 px-3 whitespace-nowrap">{formatDate(a.date_affectation)}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{a.employe?.nom}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{a.employe?.prenom}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{a.employe?.matricule}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.nom}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.marque}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.modele}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.numero_serie}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.numero_inventaire}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.categorie?.nom_categorie}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{formatDate(a.date_restitution)}</td>
                                            <td className="py-2 px-3 whitespace-nowrap">{etatBadge(a.etat)}</td>
                                            <td className="py-2 px-3">
                                                <div className="flex gap-2 flex-wrap">
                                                    <button onClick={() => setVoirAffectation(a)} className="text-gray-600 text-sm font-medium hover:text-gray-900">Voir</button>
                                                    {a.etat === 'Affecté' && (
                                                        <>
                                                            <button onClick={() => openEdit(a)} className="text-blue-600 text-sm font-medium hover:text-blue-800">Modifier</button>
                                                            <button onClick={() => openCloturer(a)} className="text-indigo-600 text-sm font-medium hover:text-indigo-800">Clôturer</button>
                                                        </>
                                                    )}
                                                    {a.etat === 'Clôturé' && (
                                                        <>
                                                            <button onClick={() => openCloturer(a)} className="text-blue-600 text-sm font-medium hover:text-blue-800">Modifier la clôture</button>
                                                            <button onClick={() => annulerCloture(a)} className="text-orange-600 text-sm font-medium hover:text-orange-800">Annuler clôture</button>
                                                        </>
                                                    )}
                                                    <button onClick={() => imprimer(a)} className="text-purple-600 text-sm font-medium hover:text-purple-800">Imprimer</button>
                                                    <button onClick={() => destroy(a.id)} className="text-red-600 text-sm font-medium hover:text-red-800">Supprimer</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {affectations.length === 0 && (
                            <p className="text-center text-gray-500 py-8">Aucune affectation enregistrée.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Voir */}
            <Modal show={!!voirAffectation} onClose={() => setVoirAffectation(null)} maxWidth="lg">
                {voirAffectation && (
                    <div className="p-6 space-y-2 text-sm">
                        <h2 className="text-lg font-medium mb-4">Détail de l'affectation</h2>
                        <p><strong>Employé :</strong> {voirAffectation.employe?.nom} {voirAffectation.employe?.prenom} ({voirAffectation.employe?.matricule})</p>
                        <p><strong>Service :</strong> {voirAffectation.employe?.service?.nom_service}</p>
                        <p><strong>Matériel :</strong> {voirAffectation.materiel?.nom} — {voirAffectation.materiel?.marque} {voirAffectation.materiel?.modele}</p>
                        <p><strong>N° Série :</strong> {voirAffectation.materiel?.numero_serie}</p>
                        <p><strong>N° Inventaire :</strong> {voirAffectation.materiel?.numero_inventaire}</p>
                        <p><strong>Catégorie :</strong> {voirAffectation.materiel?.categorie?.nom_categorie}</p>
                        <p><strong>Date d'affectation :</strong> {formatDate(voirAffectation.date_affectation)}</p>
                        <p><strong>Date de restitution :</strong> {formatDate(voirAffectation.date_restitution)}</p>
                        <p><strong>État :</strong> {voirAffectation.etat}</p>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setVoirAffectation(null)} className="text-gray-600 text-sm">Fermer</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Modifier (employé / matériel / date d'affectation) */}
            <Modal show={!!editState} onClose={() => setEditState(null)} maxWidth="lg">
                {editState && (
                    <div className="p-6 space-y-3">
                        <h2 className="text-lg font-medium mb-2">Modifier l'affectation</h2>
                        <input
                            type="date"
                            value={editState.date_affectation}
                            onChange={(e) => setEditState({ ...editState, date_affectation: e.target.value })}
                            className="border rounded px-3 py-2 w-full"
                        />
                        <input
                            type="text"
                            placeholder="Matricule employé"
                            value={editState.matricule}
                            onChange={(e) => setEditState({ ...editState, matricule: e.target.value })}
                            className="border rounded px-3 py-2 w-full"
                        />
                        <div className="flex gap-2">
                            <select
                                value={editState.search_type}
                                onChange={(e) => setEditState({ ...editState, search_type: e.target.value, search_value: '' })}
                                className="border rounded px-3 py-2"
                            >
                                <option value="serie">N° Série</option>
                                <option value="inventaire">N° Inventaire</option>
                            </select>
                            <input
                                type="text"
                                placeholder={editState.search_type === 'serie' ? 'N° Série' : 'N° Inventaire'}
                                value={editState.search_value}
                                onChange={(e) => setEditState({ ...editState, search_value: e.target.value })}
                                className="border rounded px-3 py-2 flex-1"
                            />
                        </div>

                        <div className="text-sm space-y-1">
                            <div className={`px-3 py-2 rounded border ${editMatchedEmploye ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                {editMatchedEmploye ? `Employé : ${editMatchedEmploye.nom} ${editMatchedEmploye.prenom}` : 'Aucun employé avec ce matricule'}
                            </div>
                            <div className={`px-3 py-2 rounded border ${editMatchedMateriel ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                {editMatchedMateriel ? `Matériel : ${editMatchedMateriel.nom} - ${editMatchedMateriel.marque} ${editMatchedMateriel.modele}` : 'Aucun matériel correspondant'}
                            </div>
                        </div>

                        {pageErrors?.materiel_id && (
                            <p className="text-red-600 text-sm">{pageErrors.materiel_id}</p>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditState(null)} className="text-gray-500 text-sm">Annuler</button>
                            <button
                                onClick={submitEdit}
                                disabled={!editMatchedEmploye || !editMatchedMateriel}
                                className="bg-gray-800 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Clôturer / Modifier la clôture */}
            <Modal show={!!clotureState} onClose={() => setClotureState(null)} maxWidth="sm">
                {clotureState && (
                    <div className="p-6 space-y-3">
                        <h2 className="text-lg font-medium mb-2">
                            {clotureState.isEditing ? 'Modifier la date de clôture' : "Clôturer l'affectation"}
                        </h2>
                        <label className="block text-sm text-gray-700">Date de clôture</label>
                        <input
                            type="date"
                            min={clotureState.minDate}
                            value={clotureState.date_cloture}
                            onChange={(e) => setClotureState({ ...clotureState, date_cloture: e.target.value })}
                            className="border rounded px-3 py-2 w-full"
                            autoFocus
                        />
                        {pageErrors?.cloture && (
                            <p className="text-red-600 text-sm">{pageErrors.cloture}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            {clotureState.isEditing
                                ? 'Si la nouvelle date chevauche une autre affectation de ce matériel, la modification sera refusée.'
                                : 'Une fois clôturée, le matériel redevient disponible pour une nouvelle affectation à partir de cette date.'}
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setClotureState(null)} className="text-gray-500 text-sm">Annuler</button>
                            <button onClick={confirmCloture} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
                                {clotureState.isEditing ? 'Enregistrer' : 'Confirmer la clôture'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}