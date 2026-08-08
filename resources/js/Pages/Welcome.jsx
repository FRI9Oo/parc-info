import ApplicationLogo from '@/Components/ApplicationLogo';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    const { locale, setLocale, darkMode, toggleDarkMode, t } = useLanguage();

    const languages = [
        { code: 'fr', label: '🇫🇷 FR' },
        { code: 'en', label: '🇬🇧 EN' },
        { code: 'ar', label: '🇸🇦 AR' },
    ];

    return (
        <>
            <Head title="Parc Informatique — Système de Gestion Executive" />

            <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#11508f] selection:text-white relative overflow-hidden transition-colors duration-300">
                
                {/* Brand Tri-Color Top Accent Line */}
                <div className="h-1.5 w-full brand-tri-bar relative z-30"></div>

                {/* Ambient Glow Orbs in Official Brand Colors */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#11508f]/15 dark:bg-[#11508f]/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-[#57b24a]/15 dark:bg-[#57b24a]/15 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#fab61e]/15 dark:bg-[#fab61e]/10 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Sticky Navbar */}
                <header className="relative z-20 border-b border-slate-200/80 dark:border-slate-800/80 glass-nav">
                    <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-3.5 group">
                            <ApplicationLogo className="h-11 w-auto transition-transform group-hover:scale-105" />
                            <div className="flex flex-col">
                                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-[#11508f] transition font-heading">
                                    PARC INFORMATIQUE
                                </span>
                                <div className="flex items-center gap-1.5 -mt-0.5">
                                    <span className="h-2 w-2 rounded-full bg-[#11508f] shadow-sm"></span>
                                    <span className="h-2 w-2 rounded-full bg-[#57b24a] shadow-sm"></span>
                                    <span className="h-2 w-2 rounded-full bg-[#fab61e] shadow-sm"></span>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ms-1">
                                        GESTION EXECUTIVE
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <div className="flex items-center gap-3">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                title={darkMode ? t('light_mode') : t('dark_mode')}
                                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm text-xs font-bold"
                            >
                                {darkMode ? '☀️' : '🌙'}
                            </button>

                            {/* Language Selector */}
                            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLocale(lang.code)}
                                        className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition ${locale === lang.code ? 'bg-[#11508f] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>

                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="btn-zellij px-5 py-2.5 rounded-xl font-extrabold text-xs"
                                >
                                    Espace de Travail →
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="btn-zellij px-6 py-2.5 rounded-xl font-extrabold text-xs"
                                >
                                    Se Connecter →
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Showcase Section */}
                <main className="flex-1 relative z-10 flex flex-col justify-center">
                    <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24 text-center flex flex-col items-center">
                        
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-[#11508f]/20 px-4 py-1.5 rounded-full text-xs font-extrabold text-[#11508f] dark:text-blue-300 mb-6 shadow-sm">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#57b24a] animate-pulse"></span>
                            Système Opérationnel & Conforme v2.0
                        </div>

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl leading-[1.15] font-heading">
                            Gestion Executive du <span className="brand-gradient-text">Parc Informatique</span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-6 max-w-2xl font-medium leading-relaxed">
                            Traçabilité intégrale des équipements, gestion des affectations par collaborateur, alertes de renouvellement et journal d'audit sécurisé.
                        </p>

                        {/* CTA Button Group with Zellij Pattern */}
                        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="w-full sm:w-auto btn-zellij px-8 py-4 rounded-2xl font-extrabold text-sm shadow-xl"
                                >
                                    Accéder au Tableau de Bord →
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="w-full sm:w-auto btn-zellij px-8 py-4 rounded-2xl font-extrabold text-sm shadow-xl"
                                    >
                                        Connexion à l'Espace Sécurisé →
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Interactive UI Preview Showcase Card */}
                        <div className="mt-16 w-full max-w-5xl lux-card p-6 sm:p-8 shadow-2xl border border-slate-200/90 dark:border-slate-800 relative overflow-hidden group">
                            
                            {/* Card Header Strip */}
                            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <ApplicationLogo className="h-8 w-auto" />
                                    <div className="text-left">
                                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">Aperçu Executive Live</div>
                                        <div className="text-[10px] font-bold text-slate-400">Dernières données du parc en temps réel</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-full bg-[#11508f]"></span>
                                    <span className="h-3 w-3 rounded-full bg-[#57b24a]"></span>
                                    <span className="h-3 w-3 rounded-full bg-[#fab61e]"></span>
                                </div>
                            </div>

                            {/* 3 Metric Cards Showcase in Brand Colors */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                                
                                {/* Card 1: Blue */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0d3d6e] to-[#11508f] text-white shadow-lg shadow-[#11508f]/20">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-extrabold text-blue-200 uppercase tracking-wider">Inventaire Matériel</div>
                                            <div className="text-3xl font-black mt-1 font-heading">Total Équipements</div>
                                        </div>
                                        <div className="text-2xl p-2 bg-white/10 rounded-xl">💻</div>
                                    </div>
                                    <div className="mt-3 text-xs font-semibold text-blue-100">Traçabilité par S/N et Code Inventaire</div>
                                </div>

                                {/* Card 2: Green */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#3f8835] to-[#57b24a] text-white shadow-lg shadow-[#57b24a]/20">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-extrabold text-green-100 uppercase tracking-wider">Affectations Actives</div>
                                            <div className="text-3xl font-black mt-1 font-heading">Prise en Charge</div>
                                        </div>
                                        <div className="text-2xl p-2 bg-white/10 rounded-xl">📋</div>
                                    </div>
                                    <div className="mt-3 text-xs font-semibold text-green-100">Génération de fiches A4 imprimables</div>
                                </div>

                                {/* Card 3: Orange */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#d4960e] to-[#fab61e] text-slate-950 shadow-lg shadow-[#fab61e]/20">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-extrabold text-amber-950/80 uppercase tracking-wider">Stock & Sécurité</div>
                                            <div className="text-3xl font-black mt-1 font-heading">Stock Disponible</div>
                                        </div>
                                        <div className="text-2xl p-2 bg-black/10 rounded-xl">🛡️</div>
                                    </div>
                                    <div className="mt-3 text-xs font-bold text-slate-950/80">Audit continu et contrôle des rôles</div>
                                </div>
                            </div>
                        </div>

                    </section>

                    {/* Features Section */}
                    <section className="mx-auto max-w-7xl px-6 pb-24">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            <div className="lux-card p-8 border-t-4 border-t-[#11508f] text-left group">
                                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950 text-[#11508f] dark:text-blue-400 flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                    🏛️
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 font-heading">Structure Organisationnelle</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    Découpage hiérarchique complet par Directions, Départements, Divisions et Services avec rattachement direct des collaborateurs.
                                </p>
                            </div>

                            <div className="lux-card p-8 border-t-4 border-t-[#57b24a] text-left group">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-[#57b24a] flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                    💻
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 font-heading">Parc & Affectations</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    Attributions d’ordinateurs, écrans et périphériques avec gestion de restitutions, clôtures et fiches de prise en charge A4.
                                </p>
                            </div>

                            <div className="lux-card p-8 border-t-4 border-t-[#fab61e] text-left group">
                                <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950 text-[#fab61e] flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                    🛡️
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 font-heading">Sécurité & Journal d'Audit</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    Registre infalsifiable traçant l'ensemble des créations, modifications et clôtures d'affectations avec horodatage strict.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19] py-8 text-xs text-slate-500">
                    <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white font-heading">PARC INFORMATIQUE</span>
                            <span>— Système de Gestion Interne</span>
                        </div>
                        <div>
                            © {new Date().getFullYear()} Tous droits réservés.
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
