import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ directions }) {
    return (
        <AuthenticatedLayout>
            <Head title="Directions" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Directions</h1>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Départements</th>
                                </tr>
                            </thead>
                            <tbody>
                                {directions.map((direction) => (
                                    <tr key={direction.id} className="border-b">
                                        <td className="py-2">{direction.nom_direction}</td>
                                        <td className="py-2">{direction.departements_count}</td>
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