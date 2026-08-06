import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ materiels, categories }) {
    const { errors: pageErrors } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    // ---------- Filters & Search State ----------
    const [searchQuery, setSearchQuery] = useState('');
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
        setEditingId(m.id);
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

    const saveEdit = (e, id) => {
        e.preventDefault();
        editForm.put(route('materiels.update', id), {
            onSuccess: () => setEditingId(null),
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
                                className="border rounded px-3 py-2 text-sm"
                                required
                            >
                                <option value="">-- Choisir Catégorie * --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                ))}
                            </select>
                            <textarea
                                placeholder="Caractéristiques (ex: Core i7, 16GB RAM, 512GB SSD)"
                                value={data.caracteristique}
                                onChange={(e) => setData('caracteristique', e.target.value)}
                                className="border rounded px-3 py-2 text-sm md:col-span-3"
                                rows="2"
                            />
                            <div className="md:col-span-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gray-800 text-white px-5 py-2 rounded text-sm hover:bg-gray-700 transition disabled:opacity-50"
                                >
                                    Ajouter le matériel
                                </button>
                            </div>
                            {Object.keys(errors).length > 0 && (
                                <div className="md:col-span-3 text-red-600 text-xs mt-1">
                                    {Object.values(errors).map((err, i) => <p key={i}>{err}</p>)}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Card: Inventaire des matériels avec Recherche et Filtres */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h1 className="text-xl font-semibold text-gray-800">Inventaire des Matériels</h1>

                            {/* Controls Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 md:max-w-2xl">
                                {/* Search input */}
                                <input
                                    type="text"
                                    placeholder="Rechercher (Nom, S/N, Inv, Marque...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border rounded px-3 py-1.5 text-sm w-full"
                                />

                                {/* Status filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border rounded px-3 py-1.5 text-sm w-full bg-white"
                                >
                                    <option value="all">Tous les états</option>
                                    <option value="disponible">Disponibles seulement</option>
                                    <option value="affecte">Affectés seulement</option>
                                </select>

                                {/* Category filter */}
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="border rounded px-3 py-1.5 text-sm w-full bg-white"
                                >
                                    <option value="all">Toutes les catégories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Results Count Banner */}
                        {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                            <div className="mb-4 text-xs text-gray-500 flex items-center justify-between bg-gray-50 p-2 rounded">
                                <span>{filteredMateriels.length} matériel(s) trouvé(s)</span>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('all');
                                        setCategoryFilter('all');
                                    }}
                                    className="text-indigo-600 font-medium hover:underline"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-sm">
                                        <th className="py-2.5 px-3 whitespace-nowrap">Nom</th>
                                        <th className="py-2.5 px-3 whitespace-nowrap">Marque / Modèle</th>
                                        <th className="py-2.5 px-3 whitespace-nowrap">N° Série</th>
                                        <th className="py-2.5 px-3 whitespace-nowrap">N° Inventaire</th>
                                        <th className="py-2.5 px-3 whitespace-nowrap">Catégorie</th>
                                        <th className="py-2.5 px-3 whitespace-nowrap">Statut / Possession</th>
                                        <th className="py-2.5 px-3 whitespace-nowrap text-center">Historique</th>
                                        <th className="py-2.5 px-3 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredMateriels.map((m) => {
                                        if (editingId === m.id) {
                                            return (
                                                <tr key={m.id} className="border-b bg-yellow-50/50">
                                                    <td colSpan="8" className="py-3 px-3">
                                                        <form
                                                            onSubmit={(e) => saveEdit(e, m.id)}
                                                            className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs"
                                                        >
                                                            <input
                                                                value={editForm.data.nom}
                                                                onChange={(e) => editForm.setData('nom', e.target.value)}
                                                                placeholder="Nom"
                                                                className="border rounded px-2 py-1"
                                                                autoFocus
                                                            />
                                                            <input
                                                                value={editForm.data.marque}
                                                                onChange={(e) => editForm.setData('marque', e.target.value)}
                                                                placeholder="Marque"
                                                                className="border rounded px-2 py-1"
                                                            />
                                                            <input
                                                                value={editForm.data.modele}
                                                                onChange={(e) => editForm.setData('modele', e.target.value)}
                                                                placeholder="Modèle"
                                                                className="border rounded px-2 py-1"
                                                            />
                                                            <select
                                                                value={editForm.data.categorie_id}
                                                                onChange={(e) => editForm.setData('categorie_id', e.target.value)}
                                                                className="border rounded px-2 py-1 bg-white"
                                                            >
                                                                <option value="">Catégorie...</option>
                                                                {categories.map((cat) => (
                                                                    <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                                                ))}
                                                            </select>
                                                            <input
                                                                value={editForm.data.numero_serie}
                                                                onChange={(e) => editForm.setData('numero_serie', e.target.value)}
                                                                placeholder="N° Série"
                                                                className="border rounded px-2 py-1"
                                                            />
                                                            <input
                                                                value={editForm.data.numero_inventaire}
                                                                onChange={(e) => editForm.setData('numero_inventaire', e.target.value)}
                                                                placeholder="N° Inventaire"
                                                                className="border rounded px-2 py-1"
                                                            />
                                                            <input
                                                                value={editForm.data.caracteristique}
                                                                onChange={(e) => editForm.setData('caracteristique', e.target.value)}
                                                                placeholder="Caractéristiques"
                                                                className="border rounded px-2 py-1 md:col-span-2"
                                                            />

                                                            <div className="md:col-span-4 flex justify-end gap-2 pt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingId(null);
                                                                        editForm.clearErrors();
                                                                    }}
                                                                    className="text-gray-500 font-medium px-3 py-1"
                                                                >
                                                                    Annuler
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="bg-green-700 text-white px-3 py-1 rounded font-medium"
                                                                >
                                                                    Enregistrer
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return (
                                            <tr key={m.id} className="border-b hover:bg-gray-50 transition">
                                                <td className="py-2.5 px-3 font-medium text-gray-900 whitespace-nowrap">
                                                    {m.nom}
                                                    {m.caracteristique && (
                                                        <div className="text-xs text-gray-400 font-normal truncate max-w-xs">{m.caracteristique}</div>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 whitespace-nowrap">{m.marque} {m.modele}</td>
                                                <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">{m.numero_serie}</td>
                                                <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">{m.numero_inventaire}</td>
                                                <td className="py-2.5 px-3 whitespace-nowrap">{m.categorie?.nom_categorie}</td>
                                                <td className="py-2.5 px-3 whitespace-nowrap">
                                                    {m.is_disponible ? (
                                                        <span className="inline-flex items-center text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">
                                                            Disponible
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                                                            Affecté à {m.occupant}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center text-xs text-gray-500 whitespace-nowrap">
                                                    {m.affectations_count} affectation(s)
                                                </td>
                                                <td className="py-2.5 px-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => startEdit(m)}
                                                            className="text-indigo-600 font-medium text-xs hover:underline"
                                                        >
                                                            Modifier
                                                        </button>
                                                        <button
                                                            onClick={() => destroy(m.id)}
                                                            className="text-red-600 font-medium text-xs hover:underline"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
        </AuthenticatedLayout>
    );
}