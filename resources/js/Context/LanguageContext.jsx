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
        light_mode: "Mode Clair",
        dark_mode: "Mode Sombre",

        // Welcome Page Translation Keys
        system_title: "PARC INFORMATIQUE",
        system_subtitle: "GESTION EXECUTIVE",
        hero_badge: "Système Opérationnel & Conforme v2.0",
        hero_title_1: "Gestion Executive du",
        hero_title_2: "Parc Informatique",
        hero_desc: "Traçabilité intégrale des équipements, gestion des affectations par collaborateur, alertes de renouvellement et journal d'audit sécurisé.",
        go_to_dashboard: "Accéder au Tableau de Bord →",
        login_access: "Connexion à l'Espace Sécurisé →",
        workspace_access: "Espace de Travail →",
        live_preview_title: "Aperçu Executive Live",
        live_preview_desc: "Dernières données du parc en temps réel",
        stat_total_title: "Inventaire Matériel",
        stat_total_sub: "Total Équipements",
        stat_total_desc: "Traçabilité par S/N et Code Inventaire",
        stat_affectations_title: "Affectations Actives",
        stat_affectations_sub: "Prise en Charge",
        stat_affectations_desc: "Génération de fiches A4 imprimables",
        stat_stock_title: "Stock & Sécurité",
        stat_stock_sub: "Stock Disponible",
        stat_stock_desc: "Audit continu et contrôle des rôles",
        feature_structure_title: "Structure Organisationnelle",
        feature_structure_desc: "Découpage hiérarchique complet par Directions, Départements, Divisions et Services avec rattachement direct des collaborateurs.",
        feature_parc_title: "Parc & Affectations",
        feature_parc_desc: "Attributions d’ordinateurs, écrans et périphériques avec gestion de restitutions, clôtures et fiches de prise en charge A4.",
        feature_security_title: "Sécurité & Journal d'Audit",
        feature_security_desc: "Registre infalsifiable traçant l'ensemble des créations, modifications et clôtures d'affectations avec horodatage strict.",
        footer_internal: "— Système de Gestion Interne",
        footer_rights: "Tous droits réservés."
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
        light_mode: "Light Mode",
        dark_mode: "Dark Mode",

        // Welcome Page Translation Keys
        system_title: "IT FLEET MANAGEMENT",
        system_subtitle: "EXECUTIVE MANAGEMENT",
        hero_badge: "Operational & Compliant System v2.0",
        hero_title_1: "Executive Management of",
        hero_title_2: "IT Hardware Fleet",
        hero_desc: "Full equipment traceability, employee assignment tracking, renewal alerts, and secure audit logs.",
        go_to_dashboard: "Access Dashboard →",
        login_access: "Secure Login →",
        workspace_access: "Workspace →",
        live_preview_title: "Live Executive Preview",
        live_preview_desc: "Real-time hardware fleet status",
        stat_total_title: "Hardware Inventory",
        stat_total_sub: "Total Equipment",
        stat_total_desc: "Traceability by S/N and Tag",
        stat_affectations_title: "Active Assignments",
        stat_affectations_sub: "Assigned Assets",
        stat_affectations_desc: "Printable A4 handover slips",
        stat_stock_title: "Stock & Security",
        stat_stock_sub: "Available Stock",
        stat_stock_desc: "Continuous audit and role access control",
        feature_structure_title: "Organizational Structure",
        feature_structure_desc: "Hierarchical breakdown by Directions, Departments, Divisions, and Services with direct employee linking.",
        feature_parc_title: "Fleet & Assignments",
        feature_parc_desc: "Assignment of computers, monitors, and peripherals with returns, closures, and printable A4 sheets.",
        feature_security_title: "Security & Audit Log",
        feature_security_desc: "Tamper-proof log tracking all creation, modification, and closure of assignments with strict timestamps.",
        footer_internal: "— Internal Management System",
        footer_rights: "All rights reserved."
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
        light_mode: "الوضع النهاري",
        dark_mode: "الوضع الليلي",

        // Welcome Page Translation Keys
        system_title: "إدارة العتاد المعلوماتي",
        system_subtitle: "النظام التنفيذي",
        hero_badge: "نظام تشغيلي ومطابق للمواصفات v2.0",
        hero_title_1: "الإدارة التنفيذية لـ",
        hero_title_2: "العتاد المعلوماتي",
        hero_desc: "تتبع كامل للمعدات المعلوماتية، إدارة التعيينات حسب الموظفين، تنبيهات التجديد وسجل تدقيق آمن.",
        go_to_dashboard: "الانتقال إلى لوحة التحكم ←",
        login_access: "تسجيل الدخول الآمن ←",
        workspace_access: "مساحة العمل ←",
        live_preview_title: "معاينة مباشرة للوحة التحكم",
        live_preview_desc: "بيانات العتاد المباشرة في الوقت الفعلي",
        stat_total_title: "جرد العتاد",
        stat_total_sub: "إجمالي المعدات",
        stat_total_desc: "تتبع بالرقم التسلسلي ورمز الجرد",
        stat_affectations_title: "التعيينات النشطة",
        stat_affectations_sub: "المعدات المعينة",
        stat_affectations_desc: "إنشاء استمارات التعيين A4",
        stat_stock_title: "المخزون والأمان",
        stat_stock_sub: "المتوفـر بالمخزن",
        stat_stock_desc: "تدقيق مستمر ورقابة على الصلاحيات",
        feature_structure_title: "الهيكل التنظيمي",
        feature_structure_desc: "تقسيم هرمي شامل حسب المديريات، الأقسام، المصالح والخدمات مع ربط الموظفين بها مباشرة.",
        feature_parc_title: "العتاد والتعيينات",
        feature_parc_desc: "تعيين أجهزة الكمبيوتر، الشاشات والملحقات مع إدارة الاسترجاع، الإغلاق واستمارات A4.",
        feature_security_title: "الأمان وسجل التدقيق",
        feature_security_desc: "سجل غير قابل للتزوير يتتبع جميع عمليات الإنشاء، التعديل والإغلاق مع التوقيت الزمني الدقيق.",
        footer_internal: "— نظام الإدارة الداخلي",
        footer_rights: "جميع الحقوق محفوظة."
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
