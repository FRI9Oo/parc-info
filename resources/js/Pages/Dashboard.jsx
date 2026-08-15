import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, Link, usePage, router } from '@inertiajs/react';

export default function Dashboard({
    stats = {},
    recentAffectations = [],
    categoriesBreakdown = [],
    longStandingAffectations = [],
    recentAudits = [],
    availableMateriels = [],
    alertMonths = 6,
}) {
    const { user, permissions = [], isAdmin = false } = usePage().props.auth || {};
    const { t } = useLanguage();

    const handleThresholdChange = (months) => {
        router.get(route('dashboard'), { alert_months: months }, { preserveState: true, preserveScroll: true });
    };

    const hasPerm = (perm1, perm2) => {
        if (isAdmin) return true;
        if (permissions.includes(perm1)) return true;
        if (perm2 && permissions.includes(perm2)) return true;
        return false;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const dateStr = dateString.includes('T') ? dateString.split('T')[0] : dateString;
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0) + ' DH';
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const structureCards = [
        { label: t('directions'), value: stats.directions, routeName: 'directions.index', canAccess: hasPerm('voir_structure', 'gerer_structure'), icon: '🏛️' },
        { label: t('departements'), value: stats.departements, routeName: 'departements.index', canAccess: hasPerm('voir_structure', 'gerer_structure'), icon: '🏢' },
        { label: t('divisions'), value: stats.divisions, routeName: 'divisions.index', canAccess: hasPerm('voir_structure', 'gerer_structure'), icon: '📂' },
        { label: t('services'), value: stats.services, routeName: 'services.index', canAccess: hasPerm('voir_structure', 'gerer_structure'), icon: '⚙️' },
        { label: t('employes'), value: stats.employes, routeName: 'employes.index', canAccess: hasPerm('voir_employes', 'gerer_employes'), icon: '👥' },
        { label: t('categories'), value: stats.categories, routeName: 'categories.index', canAccess: hasPerm('voir_materiels', 'gerer_materiels'), icon: '🏷️' },
    ];

    const canViewMateriels = hasPerm('voir_materiels', 'gerer_materiels');
    const canViewAffectations = hasPerm('voir_affectations', 'gerer_affectations');
    const canViewAchats = hasPerm('voir_achats', 'gerer_achats');
    const canViewFournisseurs = hasPerm('voir_fournisseurs', 'gerer_fournisseurs');
    const canViewFactures = hasPerm('voir_factures', 'gerer_factures');
    const canViewLivraisons = hasPerm('voir_livraisons', 'gerer_livraisons');
    const canViewAudits = hasPerm('voir_journal', 'gerer_journal');

    const totalHardware = stats.materiels || 1;
    const affectePercent = Math.round((stats.affectations_actives / totalHardware) * 100) || 0;
    const disponiblePercent = Math.round((stats.materiels_disponibles / totalHardware) * 100) || 0;

    return (
        <AuthenticatedLayout>
            <Head title={t('dashboard_title')} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">

                    {/* Executive Hero Banner */}
                    <div className="relative overflow-hidden rounded-3xl bg-[url('/images/bg-pattern.jpg')] bg-cover bg-center p-8 text-white shadow-2xl shadow-[#11508f]/30 border border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d3d6e]/95 via-[#11508f]/90 to-[#1562ae]/85 backdrop-blur-[1px]"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-3 border border-white/15">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {t('system_status')}
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    {t('dashboard_welcome', { name: user?.name || 'Admin' })}
                                </h1>
                                <p className="text-sm text-blue-100/90 mt-1 max-w-2xl font-normal leading-relaxed">
                                    {t('dashboard_welcome_sub')}
                                </p>
                            </div>

                            {/* Quick Action Shortcuts inside Hero */}
                            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                {canViewAffectations && (
                                    <Link
                                        href={route('affectations.index')}
                                        className="btn-zellij px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5"
                                    >
                                        <span>➕</span>
                                        <span>{t('affectations_new')}</span>
                                    </Link>
                                )}
                                {canViewMateriels && (
                                    <Link
                                        href={route('materiels.index')}
                                        className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5"
                                    >
                                        <span>📥</span>
                                        <span>Import Excel</span>
                                    </Link>
                                )}
                                {canViewAchats && (
                                    <Link
                                        href={route('achats.index')}
                                        className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 px-3.5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5"
                                    >
                                        <span>🛒</span>
                                        <span>Nouveau Marché</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Decorative background orb */}
                        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    </div>

                    {/* Alert Banner for Long-Standing Affectations */}
                    {canViewAffectations && (
                        <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 shadow-lg shadow-amber-500/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shrink-0 text-xl font-bold">
                                        ⚠️
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300">
                                                {t('dashboard_alert_title', { count: longStandingAffectations.length, months: alertMonths })}
                                            </h3>
                                            <div className="flex items-center gap-1 bg-amber-200/60 dark:bg-amber-950 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-900 dark:text-amber-300">
                                                <span>⏱️ {t('dashboard_alert_threshold')}</span>
                                                <select
                                                    value={alertMonths}
                                                    onChange={(e) => handleThresholdChange(e.target.value)}
                                                    className="bg-transparent border-0 py-0 pl-1 pr-5 text-xs font-extrabold text-amber-950 dark:text-amber-200 focus:ring-0 cursor-pointer"
                                                >
                                                    <option value="1">1 mois / month</option>
                                                    <option value="2">2 mois / months</option>
                                                    <option value="3">3 mois / months</option>
                                                    <option value="6">6 mois / months (défaut)</option>
                                                    <option value="9">9 mois / months</option>
                                                    <option value="12">12 mois (1 an / year)</option>
                                                    <option value="24">24 mois (2 ans / years)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="text-xs text-amber-800/90 dark:text-amber-400 mt-0.5 font-medium">
                                            {t('dashboard_alert_sub')}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={route('affectations.index', { filter: 'prolonge', months: alertMonths, fromAlert: 'true' })}
                                    className="btn-zellij-orange px-5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap text-center shrink-0"
                                >
                                    {t('dashboard_alert_see_all')}
                                </Link>
                            </div>

                            {longStandingAffectations.length > 0 ? (
                                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {longStandingAffectations.slice(0, 3).map((item) => (
                                        <Link
                                            key={item.id}
                                            href={route('affectations.index', { filter: 'prolonge', months: alertMonths, highlight: item.id, fromAlert: 'true' })}
                                            className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs hover:border-amber-400 transition block group"
                                        >
                                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-amber-700 transition">{item.materiel_nom}</div>
                                            <div className="text-slate-500 dark:text-slate-400 mt-1">S/N: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{item.materiel_serie}</span></div>
                                            <div className="text-slate-600 dark:text-slate-400 mt-0.5">{t('employes')}: <span className="font-semibold text-slate-900 dark:text-slate-200">{item.employe_nom}</span></div>
                                            <div className="text-amber-700 dark:text-amber-400 font-bold mt-2 pt-2 border-t border-amber-100 dark:border-amber-950 flex items-center justify-between">
                                                <span>{t('dashboard_assigned_on', { date: formatDate(item.date_affectation) })}</span>
                                                <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded font-extrabold">{item.duration_months} m</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-3 text-xs font-semibold text-amber-800/80 dark:text-amber-400 italic">
                                    {t('dashboard_alert_empty', { months: alertMonths })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Financials & Purchasing Executive KPIs */}
                    {(canViewAchats || canViewFactures) && (
                        <div>
                            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 px-1 flex items-center gap-1.5">
                                <span>💰</span>
                                <span>{t('dashboard_financials')}</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                
                                {/* Budget Engagé HT */}
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard_budget_total')}</span>
                                        <span className="p-2 rounded-xl bg-blue-50 text-blue-600 text-sm">📊</span>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                                        {formatCurrency(stats.total_budget_ht)}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1">
                                        Sur {stats.achats || 0} dossier(s) d'achat
                                    </div>
                                </div>

                                {/* Total Facturé TTC */}
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard_invoiced_total')}</span>
                                        <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 text-sm">🧾</span>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                                        {formatCurrency(stats.total_factures_ttc)}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1">
                                        TVA 20% calculée automatiquement
                                    </div>
                                </div>

                                {/* Taux Global de Livraison */}
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard_delivery_fulfillment')}</span>
                                        <span className="p-2 rounded-xl bg-amber-50 text-amber-600 text-sm">📦</span>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                                        {stats.taux_livraison_global}%
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${stats.taux_livraison_global}%` }}></div>
                                    </div>
                                </div>

                                {/* Marchés Status Distribution */}
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Marchés & Commandes</span>
                                        <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm">🛒</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.achats || 0}</span>
                                        <span className="text-xs text-slate-400">total</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold">
                                            {stats.achats_en_cours || 0} en cours
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                                            {stats.achats_valides || 0} validés
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Parc Hardware Overview Big Cards */}
                    <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 px-1 flex items-center gap-1.5">
                            <span>💻</span>
                            <span>{t('parc_materiel')}</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Card 1: Total Hardware */}
                            {canViewMateriels ? (
                                <Link
                                    href={route('materiels.index')}
                                    className="relative overflow-hidden bg-gradient-to-br from-[#0d3d6e] via-[#11508f] to-[#1d6fc2] text-white p-6 rounded-2xl shadow-xl shadow-[#11508f]/25 block group hover:scale-[1.02] transition-all"
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-200">{t('dashboard_total_hardware')}</div>
                                            <div className="text-4xl font-black mt-1 text-white font-heading">{stats.materiels}</div>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold shadow-md border border-white/20">
                                            💻
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs font-semibold text-blue-100/90 relative z-10 flex items-center gap-1">
                                        <span>{t('materiels_title')} →</span>
                                    </div>
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                                </Link>
                            ) : (
                                <div className="relative overflow-hidden bg-gradient-to-br from-[#0d3d6e] via-[#11508f] to-[#1d6fc2] text-white p-6 rounded-2xl shadow-xl shadow-[#11508f]/25">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-200">{t('dashboard_total_hardware')}</div>
                                            <div className="text-4xl font-black mt-1 text-white font-heading">{stats.materiels}</div>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold shadow-md border border-white/20">
                                            💻
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Card 2: Active Affectations */}
                            {canViewAffectations ? (
                                <Link
                                    href={route('affectations.index')}
                                    className="relative overflow-hidden bg-gradient-to-br from-[#3f8835] via-[#57b24a] to-[#6bc45f] text-white p-6 rounded-2xl shadow-xl shadow-[#57b24a]/25 block group hover:scale-[1.02] transition-all"
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-green-100">{t('dashboard_assigned')}</div>
                                            <div className="text-4xl font-black mt-1 text-white font-heading">{stats.affectations_actives}</div>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold shadow-md border border-white/20">
                                            📋
                                        </div>
                                    </div>
                                    <div className="mt-4 relative z-10">
                                        <div className="flex justify-between text-xs font-bold text-green-100 mb-1">
                                            <span>{t('dashboard_availability')}</span>
                                            <span>{affectePercent}%</span>
                                        </div>
                                        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                                            <div className="bg-white h-2 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${affectePercent}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none"></div>
                                </Link>
                            ) : (
                                <div className="relative overflow-hidden bg-gradient-to-br from-[#3f8835] via-[#57b24a] to-[#6bc45f] text-white p-6 rounded-2xl shadow-xl shadow-[#57b24a]/25">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-green-100">{t('dashboard_assigned')}</div>
                                            <div className="text-4xl font-black mt-1 text-white font-heading">{stats.affectations_actives}</div>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold shadow-md border border-white/20">
                                            📋
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Card 3: Available Stock */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-[#d4960e] via-[#fab61e] to-[#fbc848] text-slate-950 p-6 rounded-2xl shadow-xl shadow-[#fab61e]/25">
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="text-xs font-extrabold uppercase tracking-wider text-amber-950/80">{t('dashboard_available_stock')}</div>
                                        <div className="text-4xl font-black mt-1 text-slate-950 font-heading">{stats.materiels_disponibles}</div>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-black/10 backdrop-blur-md text-slate-950 flex items-center justify-center text-xl font-bold shadow-md border border-black/10">
                                        📦
                                    </div>
                                </div>
                                <div className="mt-4 relative z-10">
                                    <div className="flex justify-between text-xs font-bold text-slate-950/80 mb-1">
                                        <span>{t('dashboard_available_stock')}</span>
                                        <span>{disponiblePercent}%</span>
                                    </div>
                                    <div className="w-full bg-black/15 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                                        <div className="bg-slate-950 h-2 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${disponiblePercent}%` }}></div>
                                    </div>
                                </div>
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
                            </div>

                        </div>
                    </div>

                    {/* Category Distribution Breakdown Progress Visualizer */}
                    {categoriesBreakdown.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>🏷️</span>
                                    <span>{t('dashboard_category_distribution')}</span>
                                </h3>
                                <span className="text-xs text-slate-400">
                                    {categoriesBreakdown.length} catégorie(s) active(s)
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categoriesBreakdown.map((cat) => (
                                    <div key={cat.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{cat.nom_categorie}</span>
                                            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{cat.total} total</span>
                                        </div>

                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2.5 overflow-hidden">
                                            <div
                                                className="bg-[#11508f] h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${cat.taux_utilisation}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                                            <span className="text-emerald-700 font-semibold">👤 {cat.affectes} affecté(s)</span>
                                            <span className="text-amber-700 font-semibold">📦 {cat.disponibles} en stock</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Two Columns: Recent Assignments + Available Stock Sample */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Col 1 & 2: Recent Affectations */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>📋</span>
                                        <span>{t('dashboard_recent_affectations')}</span>
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{t('dashboard_hardware_status')}</p>
                                </div>
                                {canViewAffectations && (
                                    <Link
                                        href={route('affectations.index')}
                                        className="text-xs font-bold text-[#11508f] hover:underline"
                                    >
                                        {t('affectations_all')} →
                                    </Link>
                                )}
                            </div>

                            {recentAffectations.length === 0 ? (
                                <p className="text-center text-slate-400 text-xs py-8">{t('pagination_no_data')}</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                                                <th className="py-2.5 px-3">Date</th>
                                                <th className="py-2.5 px-3">{t('employes')}</th>
                                                <th className="py-2.5 px-3">{t('materiels')}</th>
                                                <th className="py-2.5 px-3 text-right">{t('status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                            {recentAffectations.map((a) => (
                                                <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                                                        {formatDate(a.date_affectation)}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                        {a.employe ? `${a.employe.nom} ${a.employe.prenom}` : '—'}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                        {a.materiel?.nom}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                                        {a.etat === 'Clôturé' ? (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                                                Clôturé
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                                                Affecté
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Col 3: Available Hardware Ready for Assignment */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>📦</span>
                                    <span>{t('dashboard_available_ready')}</span>
                                </h3>
                                {canViewMateriels && (
                                    <Link href={route('materiels.index')} className="text-xs font-bold text-indigo-600 hover:underline">
                                        Stock →
                                    </Link>
                                )}
                            </div>

                            {availableMateriels.length === 0 ? (
                                <p className="text-center text-slate-400 text-xs py-8">Aucun matériel disponible en stock actuellement.</p>
                            ) : (
                                <div className="space-y-3">
                                    {availableMateriels.map((m) => (
                                        <div key={m.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 flex items-center justify-between text-xs">
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{m.nom}</div>
                                                <div className="text-[11px] font-mono text-slate-400 mt-0.5">S/N: {m.numero_serie}</div>
                                            </div>
                                            {canViewAffectations && (
                                                <Link
                                                    href={route('affectations.index', { materiel_id: m.id })}
                                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition shadow-xs"
                                                >
                                                    ➕ Affecter
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Security & Audit Activity Feed */}
                    {canViewAudits && recentAudits.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>🛡️</span>
                                    <span>{t('dashboard_recent_activity')}</span>
                                </h3>
                                <Link href={route('audit-logs.index')} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                                    {t('audit_title')} →
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {recentAudits.map((log) => (
                                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                log.action === 'Création' || log.action === 'Importation' ? 'bg-emerald-50 text-emerald-700' :
                                                log.action === 'Modification' ? 'bg-blue-50 text-blue-700' :
                                                log.action === 'Suppression' ? 'bg-rose-50 text-rose-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {log.action}
                                            </span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">{log.module}</span>
                                            <span className="text-slate-500 truncate max-w-md hidden sm:inline">{log.details}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-400 whitespace-nowrap">
                                            {formatTimeAgo(log.created_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Organisation Counts Grid */}
                    <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 px-1 flex items-center gap-1.5">
                            <span>🏛️</span>
                            <span>{t('structure')}</span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {structureCards.map((c) => {
                                const cardContent = (
                                    <div className="flex flex-col items-center text-center">
                                        <span className="text-2xl mb-1">{c.icon}</span>
                                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{c.value}</div>
                                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</div>
                                    </div>
                                );

                                return c.canAccess ? (
                                    <Link
                                        key={c.label}
                                        href={route(c.routeName)}
                                        className="lux-card p-5 block"
                                    >
                                        {cardContent}
                                    </Link>
                                ) : (
                                    <div
                                        key={c.label}
                                        className="lux-card p-5 cursor-default opacity-60 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                    >
                                        {cardContent}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}