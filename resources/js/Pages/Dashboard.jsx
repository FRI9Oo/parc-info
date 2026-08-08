import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ stats, recentAffectations = [], longStandingAffectations = [] }) {
    const { user, permissions = [], isAdmin = false } = usePage().props.auth || {};
    const { t } = useLanguage();

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

    const cards = [
        { label: t('directions'), value: stats.directions, routeName: 'directions.index', canAccess: hasPerm('voir_structure', 'gerer_structure'), icon: '🏛️' },
        { label: t('departements'), value: stats.departements, routeName: 'departements.index', canAccess: hasPerm('voir_structure', 'gerer_structure'), icon: '🏢' },
        { label: t('divisions'), value: stats.divisions, routeName: 'divisions.index', canAccess: hasPerm('voir_structure', 'gerer_structure'), icon: '📂' },
        { label: t('services'), value: stats.services, routeName: 'services.index', canAccess: hasPerm('voir_structure', 'gerer_structure'), icon: '⚙️' },
        { label: t('employes'), value: stats.employes, routeName: 'employes.index', canAccess: hasPerm('voir_employes', 'gerer_employes'), icon: '👥' },
        { label: t('categories'), value: stats.categories, routeName: 'categories.index', canAccess: hasPerm('voir_materiels', 'gerer_materiels'), icon: '🏷️' },
    ];

    const canViewMateriels = hasPerm('voir_materiels', 'gerer_materiels');
    const canViewAffectations = hasPerm('voir_affectations', 'gerer_affectations');

    const totalHardware = stats.materiels || 1;
    const affectePercent = Math.round((stats.affectations_actives / totalHardware) * 100) || 0;
    const disponiblePercent = Math.round((stats.materiels_disponibles / totalHardware) * 100) || 0;

    return (
        <AuthenticatedLayout>
            <Head title={t('welcome_title')} />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">

                    {/* Executive Hero Banner */}
                    <div className="relative overflow-hidden rounded-3xl bg-[url('/images/bg-pattern.jpg')] bg-cover bg-center p-8 text-white shadow-2xl shadow-[#11508f]/30 border border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d3d6e]/90 via-[#11508f]/85 to-[#1562ae]/80 backdrop-blur-[1px]"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-3 border border-white/15">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {t('system_status')}
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    {t('greeting')}, {user?.name || 'Administrateur'} 👋
                                </h1>
                                <p className="text-sm text-blue-100/90 mt-1 max-w-2xl font-normal leading-relaxed">
                                    Vue d'ensemble en temps réel de votre parc informatique, des équipements attribués et des indicateurs de gestion.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {canViewAffectations && (
                                    <Link
                                        href={route('affectations.index')}
                                        className="btn-zellij px-5 py-2.5 rounded-xl font-extrabold text-xs"
                                    >
                                        + Nouvelle Affectation
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Decorative background orb */}
                        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    </div>

                    {/* Alert Banner for Long-Standing Affectations */}
                    {canViewAffectations && longStandingAffectations.length > 0 && (
                        <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 shadow-lg shadow-amber-500/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shrink-0 text-xl font-bold">
                                        ⚠️
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300">
                                            Alerte Suivi : {longStandingAffectations.length} matériel(s) affecté(s) depuis plus de 6 mois
                                        </h3>
                                        <p className="text-xs text-amber-800/90 dark:text-amber-400 mt-0.5 font-medium">
                                            Équipements en détention prolongée. Veuillez effectuer un contrôle physique ou renouveler la prise en charge.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={route('affectations.index', { filter: 'prolonge', fromAlert: 'true' })}
                                    className="btn-zellij-orange px-5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap text-center shrink-0"
                                >
                                    Consulter la liste complète →
                                </Link>
                            </div>

                            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                                {longStandingAffectations.slice(0, 3).map((item) => (
                                    <Link
                                        key={item.id}
                                        href={route('affectations.index', { filter: 'prolonge', highlight: item.id, fromAlert: 'true' })}
                                        className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs hover:border-amber-400 transition block group"
                                    >
                                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-amber-700 transition">{item.materiel_nom}</div>
                                        <div className="text-slate-500 dark:text-slate-400 mt-1">S/N: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{item.materiel_serie}</span></div>
                                        <div className="text-slate-600 dark:text-slate-400 mt-0.5">Bénéficiaire: <span className="font-semibold text-slate-900 dark:text-slate-200">{item.employe_nom}</span></div>
                                        <div className="text-amber-700 dark:text-amber-400 font-bold mt-2 pt-2 border-t border-amber-100 dark:border-amber-950 flex items-center justify-between">
                                            <span>Affecté le {formatDate(item.date_affectation)}</span>
                                            <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded font-extrabold">{item.duration_months} mois</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Organisation Counts Grid */}
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 px-1">{t('structure')}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {cards.map((c) => {
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

                    {/* Parc Hardware Overview Cards */}
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3 px-1">{t('parc_materiel')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: Total Hardware (Blue #11508f) */}
                            {canViewMateriels ? (
                                <Link
                                    href={route('materiels.index')}
                                    className="relative overflow-hidden bg-gradient-to-br from-[#0d3d6e] via-[#11508f] to-[#1d6fc2] text-white p-6 rounded-2xl shadow-xl shadow-[#11508f]/25 block group hover:scale-[1.02] transition-all"
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-200">{t('total_hardware')}</div>
                                            <div className="text-4xl font-black mt-1 text-white font-heading">{stats.materiels}</div>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold shadow-md border border-white/20">
                                            💻
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs font-semibold text-blue-100/90 relative z-10 flex items-center gap-1">
                                        <span>Consulter l'inventaire complet →</span>
                                    </div>
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                                </Link>
                            ) : (
                                <div className="relative overflow-hidden bg-gradient-to-br from-[#0d3d6e] via-[#11508f] to-[#1d6fc2] text-white p-6 rounded-2xl shadow-xl shadow-[#11508f]/25">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-200">{t('total_hardware')}</div>
                                            <div className="text-4xl font-black mt-1 text-white font-heading">{stats.materiels}</div>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold shadow-md border border-white/20">
                                            💻
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Card 2: Active Affectations (Green #57b24a) */}
                            {canViewAffectations ? (
                                <Link
                                    href={route('affectations.index')}
                                    className="relative overflow-hidden bg-gradient-to-br from-[#3f8835] via-[#57b24a] to-[#6bc45f] text-white p-6 rounded-2xl shadow-xl shadow-[#57b24a]/25 block group hover:scale-[1.02] transition-all"
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-green-100">{t('assigned')}</div>
                                            <div className="text-4xl font-black mt-1 text-white font-heading">{stats.affectations_actives}</div>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold shadow-md border border-white/20">
                                            📋
                                        </div>
                                    </div>
                                    <div className="mt-4 relative z-10">
                                        <div className="flex justify-between text-xs font-bold text-green-100 mb-1">
                                            <span>Taux d'affectation</span>
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
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-green-100">{t('assigned')}</div>
                                            <div className="text-4xl font-black mt-1 text-white font-heading">{stats.affectations_actives}</div>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xl font-bold shadow-md border border-white/20">
                                            📋
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Card 3: Available Stock (Orange #fab61e) */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-[#d4960e] via-[#fab61e] to-[#fbc848] text-slate-950 p-6 rounded-2xl shadow-xl shadow-[#fab61e]/25">
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="text-xs font-extrabold uppercase tracking-wider text-amber-950/80">{t('available')}</div>
                                        <div className="text-4xl font-black mt-1 text-slate-950 font-heading">{stats.materiels_disponibles}</div>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-black/10 backdrop-blur-md text-slate-950 flex items-center justify-center text-xl font-bold shadow-md border border-black/10">
                                        📦
                                    </div>
                                </div>
                                <div className="mt-4 relative z-10">
                                    <div className="flex justify-between text-xs font-bold text-slate-950/80 mb-1">
                                        <span>Stock disponible</span>
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

                    {/* Recent Affectations Table */}
                    <div className="lux-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Affectations Récentes</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dernières opérations d’attribution enregistrées</p>
                            </div>
                            {canViewAffectations && (
                                <Link
                                    href={route('affectations.index')}
                                    className="text-xs font-bold text-[#11508f] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-2 rounded-xl transition"
                                >
                                    Voir toutes les affectations →
                                </Link>
                            )}
                        </div>

                        {recentAffectations.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-8">Aucune affectation récente.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Employé</th>
                                            <th className="py-3 px-4">Matériel</th>
                                            <th className="py-3 px-4 text-right">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                                        {recentAffectations.map((a) => (
                                            <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                                                <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {formatDate(a.date_affectation)}
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                    {a.employe ? `${a.employe.nom} ${a.employe.prenom}` : '—'}
                                                </td>
                                                <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                    {a.materiel?.nom}
                                                </td>
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    {a.etat === 'Clôturé' ? (
                                                        <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                            Clôturé
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 me-1.5 animate-pulse"></span>
                                                            En possession
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

                </div>
            </div>
        </AuthenticatedLayout>
    );
}