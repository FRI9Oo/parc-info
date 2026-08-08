import React, { createContext, useContext, useEffect, useState } from 'react';

export const translations = {
    fr: {
        dashboard: "Dashboard",
        structure: "Structure",
        directions: "Directions",
        departements: "Départements",
        divisions: "Divisions",
        services: "Services",
        employes: "Employés",
        parc_materiel: "Parc Matériel",
        materiels: "Inventaire Matériels",
        categories: "Catégories",
        affectations: "Affectations",
        journal_audit: "Journal d'Audit",
        administration: "Administration",
        roles: "Gestion Rôles",
        utilisateurs: "Comptes Utilisateurs",
        actions: "Actions",
        search_placeholder: "Recherche rapide (S/N, Inv...)",
        my_profile: "Mon Profil",
        logout: "Déconnexion",
        welcome_title: "Tableau de Bord Executive",
        greeting: "Bonjour",
        system_status: "Système Opérationnel & Conforme",
        total_hardware: "Matériels au total",
        assigned: "Actuellement affectés",
        available: "Disponibles en stock",
        export_csv: "Exporter CSV",
        search: "Rechercher",
        filters: "Filtres",
        close: "Fermer",
        save: "Enregistrer",
        cancel: "Annuler",
    },
    en: {
        dashboard: "Dashboard",
        structure: "Structure",
        directions: "Directions",
        departements: "Departments",
        divisions: "Divisions",
        services: "Services",
        employes: "Employees",
        parc_materiel: "Hardware Fleet",
        materiels: "Hardware Inventory",
        categories: "Categories",
        affectations: "Assignments",
        journal_audit: "Audit Logs",
        administration: "Administration",
        roles: "Role Management",
        utilisateurs: "User Accounts",
        actions: "Actions",
        search_placeholder: "Quick search (S/N, Tag...)",
        my_profile: "My Profile",
        logout: "Logout",
        welcome_title: "Executive Dashboard",
        greeting: "Hello",
        system_status: "System Operational & Compliant",
        total_hardware: "Total Equipment",
        assigned: "Currently Assigned",
        available: "Available in Stock",
        export_csv: "Export CSV",
        search: "Search",
        filters: "Filters",
        close: "Close",
        save: "Save",
        cancel: "Cancel",
    },
    ar: {
        dashboard: "لوحة التحكم",
        structure: "الهيكل التنظيمي",
        directions: "المديريات",
        departements: "الأقسام",
        divisions: "المصالح",
        services: "الخدمات",
        employes: "الموظفون",
        parc_materiel: "العتاد المعلوماتي",
        materiels: "جرد المعدات",
        categories: "الفئات",
        affectations: "التعيينات",
        journal_audit: "سجل التدقيق",
        administration: "الإدارة والنظام",
        roles: "إدارة الأدوار",
        utilisateurs: "حسابات المستخدمين",
        actions: "خيارات",
        search_placeholder: "بحث سريع (الرقم التسلسلي...)",
        my_profile: "الملف الشخصي",
        logout: "تسجيل الخروج",
        welcome_title: "لوحة التحكم التنفيذية",
        greeting: "مرحباً",
        system_status: "النظام يعمـل بنجاح ومطابق",
        total_hardware: "إجمالي العتاد",
        assigned: "المعين حالياً",
        available: "المتوفر بالمخزن",
        export_csv: "تصدير CSV",
        search: "بحث",
        filters: "تصفية",
        close: "إغلاق",
        save: "حفظ",
        cancel: "إلغاء",
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [locale, setLocale] = useState(() => {
        return localStorage.getItem('app_locale') || 'fr';
    });

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('app_theme') === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('app_locale', locale);
        document.documentElement.setAttribute('lang', locale);
        document.documentElement.setAttribute('dir', 'ltr');
    }, [locale]);

    useEffect(() => {
        localStorage.setItem('app_theme', darkMode ? 'dark' : 'light');
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const t = (key) => {
        return translations[locale]?.[key] || translations['fr']?.[key] || key;
    };

    const toggleDarkMode = () => setDarkMode((prev) => !prev);

    return (
        <LanguageContext.Provider value={{ locale, setLocale, darkMode, toggleDarkMode, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        // Fallback if rendered outside provider
        return {
            locale: 'fr',
            setLocale: () => {},
            darkMode: false,
            toggleDarkMode: () => {},
            t: (key) => translations['fr']?.[key] || key,
        };
    }
    return context;
}
