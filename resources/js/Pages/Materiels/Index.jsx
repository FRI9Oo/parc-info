import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ materiels, categories }) {
    const { data, setData, post, processing, reset, errors } = useForm({
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

    return (
        <AuthenticatedLayout>
            <Head title="Matériels" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
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

                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Marque / Modèle</th>
                                    <th className="py-2">N° Inventaire</th>
                                    <th className="py-2">Catégorie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materiels.map((m) => (
                                    <tr key={m.id} className="border-b">
                                        <td className="py-2">{m.nom}</td>
                                        <td className="py-2">{m.marque} / {m.modele}</td>
                                        <td className="py-2">{m.numero_inventaire}</td>
                                        <td className="py-2">{m.categorie?.nom_categorie}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}