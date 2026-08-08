import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useLanguage } from '@/Context/LanguageContext';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { user, permissions = [], isAdmin = false } = usePage().props.auth || {};
    const { locale, setLocale, darkMode, toggleDarkMode, t } = useLanguage();

    const hasPerm = (permission) => isAdmin || permissions.includes(permission);

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Active state helpers
    const isDashboardActive = route().current('dashboard');
    const isStructureActive = route().current('directions.index') || route().current('departements.index') || route().current('divisions.index') || route().current('services.index') || route().current('employes.index');
    const isMaterielsActive = route().current('materiels.index') || route().current('categories.index') || route().current('affectations.index');
    const isAdminActive = route().current('audit-logs.index') || route().current('roles.index') || route().current('users.index');

    const languages = [
        { code: 'fr', label: '🇫🇷 Français' },
        { code: 'en', label: '🇬🇧 English' },
        { code: 'ar', label: '🇸🇦 العربية' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
            
            {/* Sticky Navigation Header */}
            <nav className="sticky top-0 z-50 glass-nav shadow-md border-b border-slate-200/80 dark:border-slate-800/80">
                {/* Brand Color Palette Tri-Bar Accent */}
                <div className="h-1.5 w-full brand-tri-bar"></div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center gap-4">
                        
                        {/* Left Group: Brand Logo & Navigation */}
                        <div className="flex items-center gap-6">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-3 shrink-0 group">
                                <ApplicationLogo className="h-9 w-auto transition-transform group-hover:scale-105" />
                                <div className="hidden lg:flex flex-col">
                                    <span className="font-extrabold text-base tracking-tight text-[#11508f] dark:text-white transition font-heading">
                                        PARC INFORMATIQUE
                                    </span>
                                    <div className="flex items-center gap-1.5 -mt-0.5">
                                        <span className="h-2 w-2 rounded-full bg-[#11508f] shadow-sm"></span>
                                        <span className="h-2 w-2 rounded-full bg-[#57b24a] shadow-sm"></span>
                                        <span className="h-2 w-2 rounded-full bg-[#fab61e] shadow-sm"></span>
                                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest ms-1">
                                            GESTION EXECUTIVE
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            {/* Desktop Nav Items */}
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    href={route('dashboard')}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                                        isDashboardActive
                                            ? 'bg-[#11508f] text-white shadow-md shadow-[#11508f]/30 scale-105'
                                            : 'text-slate-700 dark:text-slate-200 hover:text-[#11508f] hover:bg-blue-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span>📊</span>
                                    <span>{t('dashboard')}</span>
                                </Link>

                                {(hasPerm('gerer_structure') || hasPerm('voir_structure') || hasPerm('voir_employes')) && (
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                                                    isStructureActive
                                                        ? 'bg-[#11508f] text-white shadow-md shadow-[#11508f]/30 scale-105'
                                                        : 'text-slate-700 dark:text-slate-200 hover:text-[#11508f] hover:bg-blue-50 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <span>🏛️</span>
                                                <span>{t('structure')}</span>
                                                <span className="text-[10px] opacity-80">▾</span>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" width="48">
                                            <Dropdown.Link href={route('directions.index')}>{t('directions')}</Dropdown.Link>
                                            <Dropdown.Link href={route('departements.index')}>{t('departements')}</Dropdown.Link>
                                            <Dropdown.Link href={route('divisions.index')}>{t('divisions')}</Dropdown.Link>
                                            <Dropdown.Link href={route('services.index')}>{t('services')}</Dropdown.Link>
                                            {(hasPerm('gerer_employes') || hasPerm('voir_employes')) && (
                                                <Dropdown.Link href={route('employes.index')}>{t('employes')}</Dropdown.Link>
                                            )}
                                        </Dropdown.Content>
                                    </Dropdown>
                                )}

                                {(hasPerm('gerer_materiels') || hasPerm('voir_materiels') || hasPerm('voir_affectations')) && (
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                                                    isMaterielsActive
                                                        ? 'bg-[#57b24a] text-white shadow-md shadow-[#57b24a]/30 scale-105'
                                                        : 'text-slate-700 dark:text-slate-200 hover:text-[#57b24a] hover:bg-emerald-50 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <span>💻</span>
                                                <span>{t('parc_materiel')}</span>
                                                <span className="text-[10px] opacity-80">▾</span>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" width="48">
                                            <Dropdown.Link href={route('materiels.index')}>{t('materiels')}</Dropdown.Link>
                                            <Dropdown.Link href={route('categories.index')}>{t('categories')}</Dropdown.Link>
                                            {(hasPerm('gerer_affectations') || hasPerm('voir_affectations')) && (
                                                <Dropdown.Link href={route('affectations.index')}>{t('affectations')}</Dropdown.Link>
                                            )}
                                        </Dropdown.Content>
                                    </Dropdown>
                                )}

                                {(hasPerm('voir_audit_logs') || isAdmin) && (
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all ${
                                                    isAdminActive
                                                        ? 'bg-[#fab61e] text-slate-950 shadow-md shadow-[#fab61e]/30 scale-105'
                                                        : 'text-slate-700 dark:text-slate-200 hover:text-[#fab61e] hover:bg-amber-50 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <span>🛡️</span>
                                                <span>{t('administration')}</span>
                                                <span className="text-[10px] opacity-80">▾</span>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="left" width="48">
                                            {hasPerm('voir_audit_logs') && (
                                                <Dropdown.Link href={route('audit-logs.index')}>{t('journal_audit')}</Dropdown.Link>
                                            )}
                                            {isAdmin && (
                                                <>
                                                    <Dropdown.Link href={route('roles.index')}>{t('roles')}</Dropdown.Link>
                                                    <Dropdown.Link href={route('users.index')}>{t('utilisateurs')}</Dropdown.Link>
                                                </>
                                            )}
                                        </Dropdown.Content>
                                    </Dropdown>
                                )}
                            </div>
                        </div>

                        {/* Right Group: Dark Mode, Language & Profile */}
                        <div className="flex items-center gap-2.5">

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                title={darkMode ? t('light_mode') : t('dark_mode')}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm text-xs font-bold"
                            >
                                {darkMode ? '☀️' : '🌙'}
                            </button>

                            {/* Language Selector */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
                                    >
                                        <span>{locale === 'fr' ? '🇫🇷 FR' : locale === 'en' ? '🇬🇧 EN' : '🇸🇦 AR'}</span>
                                        <span className="text-[9px] text-slate-400">▾</span>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right" width="36">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setLocale(lang.code)}
                                            className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between transition ${locale === lang.code ? 'text-[#11508f] bg-blue-50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            <span>{lang.label}</span>
                                            {locale === lang.code && <span>✓</span>}
                                        </button>
                                    ))}
                                </Dropdown.Content>
                            </Dropdown>

                            {/* User Profile */}
                            <div className="hidden sm:flex sm:items-center">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none shadow-sm"
                                        >
                                            {user?.avatar ? (
                                                <img src={`/storage/${user.avatar}`} alt={user.name} className="h-6 w-6 rounded-lg object-cover" />
                                            ) : (
                                                <div className="h-6 w-6 rounded-lg bg-[#11508f] text-white flex items-center justify-center text-[10px] font-extrabold uppercase">
                                                    {user?.name ? user.name.slice(0, 2) : 'US'}
                                                </div>
                                            )}
                                            <span>{user?.name}</span>
                                            <span className="text-[9px] text-slate-400">▾</span>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right" width="48">
                                        <Dropdown.Link href={route('profile.edit')}>{t('my_profile')}</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">{t('logout')}</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Mobile Hamburger Button */}
                            <div className="flex items-center md:hidden">
                                <button
                                    onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                    className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 focus:outline-none border border-slate-200 dark:border-slate-800"
                                >
                                    <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path
                                            className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Responsive Navigation Drawer */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl'}>
                    <div className="space-y-1 pb-3 pt-2 px-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            📊 {t('dashboard')}
                        </ResponsiveNavLink>

                        {(hasPerm('gerer_structure') || hasPerm('voir_structure')) && (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 pb-1">
                                <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">🏛️ {t('structure')}</div>
                                <ResponsiveNavLink href={route('directions.index')} active={route().current('directions.index')}>{t('directions')}</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('departements.index')} active={route().current('departements.index')}>{t('departements')}</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('divisions.index')} active={route().current('divisions.index')}>{t('divisions')}</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('services.index')} active={route().current('services.index')}>{t('services')}</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('employes.index')} active={route().current('employes.index')}>{t('employes')}</ResponsiveNavLink>
                            </div>
                        )}

                        {(hasPerm('gerer_materiels') || hasPerm('voir_materiels')) && (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 pb-1">
                                <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">💻 {t('parc_materiel')}</div>
                                <ResponsiveNavLink href={route('materiels.index')} active={route().current('materiels.index')}>{t('materiels')}</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('categories.index')} active={route().current('categories.index')}>{t('categories')}</ResponsiveNavLink>
                                <ResponsiveNavLink href={route('affectations.index')} active={route().current('affectations.index')}>{t('affectations')}</ResponsiveNavLink>
                            </div>
                        )}

                        {(hasPerm('voir_audit_logs') || isAdmin) && (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-2 pb-1">
                                <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">🛡️ {t('administration')}</div>
                                {hasPerm('voir_audit_logs') && (
                                    <ResponsiveNavLink href={route('audit-logs.index')} active={route().current('audit-logs.index')}>{t('journal_audit')}</ResponsiveNavLink>
                                )}
                                {isAdmin && (
                                    <>
                                        <ResponsiveNavLink href={route('roles.index')} active={route().current('roles.index')}>{t('roles')}</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route('users.index')} active={route().current('users.index')}>{t('utilisateurs')}</ResponsiveNavLink>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pb-3 pt-4 bg-slate-50 dark:bg-slate-900/80 px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-base font-bold text-slate-800 dark:text-white">{user?.name}</div>
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{user?.email}</div>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold shadow-sm"
                            >
                                {darkMode ? '☀️' : '🌙'}
                            </button>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>{t('my_profile')}</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">{t('logout')}</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200/60 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
