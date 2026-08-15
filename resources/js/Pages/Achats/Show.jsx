import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ achat, categories = [], marques = [], modeles = [] }) {
    const { auth = {} } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;

    const canEditAchat = isAdmin || permissions.includes('gerer_achats') || permissions.includes('modifier_achat');
    const canValidateAchat = isAdmin || permissions.includes('gerer_achats') || permissions.includes('valider_achat') || permissions.includes('modifier_achat');
    const canAddBordereau = isAdmin || permissions.includes('gerer_achats') || permissions.includes('creer_achat') || permissions.includes('modifier_achat');
    const canEditBordereau = isAdmin || permissions.includes('gerer_achats') || permissions.includes('modifier_achat');
    const canDeleteBordereau = isAdmin || permissions.includes('gerer_achats') || permissions.includes('supprimer_achat');
    const canAddFacture = isAdmin || permissions.includes('gerer_factures') || permissions.includes('creer_facture') || permissions.includes('gerer_achats');
    const canDeleteFacture = isAdmin || permissions.includes('gerer_factures') || permissions.includes('supprimer_facture') || permissions.includes('gerer_achats');
    const canCreateAffectation = isAdmin || permissions.includes('gerer_affectations') || permissions.includes('creer_affectation');

    const { t } = useLanguage();
    const [isAddLineModalOpen, setIsAddLineModalOpen] = useState(false);
    const [editingBordereau, setEditingBordereau] = useState(null);
    const [isAddFactureModalOpen, setIsAddFactureModalOpen] = useState(false);

    // Bordereau Add Form
    const lineForm = useForm({
        nom_materiel: '',
        caracteristiques: '',
        quantite_materiel: 1,
        garantie_materiel: 12,
        prix_unitaire_ht: '',
        categorie_id: '',
        modele_id: '',
    });

    // Bordereau Edit Form
    const editLineForm = useForm({
        nom_materiel: '',
        caracteristiques: '',
        quantite_materiel: 1,
        garantie_materiel: 12,
        prix_unitaire_ht: '',
        categorie_id: '',
        modele_id: '',
    });

    // Facture Add Form
    const factureForm = useForm({
        numero_facture: '',
        date_facture: new Date().toISOString().split('T')[0],
        montant_ht: '',
        taux_tva: 20,
        achat_id: achat.id,
    });

    const handleAddLine = (e) => {
        e.preventDefault();
        lineForm.post(route('bordereaux.store', achat.id), {
            onSuccess: () => {
                lineForm.reset();
                setIsAddLineModalOpen(false);
            },
        });
    };

    const openEditLineModal = (b) => {
        setEditingBordereau(b);
        editLineForm.setData({
            nom_materiel: b.nom_materiel || '',
            caracteristiques: b.caracteristiques || '',
            quantite_materiel: b.quantite_materiel || 1,
            garantie_materiel: b.garantie_materiel || 12,
            prix_unitaire_ht: b.prix_unitaire_ht || '',
            categorie_id: b.categorie_id || '',
            modele_id: b.modele_id || '',
        });
        editLineForm.clearErrors();
    };

    const handleUpdateLine = (e) => {
        e.preventDefault();
        editLineForm.put(route('bordereaux.update', editingBordereau.id), {
            onSuccess: () => setEditingBordereau(null),
        });
    };

    const handleDeleteLine = (id, nom) => {
        if (confirm(`Supprimer la ligne "${nom}" du bordereau ?`)) {
            router.delete(route('bordereaux.destroy', id));
        }
    };

    const handleAddFacture = (e) => {
        e.preventDefault();
        factureForm.post(route('factures.store'), {
            onSuccess: () => {
                factureForm.reset();
                setIsAddFactureModalOpen(false);
            },
        });
    };

    const handleDeleteFacture = (id, num) => {
        if (confirm(`Supprimer la facture "${num}" ?`)) {
            router.delete(route('factures.destroy', id));
        }
    };

    // Calculate Totals
    const totalHt = achat.bordereaux?.reduce((acc, b) => acc + (b.prix_unitaire_ht * b.quantite_materiel), 0) || 0;
    const totalFacturesTtc = achat.factures?.reduce((acc, f) => acc + parseFloat(f.montant_ttc || 0), 0) || 0;
    const totalQteCommandee = achat.bordereaux?.reduce((acc, b) => acc + b.quantite_materiel, 0) || 0;
    const totalQteLivree = achat.bordereaux?.reduce((acc, b) => {
        const livree = b.livraisons?.reduce((sum, l) => sum + l.quantite_livraison, 0) || 0;
        return acc + livree;
    }, 0) || 0;

    const allMateriels = achat.bordereaux?.flatMap((b) => b.livraisons?.flatMap((l) => l.materiels || []) || []) || [];
    const totalAffectee = achat.total_affectee ?? allMateriels.filter((m) => m.affectations && m.affectations.some((aff) => !aff.date_restitution)).length;
    const isValideReady = achat.can_be_valide ?? (totalQteCommandee > 0 && totalQteLivree >= totalQteCommandee && totalAffectee >= totalQteCommandee);

    const handleQuickValidate = () => {
        router.put(route('achats.update', achat.id), {
            ...achat,
            statut: 'Validé',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${t('achats')} - ${achat.numero_achat}`} />
            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Top Bar Navigation */}
                    <div className="flex items-center justify-between">
                        <Link
                            href={route('achats.index')}
                            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition"
                        >
                            <span>←</span>
                            <span>{t('back')} {t('achats')}</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {achat.type_achat}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${achat.statut === 'Validé' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                                {achat.statut}
                            </span>
                        </div>
                    </div>

                    {/* Purchase Header Card */}
                    <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-lg font-extrabold shadow-sm">
                                        🛒
                                    </span>
                                    <div>
                                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {achat.numero_achat} — {achat.objet_achat}
                                        </h1>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {t('fournisseurs')} : <strong className="text-slate-700 dark:text-slate-200">{achat.fournisseur?.nom_fournisseur}</strong> | {t('date')} : <strong className="text-slate-700 dark:text-slate-200">{achat.date_achat}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Metrics */}
                            <div className="flex flex-wrap items-center gap-6 divide-x divide-slate-200 dark:divide-slate-700">
                                <div className="text-right">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('achat_total_ht')}</span>
                                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                                        {totalHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                    </span>
                                </div>
                                <div className="ps-6 text-right">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('achat_total_ttc')}</span>
                                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                                        {totalFacturesTtc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                    </span>
                                </div>
                                <div className="ps-6 text-right">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('livraisons')}</span>
                                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                                        {totalQteLivree} / {totalQteCommandee}
                                    </span>
                                </div>
                                <div className="ps-6 text-right">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('affectations')}</span>
                                    <span className={`text-base font-extrabold ${totalAffectee >= totalQteCommandee && totalQteCommandee > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {totalAffectee} / {totalQteCommandee}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Validation Eligibility Banner */}
                        {achat.statut !== 'Validé' && (
                            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                                {isValideReady ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">🎉</span>
                                            <div>
                                                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                                    Tous les matériels ({totalAffectee} / {totalQteCommandee}) sont livrés et affectés aux collaborateurs !
                                                </h3>
                                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                                    Toutes les conditions de validation sont remplies. Vous pouvez maintenant valider définitivement cet achat.
                                                </p>
                                            </div>
                                        </div>
                                        {canValidateAchat && (
                                            <button
                                                onClick={handleQuickValidate}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 whitespace-nowrap shrink-0"
                                            >
                                                ✓ Valider ce marché
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                                        <span className="text-lg">ℹ️</span>
                                        <div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                Règle de validation :
                                            </span>{' '}
                                            <span className="text-slate-600 dark:text-slate-400">
                                                Cet achat ne pourra passer au statut <strong>"Validé"</strong> qu'une fois la totalité des équipements réceptionnée ({totalQteLivree}/{totalQteCommandee}) et affectée aux employés ({totalAffectee}/{totalQteCommandee} affectés).
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Section 1: Bordereau des Prix & Lignes Matériels */}
                    <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>📋</span>
                                    <span>{t('bordereau_title')}</span>
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Détail quantitatif et estimatif des matériels à livrer
                                </p>
                            </div>

                            {canAddBordereau && (
                                <button
                                    onClick={() => {
                                        setIsAddLineModalOpen(true);
                                        lineForm.reset();
                                        lineForm.clearErrors();
                                    }}
                                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
                                >
                                    <span>➕</span>
                                    <span>{t('bordereau_add_line')}</span>
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-3.5">{t('bordereau_designation')}</th>
                                        <th className="py-3 px-3">{t('categories')}</th>
                                        <th className="py-3 px-3">{t('marques_modeles')}</th>
                                        <th className="py-3 px-3 text-center">{t('bordereau_qte')}</th>
                                        <th className="py-3 px-3 text-right">{t('bordereau_pu_ht')}</th>
                                        <th className="py-3 px-3 text-right">{t('bordereau_total_ht')}</th>
                                        <th className="py-3 px-3 text-center">{t('bordereau_delivered')}</th>
                                        <th className="py-3 px-3.5 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                    {achat.bordereaux?.map((b) => {
                                        const deliveredQty = b.livraisons?.reduce((sum, l) => sum + l.quantite_livraison, 0) || 0;
                                        const remainingQty = Math.max(0, b.quantite_materiel - deliveredQty);
                                        const lineTotalHt = (parseFloat(b.prix_unitaire_ht) || 0) * b.quantite_materiel;
                                        const percentDelivered = Math.min(100, Math.round((deliveredQty / b.quantite_materiel) * 100));

                                        return (
                                            <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                                <td className="py-3.5 px-3.5 font-bold text-slate-900 dark:text-white">
                                                    {b.nom_materiel}
                                                    {b.caracteristiques && (
                                                        <span className="block text-[10px] font-normal text-slate-400 max-w-sm truncate">
                                                            {b.caracteristiques}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {b.categorie?.nom_categorie || '—'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-medium">
                                                    {b.modele ? `${b.modele.marque?.nom_marque || ''} ${b.modele.nom_modele}` : '—'}
                                                </td>
                                                <td className="py-3.5 px-3 text-center font-bold text-slate-900 dark:text-white">
                                                    {b.quantite_materiel}
                                                </td>
                                                <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                                                    {(parseFloat(b.prix_unitaire_ht) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                                                    {lineTotalHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                                </td>
                                                <td className="py-3.5 px-3 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                                                            {deliveredQty} / {b.quantite_materiel} ({percentDelivered}%)
                                                        </span>
                                                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${percentDelivered === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                                                style={{ width: `${percentDelivered}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {canEditBordereau && (
                                                            <button
                                                                onClick={() => openEditLineModal(b)}
                                                                className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg transition"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                        {canDeleteBordereau && (
                                                            <button
                                                                onClick={() => handleDeleteLine(b.id, b.nom_materiel)}
                                                                className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg transition"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                        {!canEditBordereau && !canDeleteBordereau && (
                                                            <span className="text-slate-400 text-[11px]">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {(!achat.bordereaux || achat.bordereaux.length === 0) && (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                                                Aucune ligne dans ce bordereau. Cliquez sur "Ajouter une ligne au bordereau".
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 2: Factures & Paiements */}
                    <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>🧾</span>
                                    <span>{t('factures')} ({achat.factures?.length || 0})</span>
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Factures enregistrées pour ce marché
                                </p>
                            </div>

                            {canAddFacture && (
                                <button
                                    onClick={() => {
                                        setIsAddFactureModalOpen(true);
                                        factureForm.reset();
                                        factureForm.setData('achat_id', achat.id);
                                        factureForm.clearErrors();
                                    }}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20"
                                >
                                    <span>➕</span>
                                    <span>{t('factures_add')}</span>
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-3.5">{t('facture_numero')}</th>
                                        <th className="py-3 px-3">{t('facture_date')}</th>
                                        <th className="py-3 px-3 text-right">{t('facture_montant_ht')}</th>
                                        <th className="py-3 px-3 text-center">{t('facture_tva')}</th>
                                        <th className="py-3 px-3 text-right">{t('facture_montant_ttc')}</th>
                                        <th className="py-3 px-3.5 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                    {achat.factures?.map((f) => (
                                        <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white">
                                                🧾 {f.numero_facture}
                                            </td>
                                            <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                                                {f.date_facture}
                                            </td>
                                            <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                                                {(parseFloat(f.montant_ht) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                                                {f.taux_tva}%
                                            </td>
                                            <td className="py-3.5 px-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                                {(parseFloat(f.montant_ttc) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                            </td>
                                            <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                                                {canDeleteFacture ? (
                                                    <button
                                                        onClick={() => handleDeleteFacture(f.id, f.numero_facture)}
                                                        className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg transition"
                                                    >
                                                        🗑️
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px]">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!achat.factures || achat.factures.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center text-xs text-slate-400">
                                                Aucune facture enregistrée pour ce marché.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 3: Inventaire des Matériels Livrés & Affectations Collaborateurs */}
                    <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>💻</span>
                                    <span>Équipements Physiques & Affectations ({allMateriels.length})</span>
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Suivi de chaque matériel généré par les bons de livraison et affectation aux collaborateurs
                                </p>
                            </div>

                            {canCreateAffectation && (
                                <Link
                                    href={route('affectations.index')}
                                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
                                >
                                    <span>➕</span>
                                    <span>{t('affectations_new')}</span>
                                </Link>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-3.5">Matériel / Modèle</th>
                                        <th className="py-3 px-3">N° Série (S/N)</th>
                                        <th className="py-3 px-3">N° Inventaire</th>
                                        <th className="py-3 px-3">Statut & Affectation</th>
                                        <th className="py-3 px-3.5 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                    {allMateriels.map((m) => {
                                        const currentAff = m.affectations?.find((a) => !a.date_restitution);
                                        const isAssigned = !!currentAff;

                                        return (
                                            <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                                <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                                                    💻 {m.nom}
                                                    {(m.marque || m.modele) && (
                                                        <span className="block text-[10px] font-normal text-slate-400">
                                                            {m.marque} {m.modele}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                    {m.numero_serie}
                                                </td>
                                                <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                                                    {m.numero_inventaire}
                                                </td>
                                                <td className="py-3 px-3">
                                                    {isAssigned ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                            <span>👤</span>
                                                            <span>{currentAff.employe ? `${currentAff.employe.nom} ${currentAff.employe.prenom}` : 'Affecté'}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                            <span>📦</span>
                                                            <span>En stock / Non affecté</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3.5 text-right whitespace-nowrap">
                                                    {!currentAff ? (
                                                        canCreateAffectation ? (
                                                            <Link
                                                                href={route('affectations.index', { materiel_id: m.id })}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                                                            >
                                                                ➕ Affecter ce matériel
                                                            </Link>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-400 italic">Non affecté</span>
                                                        )
                                                    ) : (
                                                        <Link
                                                            href={route('affectations.index', { highlight: currentAff.id })}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-extrabold transition"
                                                        >
                                                            👁️ Voir affectation →
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {allMateriels.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-xs text-slate-400">
                                                Aucun matériel généré pour le moment. Enregistrez un bon de livraison (BL) dans l'onglet Livraisons pour générer les immobilisations.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Add Bordereau Line Modal */}
            <Modal show={isAddLineModalOpen} onClose={() => setIsAddLineModalOpen(false)} maxWidth="md">
                <form onSubmit={handleAddLine} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('bordereau_add_line')}
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('bordereau_designation')} *
                        </label>
                        <input
                            type="text"
                            value={lineForm.data.nom_materiel}
                            onChange={(e) => lineForm.setData('nom_materiel', e.target.value)}
                            placeholder="Ex: PC Portable 15.6 pouces Core i7"
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('categories')}
                            </label>
                            <select
                                value={lineForm.data.categorie_id}
                                onChange={(e) => lineForm.setData('categorie_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="">-- {t('categories')} --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nom_categorie}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('marques_modeles')}
                            </label>
                            <select
                                value={lineForm.data.modele_id}
                                onChange={(e) => lineForm.setData('modele_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="">-- {t('marques_modeles')} --</option>
                                {modeles.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.marque?.nom_marque} - {m.nom_modele}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('bordereau_qte')} *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={lineForm.data.quantite_materiel}
                                onChange={(e) => lineForm.setData('quantite_materiel', parseInt(e.target.value) || 1)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('bordereau_pu_ht')} *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={lineForm.data.prix_unitaire_ht}
                                onChange={(e) => lineForm.setData('prix_unitaire_ht', e.target.value)}
                                placeholder="0.00"
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('bordereau_garantie')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={lineForm.data.garantie_materiel}
                                onChange={(e) => lineForm.setData('garantie_materiel', parseInt(e.target.value) || 0)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('bordereau_specs')}
                        </label>
                        <textarea
                            value={lineForm.data.caracteristiques}
                            onChange={(e) => lineForm.setData('caracteristiques', e.target.value)}
                            rows={2}
                            placeholder="RAM 16GB, SSD 512GB, Windows 11 Pro..."
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={() => setIsAddLineModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={lineForm.processing}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow"
                        >
                            {t('add')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Bordereau Line Modal */}
            <Modal show={editingBordereau !== null} onClose={() => setEditingBordereau(null)} maxWidth="md">
                <form onSubmit={handleUpdateLine} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        Modifier la ligne bordereau
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('bordereau_designation')} *
                        </label>
                        <input
                            type="text"
                            value={editLineForm.data.nom_materiel}
                            onChange={(e) => editLineForm.setData('nom_materiel', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('categories')}
                            </label>
                            <select
                                value={editLineForm.data.categorie_id}
                                onChange={(e) => editLineForm.setData('categorie_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="">-- {t('categories')} --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nom_categorie}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('marques_modeles')}
                            </label>
                            <select
                                value={editLineForm.data.modele_id}
                                onChange={(e) => editLineForm.setData('modele_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="">-- {t('marques_modeles')} --</option>
                                {modeles.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.marque?.nom_marque} - {m.nom_modele}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('bordereau_qte')} *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={editLineForm.data.quantite_materiel}
                                onChange={(e) => editLineForm.setData('quantite_materiel', parseInt(e.target.value) || 1)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('bordereau_pu_ht')} *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editLineForm.data.prix_unitaire_ht}
                                onChange={(e) => editLineForm.setData('prix_unitaire_ht', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('bordereau_garantie')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={editLineForm.data.garantie_materiel}
                                onChange={(e) => editLineForm.setData('garantie_materiel', parseInt(e.target.value) || 0)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={() => setEditingBordereau(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={editLineForm.processing}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow"
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Facture Modal */}
            <Modal show={isAddFactureModalOpen} onClose={() => setIsAddFactureModalOpen(false)} maxWidth="sm">
                <form onSubmit={handleAddFacture} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('factures_add')}
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('facture_numero')} *
                        </label>
                        <input
                            type="text"
                            value={factureForm.data.numero_facture}
                            onChange={(e) => factureForm.setData('numero_facture', e.target.value)}
                            placeholder="Ex: FACT-2026-088"
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('facture_date')} *
                        </label>
                        <input
                            type="date"
                            value={factureForm.data.date_facture}
                            onChange={(e) => factureForm.setData('date_facture', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('facture_montant_ht')} *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={factureForm.data.montant_ht}
                                onChange={(e) => factureForm.setData('montant_ht', e.target.value)}
                                placeholder="0.00"
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('facture_tva')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={factureForm.data.taux_tva}
                                onChange={(e) => factureForm.setData('taux_tva', parseInt(e.target.value) || 0)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={() => setIsAddFactureModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={factureForm.processing}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow"
                        >
                            {t('add')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
