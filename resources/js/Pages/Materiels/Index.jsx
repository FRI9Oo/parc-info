import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ materiels, categories }) {
    const { errors: pageErrors } = usePage().props;
    const [editingId, setEditingId] = useState(null);

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
            <Head title="Matériels" />
            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    {pageErrors?.delete && (
                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded">
                            {pageErrors.delete}
                        </div>
                    )}

                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Ajouter un matériel</h1>
                        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                            <input placeholder="Nom" value={data.nom} onChange={(e) => setData('nom', e.target.value)} className="border rounded px-3 py-2" />
                            <input placeholder="Marque" value={data.marque} onChange={(e) => setData('marque', e.target.value)} className="border rounded px-3 py-2" />
                            <input placeholder="Modèle" value={data.modele} onChange={(e) => setData('modele', e.target.value)} className="border rounded px-3 py-2" />
                            <input placeholder="N° Série" value={data.numero_serie} onChange={(e) => setData('numero_serie', e.target.value)} className="border rounded px-3 py-2" />
                            <input placeholder="N° Inventaire" value={data.numero_inventaire} onChange={(e) => setData('numero_inventaire', e.target.value)} className="border rounded px-3 py-2" />
                            <select value={data.categorie_id} onChange={(e) => setData('categorie_id', e.target.value)} className="border rounded px-3 py-2">
                                <option value="">Catégorie...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                ))}
                            </select>
                            <textarea placeholder="Caractéristiques" value={data.caracteristique} onChange={(e) => setData('caracteristique', e.target.value)} className="border rounded px-3 py-2 col-span-2" />
                            <button type="submit" disabled={processing} className="bg-gray-800 text-white px-4 py-2 rounded col-span-2">
                                Ajouter
                            </button>
                            {Object.keys(errors).length > 0 && (
                                <div className="col-span-2 text-red-600 text-sm">
                                    {Object.values(errors).map((err, i) => <p key={i}>{err}</p>)}
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Matériels</h1>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-sm">
                                        <th className="py-2 px-3">Nom</th>
                                        <th className="py-2 px-3">Marque</th>
                                        <th className="py-2 px-3">Modèle</th>
                                        <th className="py-2 px-3">N° Série</th>
                                        <th className="py-2 px-3">N° Inventaire</th>
                                        <th className="py-2 px-3">Catégorie</th>
                                        <th className="py-2 px-3">Affectations</th>
                                        <th className="py-2 px-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {materiels.map((m) => {
                                        if (editingId === m.id) {
                                            return (
                                                <tr key={m.id} className="border-b hover:bg-gray-50">
                                                    <td colSpan="8" className="py-2 px-3">
                                                        <form
                                                            onSubmit={(e) => saveEdit(e, m.id)}
                                                            className="grid grid-cols-8 gap-2 items-center"
                                                        >
                                                            <div className="col-span-1">
                                                                <input
                                                                    value={editForm.data.nom}
                                                                    onChange={(e) => editForm.setData('nom', e.target.value)}
                                                                    placeholder="Nom"
                                                                    className="border rounded px-2 py-1 w-full"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <input
                                                                    value={editForm.data.marque}
                                                                    onChange={(e) => editForm.setData('marque', e.target.value)}
                                                                    placeholder="Marque"
                                                                    className="border rounded px-2 py-1 w-full"
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <input
                                                                    value={editForm.data.modele}
                                                                    onChange={(e) => editForm.setData('modele', e.target.value)}
                                                                    placeholder="Modèle"
                                                                    className="border rounded px-2 py-1 w-full"
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <input
                                                                    value={editForm.data.numero_serie}
                                                                    onChange={(e) => editForm.setData('numero_serie', e.target.value)}
                                                                    placeholder="N° Série"
                                                                    className="border rounded px-2 py-1 w-full"
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <input
                                                                    value={editForm.data.numero_inventaire}
                                                                    onChange={(e) => editForm.setData('numero_inventaire', e.target.value)}
                                                                    placeholder="N° Inventaire"
                                                                    className="border rounded px-2 py-1 w-full"
                                                                />
                                                            </div>
                                                            <div className="col-span-1">
                                                                <select
                                                                    value={editForm.data.categorie_id}
                                                                    onChange={(e) => editForm.setData('categorie_id', e.target.value)}
                                                                    className="border rounded px-2 py-1 w-full"
                                                                >
                                                                    <option value="">Catégorie...</option>
                                                                    {categories.map((cat) => (
                                                                        <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="col-span-1 text-center text-gray-400">
                                                                {m.affectations_count || 0}
                                                            </div>
                                                            <div className="col-span-1">
                                                                <div className="flex gap-2 items-center">
                                                                    <button type="submit" className="text-green-700 text-sm font-medium">
                                                                        💾
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setEditingId(null);
                                                                            editForm.clearErrors();
                                                                        }}
                                                                        className="text-gray-500 text-sm"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                                {Object.keys(editForm.errors).length > 0 && (
                                                                    <div className="text-red-600 text-xs mt-1">
                                                                        {Object.values(editForm.errors).map((err, i) => <p key={i}>{err}</p>)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </form>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                        
                                        return (
                                            <tr key={m.id} className="border-b hover:bg-gray-50">
                                                <td className="py-2 px-3">{m.nom}</td>
                                                <td className="py-2 px-3">{m.marque}</td>
                                                <td className="py-2 px-3">{m.modele}</td>
                                                <td className="py-2 px-3">{m.numero_serie}</td>
                                                <td className="py-2 px-3">{m.numero_inventaire}</td>
                                                <td className="py-2 px-3">{m.categorie?.nom_categorie}</td>
                                                <td className="py-2 px-3 text-center">{m.affectations_count}</td>
                                                <td className="py-2 px-3">
                                                    <div className="flex gap-3">
                                                        <button onClick={() => startEdit(m)} className="text-indigo-600 text-sm">Modifier</button>
                                                        <button onClick={() => destroy(m.id)} className="text-red-600 text-sm">Supprimer</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}