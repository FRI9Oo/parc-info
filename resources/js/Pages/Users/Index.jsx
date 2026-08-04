import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Index({ users, roles }) {
    const changeRole = (userId, roleId) => {
        router.put(route('users.update-role', userId), {
            role_id: roleId || null,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Utilisateurs" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-xl font-semibold mb-4">Utilisateurs</h1>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Nom</th>
                                    <th className="py-2">Email</th>
                                    <th className="py-2">Rôle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b">
                                        <td className="py-2">{user.name}</td>
                                        <td className="py-2">{user.email}</td>
                                        <td className="py-2">
                                            <select
                                                value={user.role_id || ''}
                                                onChange={(e) => changeRole(user.id, e.target.value)}
                                                className="border rounded px-2 py-1"
                                            >
                                                <option value="">Aucun rôle</option>
                                                {roles.map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.nom_role}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
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