import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ stats, recentAffectations }) {
    const { permissions = [], isAdmin = false } = usePage().props.auth || {};
    const hasPerm = (permission) => isAdmin || permissions.includes(permission);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const dateStr = dateString.includes('T') ? dateString.split('T')[0] : dateString;
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const cards = [
        { label: 'Directions', value: stats.directions, routeName: 'directions.index', perm: 'gerer_structure' },
        { label: 'Départements', value: stats.departements, routeName: 'departements.index', perm: 'gerer_structure' },
        { label: 'Divisions', value: stats.divisions, routeName: 'divisions.index', perm: 'gerer_structure' },
        { label: 'Services', value: stats.services, routeName: 'services.index', perm: 'gerer_structure' },
        { label: 'Employés', value: stats.employes, routeName: 'employes.index', perm: 'gerer_employes' },
        { label: 'Catégories', value: stats.categories, routeName: 'categories.index', perm: 'gerer_materiels' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Tableau de bord
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Organisation counts */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {cards.map((c) => {
                            const isAllowed = hasPerm(c.perm);
                            const cardContent = (
                                <>
                                    <div className="text-2xl font-semibold text-gray-800">{c.value}</div>
                                    <div className="text-xs text-gray-500 mt-1">{c.label}</div>
                                </>
                            );

                            return isAllowed ? (
                                <Link
                                    key={c.label}
                                    href={route(c.routeName)}
                                    className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition block"
                                >
                                    {cardContent}
                                </Link>
                            ) : (
                                <div
                                    key={c.label}
                                    className="bg-white rounded-lg shadow-sm p-4 text-center cursor-default"
                                >
                                    {cardContent}
                                </div>
                            );
                        })}
                    </div>

                    {/* Parc matériel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {hasPerm('gerer_materiels') ? (
                            <Link
                                href={route('materiels.index')}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition block"
                            >
                                <div className="text-3xl font-semibold text-gray-800">{stats.materiels}</div>
                                <div className="text-sm text-gray-500 mt-1">Matériels au total</div>
                            </Link>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="text-3xl font-semibold text-gray-800">{stats.materiels}</div>
                                <div className="text-sm text-gray-500 mt-1">Matériels au total</div>
                            </div>
                        )}

                        {hasPerm('gerer_affectations') ? (
                            <Link
                                href={route('affectations.index')}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition block"
                            >
                                <div className="text-3xl font-semibold text-green-700">{stats.affectations_actives}</div>
                                <div className="text-sm text-gray-500 mt-1">Actuellement affectés</div>
                            </Link>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="text-3xl font-semibold text-green-700">{stats.affectations_actives}</div>
                                <div className="text-sm text-gray-500 mt-1">Actuellement affectés</div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-3xl font-semibold text-gray-800">{stats.materiels_disponibles}</div>
                            <div className="text-sm text-gray-500 mt-1">Disponibles</div>
                        </div>
                    </div>

                    {/* Recent affectations */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-semibold">Affectations récentes</h1>
                            {hasPerm('gerer_affectations') && (
                                <Link href={route('affectations.index')} className="text-indigo-600 text-sm hover:underline">
                                    Voir tout
                                </Link>
                            )}
                        </div>

                        {recentAffectations.length === 0 ? (
                            <p className="text-gray-500 text-sm py-4">Aucune affectation enregistrée.</p>
                        ) : (
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b text-gray-500">
                                        <th className="py-2">Date</th>
                                        <th className="py-2">Employé</th>
                                        <th className="py-2">Matériel</th>
                                        <th className="py-2">État</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAffectations.map((a) => (
                                        <tr key={a.id} className="border-b">
                                            <td className="py-2">{formatDate(a.date_affectation)}</td>
                                            <td className="py-2">{a.employe?.nom} {a.employe?.prenom}</td>
                                            <td className="py-2">{a.materiel?.nom}</td>
                                            <td className="py-2">
                                                {a.etat === 'Clôturé' ? (
                                                    <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">Clôturé</span>
                                                ) : (
                                                    <span className="text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-medium">Affecté</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}