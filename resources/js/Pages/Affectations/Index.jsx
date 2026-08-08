import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ affectations, employes, materiels }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;

    const canCreate = isAdmin || permissions.includes('gerer_affectations') || permissions.includes('creer_affectation');
    const canEdit = isAdmin || permissions.includes('gerer_affectations') || permissions.includes('modifier_affectation');
    const canPrint = isAdmin || permissions.includes('gerer_affectations') || permissions.includes('imprimer_affectation');

    const today = new Date().toISOString().slice(0, 10);

    // Parse URL params to detect if opened from alert banner
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const isFromAlert = urlParams.get('fromAlert') === 'true';
    const highlightTargetId = urlParams.get('highlight') ? Number(urlParams.get('highlight')) : null;

    // ---------- Search & Filter State ----------
    const [searchQuery, setSearchQuery] = useState('');
    const [etatFilter, setEtatFilter] = useState(() => {
        if (urlParams.get('filter') === 'prolonge') return 'prolonge';
        return 'all';
    });

    const filteredAffectations = useMemo(() => {
        return affectations.filter((a) => {
            if (etatFilter === 'affecte' && a.etat !== 'Affecté') return false;
            if (etatFilter === 'cloture' && a.etat !== 'Clôturé') return false;
            if (etatFilter === 'prolonge') {
                if (a.etat !== 'Affecté') return false;
                const startDate = new Date(a.date_affectation);
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                if (startDate > sixMonthsAgo) return false;
            }

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchEmpNom = a.employe?.nom?.toLowerCase().includes(q);
                const matchEmpPrenom = a.employe?.prenom?.toLowerCase().includes(q);
                const matchMatricule = a.employe?.matricule?.toLowerCase().includes(q);
                const matchService = a.employe?.service?.nom_service?.toLowerCase().includes(q);
                const matchMatNom = a.materiel?.nom?.toLowerCase().includes(q);
                const matchMarque = a.materiel?.marque?.toLowerCase().includes(q);
                const matchModele = a.materiel?.modele?.toLowerCase().includes(q);
                const matchSerie = a.materiel?.numero_serie?.toLowerCase().includes(q);
                const matchInv = a.materiel?.numero_inventaire?.toLowerCase().includes(q);
                const matchCat = a.materiel?.categorie?.nom_categorie?.toLowerCase().includes(q);

                return matchEmpNom || matchEmpPrenom || matchMatricule || matchService || matchMatNom || matchMarque || matchModele || matchSerie || matchInv || matchCat;
            }

            return true;
        });
    }, [affectations, searchQuery, etatFilter]);

    const hasOverlap = (materielId, start, end, excludeId = null) => {
        const newStart = start;
        const newEnd = end || '9999-12-31';
        return affectations.some((a) => {
            if (a.materiel?.id !== materielId) return false;
            if (excludeId && a.id === excludeId) return false;
            const otherStart = (a.date_affectation || '').slice(0, 10);
            const otherEnd = a.date_restitution ? a.date_restitution.slice(0, 10) : '9999-12-31';
            return newStart < otherEnd && otherStart < newEnd;
        });
    };

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
        const found = materiels.find((m) => {
            const val = addData.search_type === 'serie' ? m.numero_serie : m.numero_inventaire;
            return val && val.toLowerCase() === addData.search_value.trim().toLowerCase();
        });
        if (!found) return null;
        return { ...found, unavailable: hasOverlap(found.id, addData.date_affectation, null) };
    }, [addData.search_value, addData.search_type, addData.date_affectation, materiels, affectations]);

    const submitAdd = (e) => {
        e.preventDefault();
        if (!matchedEmploye || !matchedMateriel || matchedMateriel.unavailable) return;

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
        const found = editMateriels.find((m) => {
            const val = editState.search_type === 'serie' ? m.numero_serie : m.numero_inventaire;
            return val && val.toLowerCase() === editState.search_value.trim().toLowerCase();
        });
        if (!found) return null;
        return {
            ...found,
            unavailable: hasOverlap(found.id, editState.date_affectation, null, editState.id),
        };
    }, [editState, editMateriels, affectations]);

    const submitEdit = () => {
        if (!editState || !editMatchedEmploye || !editMatchedMateriel || editMatchedMateriel.unavailable) return;
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

        const logoUrl = window.location.origin + '/images/logo.png';
        const empNomPrenom = [a.employe?.nom, a.employe?.prenom].filter(Boolean).join(' ') || '—';
        const serviceNom = a.employe?.service?.nom_service || 'Non attribué';
        const divisionNom = a.employe?.service?.division?.nom_division || '';
        const deptNom = a.employe?.service?.division?.departement?.nom_departement || '';
        const empFonction = a.employe?.fonction || '—';
        const empMatricule = a.employe?.matricule || '—';
        const refNumber = `AFF-${String(a.id).padStart(5, '0')}`;

        w.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>Fiche d'Affectation - ${refNumber}</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    * { box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif;
                        color: #1e293b;
                        background: #ffffff;
                        margin: 0;
                        padding: 12mm 15mm;
                        font-size: 13px;
                        line-height: 1.5;
                    }

                    .no-print-bar {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: #f8fafc;
                        border: 1px solid #cbd5e1;
                        padding: 10px 18px;
                        border-radius: 8px;
                        margin-bottom: 24px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    }
                    .no-print-bar button {
                        padding: 8px 16px;
                        font-size: 13px;
                        font-weight: 600;
                        border-radius: 6px;
                        cursor: pointer;
                        border: none;
                        transition: all 0.2s;
                    }
                    .btn-print {
                        background: #11508f;
                        color: #ffffff;
                    }
                    .btn-print:hover {
                        background: #0d3d6e;
                    }
                    .btn-close {
                        background: #e2e8f0;
                        color: #475569;
                    }

                    @media print {
                        .no-print-bar { display: none !important; }
                        body { padding: 12mm 15mm !important; }
                    }

                    .brand-bar {
                        height: 5px;
                        background: linear-gradient(90deg, #11508f 0%, #11508f 55%, #57b24a 55%, #57b24a 80%, #fab61e 80%, #fab61e 100%);
                        border-radius: 3px;
                        margin-bottom: 20px;
                    }

                    .header-container {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .header-logo {
                        max-height: 65px;
                        max-width: 320px;
                        object-fit: contain;
                    }
                    .header-company-info {
                        text-align: right;
                        font-size: 11px;
                        color: #475569;
                        line-height: 1.4;
                    }
                    .header-company-info strong {
                        color: #11508f;
                        font-size: 13px;
                        display: block;
                        margin-bottom: 2px;
                    }

                    .doc-title-box {
                        background: #11508f;
                        color: #ffffff;
                        text-align: center;
                        padding: 12px 16px;
                        border-radius: 6px;
                        margin-bottom: 24px;
                    }
                    .doc-title-box h1 {
                        margin: 0;
                        font-size: 17px;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                    }
                    .doc-title-box .doc-meta {
                        margin-top: 4px;
                        font-size: 11px;
                        color: #e2e8f0;
                        font-weight: 400;
                    }

                    .section-title {
                        font-size: 13px;
                        font-weight: 700;
                        color: #11508f;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .section-title::before {
                        content: '';
                        display: inline-block;
                        width: 4px;
                        height: 14px;
                        background: #57b24a;
                        border-radius: 2px;
                    }

                    .info-card {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-left: 4px solid #11508f;
                        border-radius: 6px;
                        padding: 14px 18px;
                        margin-bottom: 24px;
                    }
                    .grid-2col {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px 24px;
                    }
                    .info-item {
                        display: flex;
                        font-size: 12px;
                    }
                    .info-label {
                        width: 130px;
                        font-weight: 600;
                        color: #475569;
                        flex-shrink: 0;
                    }
                    .info-value {
                        color: #0f172a;
                        font-weight: 600;
                    }

                    .table-container {
                        margin-bottom: 24px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                        background: #ffffff;
                    }
                    th {
                        background: #11508f;
                        color: #ffffff;
                        font-weight: 600;
                        text-align: left;
                        padding: 9px 12px;
                        border: 1px solid #11508f;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    td {
                        padding: 9px 12px;
                        border: 1px solid #cbd5e1;
                        color: #334155;
                    }
                    tbody tr:nth-child(even) {
                        background: #f8fafc;
                    }

                    .conditions-box {
                        background: #f0fdf4;
                        border: 1px solid #bbf7d0;
                        border-left: 4px solid #57b24a;
                        border-radius: 6px;
                        padding: 14px 18px;
                        margin-bottom: 30px;
                        font-size: 11.5px;
                        color: #166534;
                    }
                    .conditions-box strong {
                        color: #14532d;
                        display: block;
                        margin-bottom: 6px;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    .conditions-box ul {
                        margin: 0;
                        padding-left: 18px;
                        line-height: 1.6;
                    }
                    .conditions-box li {
                        margin-bottom: 3px;
                    }

                    .signatures-container {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 16px;
                        margin-top: 24px;
                        page-break-inside: avoid;
                    }
                    .signature-box {
                        border: 1px solid #cbd5e1;
                        border-top: 3px solid #11508f;
                        border-radius: 6px;
                        padding: 12px;
                        min-height: 125px;
                        background: #ffffff;
                        font-size: 11.5px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .signature-title {
                        font-weight: 700;
                        color: #11508f;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                        font-size: 11px;
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 4px;
                    }
                    .signature-field {
                        margin-bottom: 6px;
                        color: #334155;
                    }
                    .signature-field strong {
                        color: #475569;
                    }
                    .signature-space {
                        margin-top: 25px;
                        border-top: 1px dashed #cbd5e1;
                        padding-top: 4px;
                        color: #94a3b8;
                        font-style: italic;
                        font-size: 10px;
                        text-align: right;
                    }
                </style>
            </head>
            <body>
                <div class="no-print-bar">
                    <div style="font-weight: 600; color: #1e293b;">Fiche d'Affectation (${refNumber})</div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-print" onclick="window.print()">Imprimer la fiche</button>
                        <button class="btn-close" onclick="window.close()">Fermer</button>
                    </div>
                </div>

                <div class="brand-bar"></div>

                <div class="header-container">
                    <div>
                        <img src="${logoUrl}" alt="SRM Souss-Massa SA" class="header-logo" onerror="this.style.display='none'; document.getElementById('logo-fallback').style.display='block';" />
                        <div id="logo-fallback" style="display:none; font-weight:700; color:#11508f; font-size:15px;">
                            Société Régionale Multiservices Souss-Massa SA
                        </div>
                    </div>
                    <div class="header-company-info">
                        <strong>Société Régionale Multiservices Souss-Massa SA</strong>
                        Direction Systèmes d'Information & Transformation Digitale<br/>
                        Service Infrastructure et Supervision SI
                    </div>
                </div>

                <div class="doc-title-box">
                    <h1>Fiche d'Affectation de Matériel Informatique</h1>
                    <div class="doc-meta">Référence : <strong>${refNumber}</strong> | Date d'affectation : <strong>${formatDate(a.date_affectation)}</strong></div>
                </div>

                <div class="section-title">1. Informations du Bénéficiaire</div>
                <div class="info-card">
                    <div class="grid-2col">
                        <div class="info-item">
                            <span class="info-label">Nom & Prénom :</span>
                            <span class="info-value">${empNomPrenom}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Matricule :</span>
                            <span class="info-value">${empMatricule}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Service :</span>
                            <span class="info-value" style="color: #11508f;">${serviceNom}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fonction :</span>
                            <span class="info-value">${empFonction}</span>
                        </div>
                        ${(divisionNom || deptNom) ? `
                        <div class="info-item" style="grid-column: span 2;">
                            <span class="info-label">Division / Dept :</span>
                            <span class="info-value">${[divisionNom, deptNom].filter(Boolean).join(' — ')}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="section-title">2. Désignation du Matériel Affecté</div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Désignation</th>
                                <th>Catégorie</th>
                                <th>Marque</th>
                                <th>Modèle</th>
                                <th>N° de Série</th>
                                <th>N° d'Inventaire</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>${a.materiel?.nom ?? '—'}</strong></td>
                                <td>${a.materiel?.categorie?.nom_categorie ?? '—'}</td>
                                <td>${a.materiel?.marque ?? '—'}</td>
                                <td>${a.materiel?.modele ?? '—'}</td>
                                <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:monospace;">${a.materiel?.numero_serie ?? '—'}</code></td>
                                <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:monospace;">${a.materiel?.numero_inventaire ?? '—'}</code></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="conditions-box">
                    <strong>Engagements du Bénéficiaire & Conditions d'Utilisation :</strong>
                    <ul>
                        <li>Le bénéficiaire s'engage à utiliser ce matériel exclusivement dans le cadre de ses activités professionnelles.</li>
                        <li>Il est responsable de la bonne conservation, de la sécurité et du soin apporté au matériel confié.</li>
                        <li>Toute anomalie, panne, perte ou vol doit être immédiatement signalé à la DSITD.</li>
                        <li>En cas de changement de service, de poste ou de cessation de fonction, le matériel doit être restitué sans délai à la DSITD.</li>
                    </ul>
                </div>

                <div class="section-title">3. Émargement & Validation</div>
                <div class="signatures-container">
                    <div class="signature-box">
                        <div>
                            <div class="signature-title">Le Bénéficiaire</div>
                            <div class="signature-field"><strong>Nom & Prénom :</strong> ${empNomPrenom}</div>
                            <div class="signature-field"><strong>Date :</strong></div>
                        </div>
                        <div class="signature-space">Signature du bénéficiaire</div>
                    </div>

                    <div class="signature-box">
                        <div>
                            <div class="signature-title">Responsable Hiérarchique</div>
                            <div class="signature-field"><strong>Nom & Prénom :</strong></div>
                            <div class="signature-field"><strong>Date :</strong></div>
                        </div>
                        <div class="signature-space">Signature & Visa</div>
                    </div>

                    <div class="signature-box">
                        <div>
                            <div class="signature-title">Direction DSITD</div>
                            <div class="signature-field"><strong>Nom & Prénom :</strong></div>
                            <div class="signature-field"><strong>Date :</strong></div>
                        </div>
                        <div class="signature-space">Signature & Cachet</div>
                    </div>
                </div>
            </body>
            </html>
        `);
        w.document.close();
        w.focus();
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
                    {canCreate && (
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
                                            ? `Employé trouvé : ${matchedEmploye.nom} ${matchedEmploye.prenom} [Service : ${matchedEmploye.service?.nom_service ?? 'Non attribué'}]`
                                            : addData.matricule
                                                ? 'Aucun employé avec ce matricule'
                                                : 'En attente de matricule...'}
                                    </div>
                                    <div className={`px-3 py-2 rounded border ${matchedMateriel && !matchedMateriel.unavailable ? 'bg-green-50 border-green-200'
                                            : matchedMateriel?.unavailable ? 'bg-red-50 border-red-200'
                                                : 'bg-gray-50 border-gray-200'
                                        }`}>
                                        {matchedMateriel?.unavailable
                                            ? `Ce matériel est déjà affecté sur cette période (${matchedMateriel.nom})`
                                            : matchedMateriel
                                                ? `Matériel trouvé : ${matchedMateriel.nom} — ${matchedMateriel.marque} ${matchedMateriel.modele} [Catégorie : ${matchedMateriel.categorie?.nom_categorie ?? 'N/A'}]`
                                                : addData.search_value
                                                    ? 'Aucun matériel avec ce numéro'
                                                    : 'En attente de numéro...'}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !matchedEmploye || !matchedMateriel || matchedMateriel.unavailable}
                                    className="bg-gray-800 text-white px-4 py-2 rounded md:col-span-4 hover:bg-gray-700 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Affectation en cours...' : 'Affecter'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tableau */}
                    <div className="lux-card p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Historique des affectations ({filteredAffectations.length})</h1>
                                <a
                                    href={route('exports.affectations.csv')}
                                    className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10"
                                >
                                    📥 Exporter CSV
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 md:max-w-xl">
                                <input
                                    type="text"
                                    placeholder="Rechercher (Employé, Service, Matériel, S/N...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f] bg-slate-50/50"
                                />

                                <select
                                    value={etatFilter}
                                    onChange={(e) => setEtatFilter(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                >
                                    <option value="all">Tous les états</option>
                                    <option value="Affecté">Affecté (En cours)</option>
                                    <option value="Clôturé">Clôturé (Restitué)</option>
                                    <option value="prolonge">⚠️ Prolongés (> 6 mois)</option>
                                </select>
                            </div>
                        </div>

                        {/* Long-Standing Filter Banner Alert */}
                        {isFromAlert && (
                            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
                                <span className="font-semibold flex items-center gap-2">
                                    ⚠️ Affichage des affectations prolongées en surbrillance suite à l'accès depuis l'alerte du tableau de bord.
                                </span>
                                <a href={route('affectations.index')} className="text-amber-800 underline hover:text-amber-950 font-medium">
                                    Réinitialiser l'affichage standard
                                </a>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-sm">
                                        <th className="py-2 px-3 whitespace-nowrap">Date affect.</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Nom</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Prénom</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Matricule</th>
                                        <th className="py-2 px-3 whitespace-nowrap">Service</th>
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
                                    {filteredAffectations.map((a, index) => {
                                        const isProlonged = a.etat === 'Affecté' && new Date(a.date_affectation) <= new Date(new Date().setMonth(new Date().getMonth() - 6));
                                        const isHighlighted = isFromAlert && (highlightTargetId ? a.id === highlightTargetId : isProlonged);

                                        return (
                                            <tr
                                                key={a.id}
                                                className={`border-b transition ${isHighlighted ? 'bg-amber-100/80 ring-2 ring-amber-400 font-medium' : 'hover:bg-gray-50'}`}
                                            >
                                                <td className="py-2 px-3 whitespace-nowrap">{formatDate(a.date_affectation)}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{a.employe?.nom}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{a.employe?.prenom}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{a.employe?.matricule}</td>
                                                <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-700">{a.employe?.service?.nom_service ?? '—'}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.nom}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.marque}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.modele}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.numero_serie}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.numero_inventaire}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{a.materiel?.categorie?.nom_categorie}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{formatDate(a.date_restitution)}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {etatBadge(a.etat)}
                                                        {isHighlighted && (
                                                            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                                Alerte Prolongée
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-2 px-3">
                                                    <div className="relative inline-block text-left">
                                                        <Dropdown>
                                                            <Dropdown.Trigger>
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition shadow-sm gap-1.5"
                                                                >
                                                                    <span>Actions</span>
                                                                    <span className="text-[10px] text-slate-400">▼</span>
                                                                </button>
                                                            </Dropdown.Trigger>

                                                            <Dropdown.Content align="right" width="48">
                                                                <button
                                                                    onClick={() => setVoirAffectation(a)}
                                                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                                >
                                                                    <span>👁️</span>
                                                                    <span>Consulter les détails</span>
                                                                </button>

                                                                {canEdit && (
                                                                    <button
                                                                        onClick={() => openEdit(a)}
                                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#11508f] hover:bg-blue-50 flex items-center gap-2"
                                                                    >
                                                                        <span>✏️</span>
                                                                        <span>Modifier l'affectation</span>
                                                                    </button>
                                                                )}

                                                                {canEdit && a.etat === 'Affecté' && (
                                                                    <button
                                                                        onClick={() => openCloturer(a)}
                                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                                                                    >
                                                                        <span>🔒</span>
                                                                        <span>Clôturer / Restituer</span>
                                                                    </button>
                                                                )}

                                                                {canEdit && a.etat === 'Clôturé' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => openCloturer(a)}
                                                                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                                                                        >
                                                                            <span>📝</span>
                                                                            <span>Modifier la clôture</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => annulerCloture(a)}
                                                                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                                                                        >
                                                                            <span>🔓</span>
                                                                            <span>Annuler la clôture</span>
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {canPrint && (
                                                                    <a
                                                                        href={route('affectations.print', a.id)}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 block border-t border-slate-100"
                                                                    >
                                                                        <span>🖨️</span>
                                                                        <span>Imprimer la fiche A4</span>
                                                                    </a>
                                                                )}

                                                                {canEdit && (
                                                                    <button
                                                                        onClick={() => destroy(a.id)}
                                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                                                                    >
                                                                        <span>🗑️</span>
                                                                        <span>Supprimer</span>
                                                                    </button>
                                                                )}
                                                            </Dropdown.Content>
                                                        </Dropdown>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                    <div className="p-6 space-y-4 text-sm">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-semibold text-gray-800">Détail de l'affectation #AFF-{String(voirAffectation.id).padStart(5, '0')}</h2>
                            {etatBadge(voirAffectation.etat)}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                            <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Informations Bénéficiaire</p>
                            <p><strong>Employé :</strong> {voirAffectation.employe?.nom} {voirAffectation.employe?.prenom} <span className="text-slate-500">({voirAffectation.employe?.matricule})</span></p>
                            <p><strong>Service :</strong> <span className="font-semibold text-blue-700">{voirAffectation.employe?.service?.nom_service || 'Non attribué'}</span></p>
                            {voirAffectation.employe?.fonction && <p><strong>Fonction :</strong> {voirAffectation.employe?.fonction}</p>}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                            <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Détails du Matériel</p>
                            <p><strong>Matériel :</strong> {voirAffectation.materiel?.nom} — {voirAffectation.materiel?.marque} {voirAffectation.materiel?.modele}</p>
                            <p><strong>N° Série :</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">{voirAffectation.materiel?.numero_serie || '—'}</code></p>
                            <p><strong>N° Inventaire :</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">{voirAffectation.materiel?.numero_inventaire || '—'}</code></p>
                            <p><strong>Catégorie :</strong> {voirAffectation.materiel?.categorie?.nom_categorie || '—'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div>
                                <p className="text-xs text-slate-500 font-semibold">Date d'affectation</p>
                                <p className="font-medium text-slate-800">{formatDate(voirAffectation.date_affectation)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold">Date de restitution</p>
                                <p className="font-medium text-slate-800">{formatDate(voirAffectation.date_restitution)}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                            <button
                                onClick={() => imprimer(voirAffectation)}
                                className="inline-flex items-center gap-2 bg-[#11508f] text-white px-4 py-2 rounded-md hover:bg-[#0d3d6e] transition font-medium text-sm"
                            >
                                Imprimer la fiche
                            </button>
                            <button onClick={() => setVoirAffectation(null)} className="text-slate-600 text-sm font-medium hover:text-slate-900">Fermer</button>
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
                            <div className={`px-3 py-2 rounded border ${editMatchedMateriel && !editMatchedMateriel.unavailable ? 'bg-green-50 border-green-200'
                                    : editMatchedMateriel?.unavailable ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                }`}>
                                {editMatchedMateriel?.unavailable
                                    ? `Ce matériel est déjà affecté sur cette période (${editMatchedMateriel.nom})`
                                    : editMatchedMateriel
                                        ? `Matériel : ${editMatchedMateriel.nom} - ${editMatchedMateriel.marque} ${editMatchedMateriel.modele}`
                                        : 'Aucun matériel correspondant'}
                            </div>
                        </div>

                        {pageErrors?.materiel_id && (
                            <p className="text-red-600 text-sm">{pageErrors.materiel_id}</p>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditState(null)} className="text-gray-500 text-sm">Annuler</button>
                            <button
                                onClick={submitEdit}
                                disabled={!editMatchedEmploye || !editMatchedMateriel || editMatchedMateriel.unavailable}
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