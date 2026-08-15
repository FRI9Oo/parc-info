import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ affectations, employes, materiels }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const { t } = useLanguage();

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
    const [prolongeMonths, setProlongeMonths] = useState(() => Number(urlParams.get('months')) || 6);

    const filteredAffectations = useMemo(() => {
        return affectations.filter((a) => {
            if (etatFilter === 'affecte' && a.etat !== 'Affecté') return false;
            if (etatFilter === 'cloture' && a.etat !== 'Clôturé') return false;
            if (etatFilter === 'prolonge') {
                if (a.etat !== 'Affecté') return false;
                const startDate = new Date(a.date_affectation);
                const thresholdDate = new Date();
                thresholdDate.setMonth(thresholdDate.getMonth() - prolongeMonths);
                if (startDate > thresholdDate) return false;
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
    }, [affectations, searchQuery, etatFilter, prolongeMonths]);

    // ---------- Pagination ----------
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: paginatedAffectations,
    } = usePagination(filteredAffectations, 10, [searchQuery, etatFilter, prolongeMonths]);

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
        window.open(route('affectations.print', a.id), '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('affectations_title')} />
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
                        <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6 mb-6">
                            <h2 className="text-base font-extrabold mb-4 text-slate-800 flex items-center gap-2">
                                <span>➕</span> {t('affectations_new')}
                            </h2>
                            <form onSubmit={submitAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input
                                    type="date"
                                    value={addData.date_affectation}
                                    onChange={(e) => setAddData({ ...addData, date_affectation: e.target.value })}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder={t('employes_matricule')}
                                    value={addData.matricule}
                                    onChange={(e) => setAddData({ ...addData, matricule: e.target.value })}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                                />
                                <select
                                    value={addData.search_type}
                                    onChange={(e) => setAddData({ ...addData, search_type: e.target.value, search_value: '' })}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white"
                                >
                                    <option value="serie">{t('materiels_sn')}</option>
                                    <option value="inventaire">{t('materiels_inv')}</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder={addData.search_type === 'serie' ? t('materiels_sn') : t('materiels_inv')}
                                    value={addData.search_value}
                                    onChange={(e) => setAddData({ ...addData, search_value: e.target.value })}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm"
                                />

                                <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${matchedEmploye ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                        {matchedEmploye
                                            ? `✓ ${t('employes')} : ${matchedEmploye.nom} ${matchedEmploye.prenom} [${matchedEmploye.service?.nom_service ?? t('unattached')}]`
                                            : addData.matricule
                                                ? '⚠️ Aucun employé trouvé'
                                                : '⏳ ' + t('affectations_select_beneficiary')}
                                    </div>
                                    <div className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${matchedMateriel && !matchedMateriel.unavailable ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                            : matchedMateriel?.unavailable ? 'bg-rose-50 border-rose-200 text-rose-900'
                                                : 'bg-slate-50 border-slate-200 text-slate-500'
                                        }`}>
                                        {matchedMateriel?.unavailable
                                            ? `⚠️ ${t('materiels_affecte')} (${matchedMateriel.nom})`
                                            : matchedMateriel
                                                ? `✓ ${matchedMateriel.nom} — ${matchedMateriel.marque} ${matchedMateriel.modele}`
                                                : addData.search_value
                                                    ? '⚠️ Aucun matériel trouvé'
                                                    : '⏳ ' + t('affectations_select_equipment')}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !matchedEmploye || !matchedMateriel || matchedMateriel.unavailable}
                                    className="bg-[#11508f] text-white px-5 py-2.5 rounded-xl md:col-span-4 hover:bg-[#0d3d6e] transition font-bold text-xs shadow-md shadow-[#11508f]/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? t('loading') : t('affectations_new')}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tableau */}
                    <div className="lux-card p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('affectations_title')} ({filteredAffectations.length})</h1>
                                <a
                                    href={route('exports.affectations.csv')}
                                    className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10"
                                >
                                    📥 {t('export_csv')}
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 md:max-w-xl">
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f] bg-slate-50/50"
                                />

                                <select
                                    value={etatFilter}
                                    onChange={(e) => setEtatFilter(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                >
                                    <option value="all">{t('affectations_all')}</option>
                                    <option value="Affecté">{t('affectations_active')}</option>
                                    <option value="Clôturé">{t('affectations_closed')}</option>
                                    <option value="prolonge">⚠️ {t('affectations_prolonged', { months: prolongeMonths })}</option>
                                </select>

                                {etatFilter === 'prolonge' && (
                                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-amber-900 dark:text-amber-300">
                                        <span className="font-bold shrink-0">⏱️ {t('dashboard_alert_threshold')}</span>
                                        <select
                                            value={prolongeMonths}
                                            onChange={(e) => setProlongeMonths(Number(e.target.value))}
                                            className="border-0 bg-transparent py-0 pl-1 pr-6 text-xs font-extrabold focus:ring-0 text-amber-900 dark:text-amber-200 cursor-pointer"
                                        >
                                            <option value="1">1 mois</option>
                                            <option value="2">2 mois</option>
                                            <option value="3">3 mois</option>
                                            <option value="6">6 mois (défaut)</option>
                                            <option value="9">9 mois</option>
                                            <option value="12">12 mois (1 an)</option>
                                            <option value="24">24 mois (2 ans)</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Long-Standing Filter Banner Alert */}
                        {isFromAlert && (
                            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
                                <span className="font-semibold flex items-center gap-2">
                                    ⚠️ {t('affectations_prolonged', { months: prolongeMonths })}
                                </span>
                                <a href={route('affectations.index')} className="text-amber-800 underline hover:text-amber-950 font-medium">
                                    {t('all')}
                                </a>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-sm">
                                        <th className="py-2 px-3 whitespace-nowrap">{t('affectations_date_affectation')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('employes_nom')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('employes_prenom')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('employes_matricule')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('services')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('materiels_nom')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('materiels_marque')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('materiels_modele')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('materiels_sn')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('materiels_inv')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('materiels_categorie')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('affectations_date_retour')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('status')}</th>
                                        <th className="py-2 px-3 whitespace-nowrap">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {paginatedAffectations.map((a, index) => {
                                        const isProlonged = a.etat === 'Affecté' && new Date(a.date_affectation) <= new Date(new Date().setMonth(new Date().getMonth() - prolongeMonths));
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
                                                        {isProlonged && (
                                                            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                                ⚠️ Prolongée (+ de {prolongeMonths} m)
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
                                                                    <span>{t('actions')}</span>
                                                                    <span className="text-[10px] text-slate-400">▼</span>
                                                                </button>
                                                            </Dropdown.Trigger>

                                                            <Dropdown.Content align="right" width="48">
                                                                <button
                                                                    onClick={() => setVoirAffectation(a)}
                                                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                                                >
                                                                    <span>👁️</span>
                                                                    <span>{t('details')}</span>
                                                                </button>

                                                                {canEdit && (
                                                                    <button
                                                                        onClick={() => openEdit(a)}
                                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#11508f] hover:bg-blue-50 flex items-center gap-2"
                                                                    >
                                                                        <span>✏️</span>
                                                                        <span>{t('edit')}</span>
                                                                    </button>
                                                                )}

                                                                {canEdit && a.etat === 'Affecté' && (
                                                                    <button
                                                                        onClick={() => openCloturer(a)}
                                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                                                                    >
                                                                        <span>🔒</span>
                                                                        <span>{t('affectations_close_modal_title')}</span>
                                                                    </button>
                                                                )}

                                                                {canEdit && a.etat === 'Clôturé' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => openCloturer(a)}
                                                                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                                                                        >
                                                                            <span>📝</span>
                                                                            <span>{t('edit')}</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => annulerCloture(a)}
                                                                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                                                                        >
                                                                            <span>🔓</span>
                                                                            <span>{t('cancel')}</span>
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
                                                                        <span>{t('print')} ({t('affectations_print_sheet')})</span>
                                                                    </a>
                                                                )}

                                                                {canEdit && (
                                                                    <button
                                                                        onClick={() => destroy(a.id)}
                                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                                                                    >
                                                                        <span>🗑️</span>
                                                                        <span>{t('delete')}</span>
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

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />

                        {affectations.length === 0 && (
                            <p className="text-center text-gray-500 py-8">{t('pagination_no_data')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Voir */}
            <Modal show={!!voirAffectation} onClose={() => setVoirAffectation(null)} maxWidth="lg">
                {voirAffectation && (
                    <div className="p-6 space-y-4 text-sm">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-semibold text-gray-800">{t('details')} #AFF-{String(voirAffectation.id).padStart(5, '0')}</h2>
                            {etatBadge(voirAffectation.etat)}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                            <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">{t('print_beneficiary_info')}</p>
                            <p><strong>{t('employes')} :</strong> {voirAffectation.employe?.nom} {voirAffectation.employe?.prenom} <span className="text-slate-500">({voirAffectation.employe?.matricule})</span></p>
                            <p><strong>{t('services')} :</strong> <span className="font-semibold text-blue-700">{voirAffectation.employe?.service?.nom_service || t('unattached')}</span></p>
                            {voirAffectation.employe?.fonction && <p><strong>{t('employes_fonction')} :</strong> {voirAffectation.employe?.fonction}</p>}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                            <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">{t('print_equipment_info')}</p>
                            <p><strong>{t('materiels')} :</strong> {voirAffectation.materiel?.nom} — {voirAffectation.materiel?.marque} {voirAffectation.materiel?.modele}</p>
                            <p><strong>{t('materiels_sn')} :</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">{voirAffectation.materiel?.numero_serie || '—'}</code></p>
                            <p><strong>{t('materiels_inv')} :</strong> <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">{voirAffectation.materiel?.numero_inventaire || '—'}</code></p>
                            <p><strong>{t('materiels_categorie')} :</strong> {voirAffectation.materiel?.categorie?.nom_categorie || '—'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div>
                                <p className="text-xs text-slate-500 font-semibold">{t('affectations_date_affectation')}</p>
                                <p className="font-medium text-slate-800">{formatDate(voirAffectation.date_affectation)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold">{t('affectations_date_retour')}</p>
                                <p className="font-medium text-slate-800">{formatDate(voirAffectation.date_restitution)}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                            <button
                                onClick={() => imprimer(voirAffectation)}
                                className="inline-flex items-center gap-2 bg-[#11508f] text-white px-4 py-2 rounded-md hover:bg-[#0d3d6e] transition font-medium text-sm"
                            >
                                {t('print')}
                            </button>
                            <button onClick={() => setVoirAffectation(null)} className="text-slate-600 text-sm font-medium hover:text-slate-900">{t('close')}</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Modifier */}
            <Modal show={!!editState} onClose={() => setEditState(null)} maxWidth="lg">
                {editState && (
                    <div className="p-6 space-y-3">
                        <h2 className="text-lg font-medium mb-2">{t('edit')}</h2>
                        <input
                            type="date"
                            value={editState.date_affectation}
                            onChange={(e) => setEditState({ ...editState, date_affectation: e.target.value })}
                            className="border rounded px-3 py-2 w-full"
                        />
                        <input
                            type="text"
                            placeholder={t('employes_matricule')}
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
                                <option value="serie">{t('materiels_sn')}</option>
                                <option value="inventaire">{t('materiels_inv')}</option>
                            </select>
                            <input
                                type="text"
                                placeholder={editState.search_type === 'serie' ? t('materiels_sn') : t('materiels_inv')}
                                value={editState.search_value}
                                onChange={(e) => setEditState({ ...editState, search_value: e.target.value })}
                                className="border rounded px-3 py-2 flex-1"
                            />
                        </div>

                        <div className="text-sm space-y-1">
                            <div className={`px-3 py-2 rounded border ${editMatchedEmploye ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                {editMatchedEmploye ? `${t('employes')} : ${editMatchedEmploye.nom} ${editMatchedEmploye.prenom}` : t('unspecified')}
                            </div>
                            <div className={`px-3 py-2 rounded border ${editMatchedMateriel && !editMatchedMateriel.unavailable ? 'bg-green-50 border-green-200'
                                    : editMatchedMateriel?.unavailable ? 'bg-red-50 border-red-200'
                                        : 'bg-gray-50 border-gray-200'
                                }`}>
                                {editMatchedMateriel?.unavailable
                                    ? `${t('materiels_affecte')} (${editMatchedMateriel.nom})`
                                    : editMatchedMateriel
                                        ? `${t('materiels')} : ${editMatchedMateriel.nom} - ${editMatchedMateriel.marque} ${editMatchedMateriel.modele}`
                                        : t('unspecified')}
                            </div>
                        </div>

                        {pageErrors?.materiel_id && (
                            <p className="text-red-600 text-sm">{pageErrors.materiel_id}</p>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditState(null)} className="text-gray-500 text-sm">{t('cancel')}</button>
                            <button
                                onClick={submitEdit}
                                disabled={!editMatchedEmploye || !editMatchedMateriel || editMatchedMateriel.unavailable}
                                className="bg-[#11508f] text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                            >
                                {t('save')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Clôturer */}
            <Modal show={!!clotureState} onClose={() => setClotureState(null)} maxWidth="sm">
                {clotureState && (
                    <div className="p-6 space-y-3">
                        <h2 className="text-lg font-medium mb-2">
                            {clotureState.isEditing ? t('edit') : t('affectations_close_modal_title')}
                        </h2>
                        <label className="block text-sm text-gray-700">{t('affectations_restitution_date')}</label>
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
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setClotureState(null)} className="text-gray-500 text-sm">{t('cancel')}</button>
                            <button onClick={confirmCloture} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
                                {clotureState.isEditing ? t('save') : t('affectations_close_btn')}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}