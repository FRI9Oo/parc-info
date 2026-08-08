import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ materiels, categories }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;

    const canCreate = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('creer_materiel');
    const canEdit = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('modifier_materiel');
    const canDelete = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('supprimer_materiel');
    const hasAnyAction = canEdit || canDelete;

    const [editingMateriel, setEditingMateriel] = useState(null);

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const initialSearch = urlParams.get('search') || '';

    // ---------- Filters & Search State ----------
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'disponible', 'affecte'
    const [categoryFilter, setCategoryFilter] = useState('all');

    // ---------- Computed Filtered List ----------
    const filteredMateriels = useMemo(() => {
        return materiels.filter((m) => {
            // Status filter
            if (statusFilter === 'disponible' && !m.is_disponible) return false;
            if (statusFilter === 'affecte' && m.is_disponible) return false;

            // Category filter
            if (categoryFilter !== 'all' && String(m.categorie_id) !== String(categoryFilter)) return false;

            // Text search
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchNom = m.nom?.toLowerCase().includes(q);
                const matchMarque = m.marque?.toLowerCase().includes(q);
                const matchModele = m.modele?.toLowerCase().includes(q);
                const matchSerie = m.numero_serie?.toLowerCase().includes(q);
                const matchInv = m.numero_inventaire?.toLowerCase().includes(q);
                const matchCat = m.categorie?.nom_categorie?.toLowerCase().includes(q);
                const matchOccupant = m.occupant?.toLowerCase().includes(q);

                return matchNom || matchMarque || matchModele || matchSerie || matchInv || matchCat || matchOccupant;
            }

            return true;
        });
    }, [materiels, searchQuery, statusFilter, categoryFilter]);

    // KPI metrics
    const totalCount = materiels.length;
    const disponibleCount = useMemo(() => materiels.filter((m) => m.is_disponible).length, [materiels]);
    const affecteCount = totalCount - disponibleCount;

    // ---------- Forms ----------
    const { data, setData, post, processing, reset, errors } = useForm({
        nom: '',
        marque: '',
        modele: '',
        numero_serie: '',
        numero_inventaire: '',
        caracteristique: '',
        categorie_id: '',
    });

    const editForm = useForm({
        nom: '',
        marque: '',
        modele: '',
        numero_serie: '',
        numero_inventaire: '',
        caracteristique: '',
        categorie_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('materiels.store'), { onSuccess: () => reset() });
    };

    const startEdit = (m) => {
        setEditingMateriel(m);
        editForm.setData({
            nom: m.nom,
            marque: m.marque,
            modele: m.modele,
            numero_serie: m.numero_serie,
            numero_inventaire: m.numero_inventaire,
            caracteristique: m.caracteristique || '',
            categorie_id: m.categorie_id,
        });
        editForm.clearErrors();
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingMateriel) return;
        editForm.put(route('materiels.update', editingMateriel.id), {
            onSuccess: () => setEditingMateriel(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer ce matériel ?')) {
            router.delete(route('materiels.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Matériels" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {pageErrors?.delete && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded shadow-sm">
                            {pageErrors.delete}
                        </div>
                    )}

                    {/* KPI Header Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
                            <div className="text-xs text-gray-500 mt-1">Total des Matériels</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-2xl font-bold text-green-600">{disponibleCount}</div>
                            <div className="text-xs text-gray-500 mt-1">Disponibles en stock</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="text-2xl font-bold text-blue-600">{affecteCount}</div>
                            <div className="text-xs text-gray-500 mt-1">Actuellement affectés</div>
                        </div>
                    </div>

                    {/* Card: Ajouter un matériel */}
                    {canCreate && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <h1 className="text-xl font-semibold mb-4 text-gray-800">Ajouter un matériel</h1>
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    placeholder="Nom du matériel *"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                <input
                                    placeholder="Marque *"
                                    value={data.marque}
                                    onChange={(e) => setData('marque', e.target.value)}
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                <input
                                    placeholder="Modèle *"
                                    value={data.modele}
                                    onChange={(e) => setData('modele', e.target.value)}
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
                                    required
                                />

                                <input
                                    placeholder="N° Série *"
                                    value={data.numero_serie}
                                    onChange={(e) => setData('numero_serie', e.target.value)}
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                <input
                                    placeholder="N° Inventaire *"
                                    value={data.numero_inventaire}
                                    onChange={(e) => setData('numero_inventaire', e.target.value)}
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                <select
                                    value={data.categorie_id}
                                    onChange={(e) => setData('categorie_id', e.target.value)}
                                    className="border rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-gray-800"
                                    required
                                >
                                    <option value="">-- Choisir Catégorie * --</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nom_categorie}
                                        </option>
                                    ))}
                                </select>

                                <div className="md:col-span-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#11508f] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#0d3d6e] transition disabled:opacity-50"
                                    >
                                        Enregistrer le matériel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Card: Inventaire des matériels avec Recherche et Filtres */}
                    <div className="lux-card p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Inventaire des Matériels</h1>
                                <a
                                    href={route('exports.materiels.csv')}
                                    className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10"
                                >
                                    📥 Exporter CSV
                                </a>
                            </div>

                            {/* Controls Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 md:max-w-2xl">
                                <input
                                    type="text"
                                    placeholder="Rechercher (Nom, S/N, Inv, Marque...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f] bg-slate-50/50"
                                />

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                >
                                    <option value="all">Tous les états</option>
                                    <option value="disponible">Disponibles seulement</option>
                                    <option value="affecte">Affectés seulement</option>
                                </select>

                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                >
                                    <option value="all">Toutes les catégories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                            <div className="mb-4 text-xs font-semibold text-slate-500 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span>{filteredMateriels.length} matériel(s) trouvé(s)</span>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('all');
                                        setCategoryFilter('all');
                                    }}
                                    className="text-[#11508f] font-bold hover:underline"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50/70 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-3 whitespace-nowrap">Nom</th>
                                        <th className="py-3 px-3 whitespace-nowrap">Marque / Modèle</th>
                                        <th className="py-3 px-3 whitespace-nowrap">N° Série</th>
                                        <th className="py-3 px-3 whitespace-nowrap">N° Inventaire</th>
                                        <th className="py-3 px-3 whitespace-nowrap">Catégorie</th>
                                        <th className="py-3 px-3 whitespace-nowrap">Statut / Possession</th>
                                        <th className="py-3 px-3 whitespace-nowrap text-center">Historique</th>
                                        {hasAnyAction && <th className="py-3 px-3 whitespace-nowrap">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {filteredMateriels.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                                                {m.nom}
                                                {m.caracteristique && (
                                                    <div className="text-xs text-slate-400 font-normal truncate max-w-xs">{m.caracteristique}</div>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">{m.marque} {m.modele}</td>
                                            <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">{m.numero_serie}</td>
                                            <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-800 whitespace-nowrap">{m.numero_inventaire}</td>
                                            <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">{m.categorie?.nom_categorie}</td>
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                {m.is_disponible ? (
                                                    <span className="inline-flex items-center text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 me-1.5"></span>
                                                        Disponible
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs font-bold bg-blue-50 text-[#11508f] border border-blue-200 px-2.5 py-1 rounded-lg">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#11508f] me-1.5 animate-pulse"></span>
                                                        Affecté à {m.occupant}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-center text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                {m.affectations_count} affectation(s)
                                            </td>
                                            {hasAnyAction && (
                                                <td className="py-3 px-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => startEdit(m)}
                                                                title="Modifier le matériel"
                                                                className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => destroy(m.id)}
                                                                title="Supprimer le matériel"
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

                            {filteredMateriels.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-8">
                                    Aucun matériel ne correspond aux critères de recherche.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Modification d'un Matériel */}
            <Modal show={editingMateriel !== null} onClose={() => setEditingMateriel(null)} maxWidth="lg">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                        Modifier le matériel : {editingMateriel?.nom}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du matériel *</label>
                            <input
                                type="text"
                                value={editForm.data.nom}
                                onChange={(e) => editForm.setData('nom', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                            {editForm.errors.nom && <p className="text-red-600 text-xs mt-1">{editForm.errors.nom}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie *</label>
                            <select
                                value={editForm.data.categorie_id}
                                onChange={(e) => editForm.setData('categorie_id', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                required
                            >
                                <option value="">Choisir Catégorie...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Marque *</label>
                            <input
                                type="text"
                                value={editForm.data.marque}
                                onChange={(e) => editForm.setData('marque', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Modèle *</label>
                            <input
                                type="text"
                                value={editForm.data.modele}
                                onChange={(e) => editForm.setData('modele', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">N° Série *</label>
                            <input
                                type="text"
                                value={editForm.data.numero_serie}
                                onChange={(e) => editForm.setData('numero_serie', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">N° Inventaire *</label>
                            <input
                                type="text"
                                value={editForm.data.numero_inventaire}
                                onChange={(e) => editForm.setData('numero_inventaire', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Caractéristiques</label>
                            <textarea
                                value={editForm.data.caracteristique}
                                onChange={(e) => editForm.setData('caracteristique', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                rows="2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setEditingMateriel(null)}
                            className="text-slate-600 text-sm font-medium px-4 py-2 hover:text-slate-900"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="bg-[#11508f] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0d3d6e] transition disabled:opacity-50"
                        >
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}