import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ roles, permissions = [] }) {
    const { errors: pageErrors } = usePage().props;
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    // ---------- Pagination ----------
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: paginatedRoles,
    } = usePagination(roles, 10);

    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        nom_role: '',
        description_role: '',
        permission_ids: [],
    });

    // Group preset permissions by Big Permission Modules
    const groupedPermissions = useMemo(() => {
        const groups = {};
        permissions.forEach((p) => {
            const moduleName = p.module || 'Général';
            if (!groups[moduleName]) {
                groups[moduleName] = [];
            }
            groups[moduleName].push(p);
        });
        return groups;
    }, [permissions]);

    const openAdd = () => {
        setEditingRole(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setData({
            nom_role: role.nom_role,
            description_role: role.description_role || '',
            permission_ids: role.permissions.map((p) => p.id),
        });
        clearErrors();
        setShowModal(true);
    };

    const togglePermission = (id) => {
        setData(
            'permission_ids',
            data.permission_ids.includes(id)
                ? data.permission_ids.filter((p) => p !== id)
                : [...data.permission_ids, id]
        );
    };

    // Toggle entire Big Permission module (Select / Deselect all child permissions)
    const toggleModule = (modulePermissions) => {
        const moduleIds = modulePermissions.map((p) => p.id);
        const allChecked = moduleIds.every((id) => data.permission_ids.includes(id));

        if (allChecked) {
            // Deselect all in module
            setData(
                'permission_ids',
                data.permission_ids.filter((id) => !moduleIds.includes(id))
            );
        } else {
            // Select all in module
            const uniqueIds = Array.from(new Set([...data.permission_ids, ...moduleIds]));
            setData('permission_ids', uniqueIds);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingRole) {
            put(route('roles.update', editingRole.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('roles.store'), {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const destroy = (id) => {
        if (confirm('Supprimer ce rôle ?')) {
            router.delete(route('roles.destroy', id));
        }
    };

    const moduleBadgeColor = (moduleName) => {
        switch (moduleName) {
            case 'Affectations':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Matériels':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Employés':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Structure':
            case 'Structure (Global)':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Directions':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'Départements':
                return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'Divisions':
                return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'Services':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('roles_title')} />
            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {pageErrors?.delete && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                            {pageErrors.delete}
                        </div>
                    )}

                    <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">{t('roles_title')}</h1>
                            <p className="text-sm text-slate-500 mt-1">{t('roles_definition')}</p>
                        </div>
                        <button
                            onClick={openAdd}
                            className="bg-[#11508f] text-white px-4 py-2.5 rounded-lg hover:bg-[#0d3d6e] transition font-medium text-sm shadow-sm flex items-center gap-2"
                        >
                            + {t('roles_add_new')}
                        </button>
                    </div>

                    {/* Tableau des Rôles */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-slate-200 p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-4">{t('roles_name')}</th>
                                        <th className="py-3 px-4">{t('roles_description')}</th>
                                        <th className="py-3 px-4">{t('roles_permissions')}</th>
                                        <th className="py-3 px-4 text-center">{t('users')}</th>
                                        <th className="py-3 px-4 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {paginatedRoles.map((role) => {
                                        const rolePermIds = role.permissions.map((p) => p.id);
                                        return (
                                            <tr key={role.id} className="hover:bg-slate-50/80 transition align-top">
                                                <td className="py-4 px-4 font-semibold text-slate-900">{role.nom_role}</td>
                                                <td className="py-4 px-4 text-slate-600 text-xs max-w-xs">{role.description_role || '—'}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {role.permissions.length === 0 && (
                                                            <span className="text-slate-400 text-xs italic">{t('no_permissions')}</span>
                                                        )}
                                                        {Object.entries(groupedPermissions).map(([modName, modPerms]) => {
                                                            const count = modPerms.filter((p) => rolePermIds.includes(p.id)).length;
                                                            if (count === 0) return null;
                                                            return (
                                                                <span
                                                                    key={modName}
                                                                    className={`text-xs px-2.5 py-1 rounded-md font-medium border ${moduleBadgeColor(modName)}`}
                                                                >
                                                                    {modName} ({count}/{modPerms.length})
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center font-medium text-slate-700">
                                                    <span className="bg-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                        {role.users_count}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end items-center gap-1.5">
                                                        <button
                                                            onClick={() => openEdit(role)}
                                                            title={t('edit')}
                                                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                        >
                                                            ✏️
                                                        </button>
                                                        {role.nom_role !== 'Administrateur' && (
                                                            <button
                                                                onClick={() => destroy(role.id)}
                                                                title={t('delete')}
                                                                className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
                </div>
            </div>

            {/* Modal de Configuration du Rôle & Permissions Preset */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <form onSubmit={submit} className="p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                    <div className="border-b pb-3">
                        <h2 className="text-lg font-bold text-slate-800">
                            {editingRole ? t('roles_edit', { name: editingRole.nom_role }) : t('roles_add_new')}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t('roles_name')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                placeholder="ex: Gestionnaire Parc, Consultant..."
                                value={data.nom_role}
                                onChange={(e) => {
                                    setData('nom_role', e.target.value);
                                    if (errors.nom_role) clearErrors('nom_role');
                                }}
                                className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                    errors.nom_role ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                }`}
                                required
                            />
                            {errors.nom_role && <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1"><span>⚠️</span> {errors.nom_role}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t('roles_description')}</label>
                            <input
                                type="text"
                                placeholder="Description succincte de la responsabilité..."
                                value={data.description_role}
                                onChange={(e) => {
                                    setData('description_role', e.target.value);
                                    if (errors.description_role) clearErrors('description_role');
                                }}
                                className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm w-full focus:ring-2 focus:ring-[#11508f]"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t('roles_permissions')}</h3>
                            <span className="text-xs text-slate-500">
                                {data.permission_ids.length} / {permissions.length} {t('selected')}
                            </span>
                        </div>

                        {/* List of Big Permission Modules */}
                        <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([modName, modPerms]) => {
                                const modIds = modPerms.map((p) => p.id);
                                const checkedCount = modIds.filter((id) => data.permission_ids.includes(id)).length;
                                const isAllChecked = checkedCount === modIds.length && modIds.length > 0;
                                const isSomeChecked = checkedCount > 0 && !isAllChecked;

                                return (
                                    <div
                                        key={modName}
                                        className="border rounded-xl bg-slate-50/50 overflow-hidden border-slate-200"
                                    >
                                        {/* Big Permission Header */}
                                        <div className="bg-slate-100/80 px-4 py-3 border-b flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllChecked}
                                                    ref={(el) => el && (el.indeterminate = isSomeChecked)}
                                                    onChange={() => toggleModule(modPerms)}
                                                    className="rounded border-slate-300 text-[#11508f] focus:ring-[#11508f] h-4 w-4"
                                                />
                                                <span>Module : {modName}</span>
                                            </label>
                                            <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                {checkedCount} / {modPerms.length}
                                            </span>
                                        </div>

                                        {/* Little Permissions Grid */}
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                                            {modPerms.map((p) => {
                                                const isChecked = data.permission_ids.includes(p.id);
                                                return (
                                                    <label
                                                        key={p.id}
                                                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                                                            isChecked
                                                                ? 'bg-blue-50/40 border-blue-200 text-slate-900'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => togglePermission(p.id)}
                                                            className="rounded border-slate-300 text-[#11508f] focus:ring-[#11508f] mt-0.5"
                                                        />
                                                        <div className="space-y-0.5">
                                                            <div className="font-semibold text-slate-800">
                                                                {p.libelle || p.nom_permission}
                                                            </div>
                                                            {p.description_permission && (
                                                                <div className="text-[11px] text-slate-500 leading-tight">
                                                                    {p.description_permission}
                                                                </div>
                                                            )}
                                                            <div className="pt-0.5">
                                                                <code className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                                                    {p.nom_permission}
                                                                </code>
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="text-slate-600 text-sm font-medium px-4 py-2 hover:text-slate-900"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-[#11508f] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0d3d6e] transition disabled:opacity-50"
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}