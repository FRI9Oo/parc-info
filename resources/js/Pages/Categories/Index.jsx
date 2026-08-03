import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ categories }) {
    const { data, setData, post, processing, reset } = useForm({
        nom_categorie: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('categories.store'), { onSuccess: () => reset() });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Catégories" />
            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                        <h1 className="text-xl font-semibold mb-4">Ajouter une catégorie</h1>
                        <form onSubmit={submit} className="flex gap-3">
                            <input
                                type="text"
                                value={data.nom_categorie}
                                onChange={(e) => setData('nom_categorie', e.target.value)}
                                placeholder="Nom de la catégorie"
                                className="border rounded px-3 py-2 flex-1"
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gray-800 text-white px-4 py-2 rounded"
                            >
                                Ajouter
                            </button>
                        </form>
                    </div>

                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Matériels</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="border-b">
                                        <td className="py-2">{cat.nom_categorie}</td>
                                        <td className="py-2">{cat.materiels_count}</td>
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