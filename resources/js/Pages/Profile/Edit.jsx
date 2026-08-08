import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { user, permissions = [], isAdmin = false } = usePage().props.auth || {};
    const { t } = useLanguage();

    const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'US';
    const avatarUrl = user?.avatar ? `/storage/${user.avatar}` : null;

    return (
        <AuthenticatedLayout>
            <Head title="Espace Profil Utilisateur" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">

                    {/* Executive User Profile Banner */}
                    <div className="relative overflow-hidden rounded-3xl lux-gradient-banner p-8 text-white shadow-xl shadow-[#11508f]/20">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                {/* Profile Avatar Image / Initial Badge */}
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={user?.name}
                                        className="h-20 w-20 rounded-2xl object-cover shadow-xl border-2 border-white/40 shrink-0"
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-2xl bg-white/15 backdrop-blur-md text-white border border-white/20 flex items-center justify-center text-3xl font-black shadow-lg shrink-0 font-heading">
                                        {userInitials}
                                    </div>
                                )}

                                <div>
                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-2 border border-white/15">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Compte Sécurisé & Actif
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
                                        {user?.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100/90 mt-1 font-medium">
                                        <span>📧 {user?.email}</span>
                                        {user?.fonction && <span>• 💼 {user.fonction}</span>}
                                        {user?.telephone && <span>• 📞 {user.telephone}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Role Badge */}
                            <div className="shrink-0 flex items-center gap-2">
                                {isAdmin ? (
                                    <span className="bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black shadow-md border border-amber-300">
                                        👑 Administrator
                                    </span>
                                ) : (
                                    <span className="bg-white/15 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-xs font-extrabold border border-white/20">
                                        👤 Utilisateur Système
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Background Orb */}
                        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    </div>

                    {/* Main Workspace Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* Left Sidebar: User Details & Bio Summary */}
                        <div className="space-y-6">
                            
                            {/* Bio Card */}
                            {user?.bio && (
                                <div className="lux-card p-6 space-y-3">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                                        Biographie Professionnelle
                                    </h3>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal italic bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        "{user.bio}"
                                    </p>
                                </div>
                            )}

                            {/* Details Summary Card */}
                            <div className="lux-card p-6 space-y-6">
                                <div>
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-4">
                                        Statut & Permissions
                                    </h3>
                                    
                                    <div className="space-y-3 text-xs">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Fonction / Poste</span>
                                            <span className="font-extrabold text-slate-900 dark:text-white">{user?.fonction || '—'}</span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Téléphone</span>
                                            <span className="font-extrabold text-slate-900 dark:text-white">{user?.telephone || '—'}</span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Rôle Système</span>
                                            <span className="font-extrabold text-slate-900 dark:text-white">{isAdmin ? 'Administrateur' : 'Utilisateurs'}</span>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-slate-500 dark:text-slate-400 font-medium">Permissions</span>
                                            <span className="font-extrabold text-[#11508f] dark:text-blue-400">{isAdmin ? 'Toutes (Full Access)' : `${permissions.length} activées`}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs space-y-1">
                                    <div className="font-bold text-[#11508f] dark:text-blue-300">💡 Conseil Sécurité</div>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        Pensez à renouveler régulièrement votre mot de passe et à ne jamais partager vos identifiants d'accès.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Main Form Cards */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Form 1: Informations Personnelles, Avatar, Bio, Fonction, Telephone */}
                            <div className="lux-card p-6 sm:p-8">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="w-full"
                                />
                            </div>

                            {/* Form 2: Mot de Passe */}
                            <div className="lux-card p-6 sm:p-8">
                                <UpdatePasswordForm className="w-full" />
                            </div>

                            {/* Form 3: Zone de Danger */}
                            <div className="lux-card p-6 sm:p-8 border-t-4 border-t-rose-500">
                                <DeleteUserForm className="w-full" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
