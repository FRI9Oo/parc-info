import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                    <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                        Dashboard
                                    </NavLink>
                                    <NavLink href={route('directions.index')} active={route().current('directions.index')}>
                                        Directions
                                    </NavLink>
                                    <NavLink href={route('departements.index')} active={route().current('departements.index')}>
                                        Départements
                                    </NavLink>
                                    <NavLink href={route('divisions.index')} active={route().current('divisions.index')}>
                                        Divisions
                                    </NavLink>
                                    <NavLink href={route('services.index')} active={route().current('services.index')}>
                                        Services
                                    </NavLink>
                                    <NavLink href={route('employes.index')} active={route().current('employes.index')}>
                                        Employés
                                    </NavLink>
                                    <NavLink href={route('materiels.index')} active={route().current('materiels.index')}>
                                        Matériels
                                    </NavLink>
                                    <NavLink href={route('categories.index')} active={route().current('categories.index')}>
                                        Catégories
                                    </NavLink>
                                    <NavLink href={route('affectations.index')} active={route().current('affectations.index')}>
                                        Affectations
                                    </NavLink>
                                    <NavLink href={route('roles.index')} active={route().current('roles.index')}>
                                        Rôles
                                    </NavLink>
                                    <NavLink href={route('permissions.index')} active={route().current('permissions.index')}>
                                        Permissions
                                    </NavLink>
                                    <NavLink href={route('users.index')} active={route().current('users.index')}>
                                        Utilisateurs
                                    </NavLink>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
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

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                                Dashboard
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('directions.index')} active={route().current('directions.index')}>
                                Directions
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('departements.index')} active={route().current('departements.index')}>
                                Départements
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('divisions.index')} active={route().current('divisions.index')}>
                                Divisions
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('services.index')} active={route().current('services.index')}>
                                Services
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('employes.index')} active={route().current('employes.index')}>
                                Employés
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('materiels.index')} active={route().current('materiels.index')}>
                                Matériels
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('categories.index')} active={route().current('categories.index')}>
                                Catégories
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('affectations.index')} active={route().current('affectations.index')}>
                                Affectations
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('roles.index')} active={route().current('roles.index')}>
                                Rôles
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('permissions.index')} active={route().current('permissions.index')}>
                                Permissions
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('users.index')} active={route().current('users.index')}>
                                Utilisateurs
                            </ResponsiveNavLink>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
