import ApplicationLogo from '@/Components/ApplicationLogo';
import { useLanguage } from '@/Context/LanguageContext';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Print({ affectation }) {
    const { t } = useLanguage();

    useEffect(() => {
        // Auto-open print dialog after render
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const emp = affectation.employe || {};
    const mat = affectation.materiel || {};
    const service = emp.service || {};
    const division = service.division || {};
    const departement = division.departement || {};
    const direction = departement.direction || {};

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const dateStr = dateString.includes('T') ? dateString.split('T')[0] : dateString;
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const codeAff = 'AFF-' + String(affectation.id).padStart(5, '0');

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-6 text-slate-900 font-sans print:p-0 print:bg-white print:min-h-0">
            {/* Empty title prevents browser from printing URL/title in header */}
            <Head title="" />

            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 8mm 10mm;
                }
                @media print {
                    html, body {
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        overflow: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-sheet-wrapper {
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        page-break-inside: avoid !important;
                        page-break-after: avoid !important;
                    }
                    .print-hidden-controls {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Print action controls (Hidden during print) */}
            <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center bg-white p-4 rounded-2xl shadow border border-slate-200 print-hidden-controls print:hidden">
                <div>
                    <h1 className="font-extrabold text-base text-slate-900">{t('print_title')} ({codeAff})</h1>
                    <p className="text-xs text-slate-500">{t('print_doc_ready')}</p>
                </div>
                <div className="flex gap-2.5">
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                        ← {t('back')}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-5 py-2 bg-[#11508f] hover:bg-[#0d3d6e] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
                    >
                        🖨️ {t('print_button')}
                    </button>
                </div>
            </div>

            {/* Printable Document Container (Optimized for full A4 use & maximum visibility) */}
            <div className="print-sheet-wrapper max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none">

                {/* Header: Official Logo + Company Titles */}
                <div className="flex justify-between items-center pb-4 border-b-2 border-slate-800 mb-4">
                    <div className="flex items-center gap-4">
                        <ApplicationLogo className="h-16 w-auto" />
                    </div>
                    <div className="text-right">
                        <h2 className="text-sm font-black text-[#11508f] tracking-tight uppercase">
                            Société Régionale Multiservices Souss-Massa SA
                        </h2>
                        <p className="text-xs text-slate-700 font-bold mt-0.5">
                            Direction Systèmes d'Information & Transformation Digitale
                        </p>
                        <p className="text-xs text-slate-500 font-semibold">
                            Service Infrastructure et Supervision SI
                        </p>
                    </div>
                </div>

                {/* Centered Document Title */}
                <div className="text-center my-4 pb-2 border-b border-slate-300">
                    <h1 className="text-lg sm:text-xl font-black tracking-wider text-slate-950 uppercase font-heading">
                        {t('print_heading')}
                    </h1>
                    <div className="flex justify-center items-center gap-6 text-xs text-slate-700 mt-1 font-semibold">
                        <span>{t('print_ref')} : <strong className="font-mono text-sm font-black text-slate-900">{codeAff}</strong></span>
                        <span>•</span>
                        <span>{t('print_date')} : <strong className="text-sm font-black text-slate-900">{formatDate(affectation.date_affectation)}</strong></span>
                    </div>
                </div>

                {/* Section 1: Informations du Bénéficiaire */}
                <div className="mb-4">
                    <h2 className="text-xs sm:text-sm font-black text-[#11508f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>1.</span>
                        <span>{t('print_section_beneficiary')}</span>
                    </h2>
                    <div className="p-4 rounded-xl border-2 border-slate-300 bg-slate-50/50 print:bg-white text-xs sm:text-sm">
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-6">
                            <div className="flex items-baseline">
                                <span className="w-28 text-slate-600 font-semibold shrink-0">{t('name')} :</span>
                                <span className="font-black text-slate-950 text-sm sm:text-base">{emp.nom} {emp.prenom}</span>
                            </div>
                            <div className="flex items-baseline">
                                <span className="w-28 text-slate-600 font-semibold shrink-0">{t('employes_matricule')} :</span>
                                <span className="font-black text-slate-950 font-mono text-sm sm:text-base">{emp.matricule}</span>
                            </div>
                            <div className="flex items-baseline">
                                <span className="w-28 text-slate-600 font-semibold shrink-0">{t('services')} :</span>
                                <span className="font-bold text-[#11508f]">{service.nom_service || '—'}</span>
                            </div>
                            <div className="flex items-baseline">
                                <span className="w-28 text-slate-600 font-semibold shrink-0">{t('employes_fonction')} :</span>
                                <span className="font-bold text-slate-900">{emp.fonction || '—'}</span>
                            </div>
                            <div className="flex items-baseline col-span-2 pt-1 border-t border-slate-200">
                                <span className="w-28 text-slate-600 font-semibold shrink-0">Structure :</span>
                                <span className="font-semibold text-slate-800">
                                    {division.nom_division ? `${division.nom_division} ➜ ` : ''}
                                    {departement.nom_departement ? `${departement.nom_departement} ➜ ` : ''}
                                    <strong>{direction.nom_direction || '—'}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Désignation du Matériel Affecté */}
                <div className="mb-4">
                    <h2 className="text-xs sm:text-sm font-black text-[#11508f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>2.</span>
                        <span>{t('print_section_materiel')}</span>
                    </h2>
                    <table className="w-full text-xs sm:text-sm border-2 border-slate-400 border-collapse text-center">
                        <thead>
                            <tr className="bg-slate-100 text-slate-900 font-black uppercase text-xs tracking-wider border-b-2 border-slate-400">
                                <th className="p-2.5 border-r border-slate-300 text-left">{t('materiels_name')}</th>
                                <th className="p-2.5 border-r border-slate-300">{t('materiels_category')}</th>
                                <th className="p-2.5 border-r border-slate-300">{t('materiels_brand')} / {t('materiels_model')}</th>
                                <th className="p-2.5 border-r border-slate-300">{t('materiels_serial')}</th>
                                <th className="p-2.5">{t('materiels_inventory')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-900 font-medium">
                            <tr className="border-b border-slate-300 bg-white">
                                <td className="p-3 border-r border-slate-300 text-left font-black text-slate-950 text-sm">
                                    {mat.nom}
                                    {mat.caracteristique && (
                                        <span className="block text-xs font-medium text-slate-600 mt-1">
                                            {mat.caracteristique}
                                        </span>
                                    )}
                                </td>
                                <td className="p-3 border-r border-slate-300 font-semibold">{mat.categorie?.nom_categorie || '—'}</td>
                                <td className="p-3 border-r border-slate-300 font-bold">{mat.marque || ''} {mat.modele || ''}</td>
                                <td className="p-3 border-r border-slate-300 font-mono font-black text-sm text-[#11508f]">{mat.numero_serie}</td>
                                <td className="p-3 font-mono font-black text-sm text-slate-950">{mat.numero_inventaire}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 3: Engagements du Bénéficiaire (Print Terms) */}
                <div className="mb-4 p-3.5 rounded-xl border-2 border-emerald-400 bg-emerald-50/40 print:bg-white text-xs sm:text-sm text-slate-800">
                    <h4 className="font-black text-emerald-950 uppercase tracking-wider mb-1.5 text-xs sm:text-sm">
                        3. {t('print_section_commitments')} :
                    </h4>
                    <ul className="space-y-1.5 list-disc ms-5 text-slate-900 font-medium leading-snug">
                        <li>{t('print_term_1')}</li>
                        <li>{t('print_term_2')}</li>
                        <li>{t('print_term_3')}</li>
                        <li>{t('print_term_4')}</li>
                    </ul>
                </div>

                {/* Section 4: Émargement & Validation (Signatures) */}
                <div className="mb-2">
                    <h2 className="text-xs sm:text-sm font-black text-[#11508f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>4.</span>
                        <span>{t('print_section_signatures')}</span>
                    </h2>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        
                        {/* Card 1: Bénéficiaire */}
                        <div className="p-3.5 rounded-xl border-2 border-slate-400 bg-white min-h-[135px] flex flex-col justify-between text-xs">
                            <div>
                                <div className="font-black uppercase text-[#11508f] text-xs mb-1 tracking-wide">{t('print_sig_beneficiary')}</div>
                                <div className="text-xs font-bold text-slate-900">{emp.nom} {emp.prenom}</div>
                                <div className="text-xs text-slate-600 mt-1 font-semibold">{t('date')} : ___/___/______</div>
                            </div>
                            <div className="pt-2 border-t border-dashed border-slate-300 text-center text-[10px] sm:text-xs font-bold italic text-slate-500">
                                {t('print_sig_beneficiary_sub')}
                            </div>
                        </div>

                        {/* Card 2: Supérieur Hiérarchique */}
                        <div className="p-3.5 rounded-xl border-2 border-slate-400 bg-white min-h-[135px] flex flex-col justify-between text-xs">
                            <div>
                                <div className="font-black uppercase text-[#11508f] text-xs mb-1 tracking-wide">{t('print_sig_supervisor')}</div>
                                <div className="text-xs font-medium text-slate-700">Nom : ________________</div>
                                <div className="text-xs text-slate-600 mt-1 font-semibold">{t('date')} : ___/___/______</div>
                            </div>
                            <div className="pt-2 border-t border-dashed border-slate-300 text-center text-[10px] sm:text-xs font-bold italic text-slate-500">
                                {t('print_sig_supervisor_sub')}
                            </div>
                        </div>

                        {/* Card 3: Direction SI */}
                        <div className="p-3.5 rounded-xl border-2 border-slate-400 bg-white min-h-[135px] flex flex-col justify-between text-xs">
                            <div>
                                <div className="font-black uppercase text-[#11508f] text-xs mb-1 tracking-wide">{t('print_sig_dsitd')}</div>
                                <div className="text-xs font-medium text-slate-700">Visa Responsable Parc</div>
                                <div className="text-xs text-slate-600 mt-1 font-semibold">{t('date')} : ___/___/______</div>
                            </div>
                            <div className="pt-2 border-t border-dashed border-slate-300 text-center text-[10px] sm:text-xs font-bold italic text-slate-500">
                                {t('print_sig_dsitd_sub')}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer for Legal & System Traceability */}
                <div className="mt-4 pt-2 border-t-2 border-slate-300 flex justify-between items-center text-[10px] text-slate-600 font-semibold">
                    <span>Société Régionale Multiservices Souss-Massa SA — Système de Gestion du Parc Informatique</span>
                    <span>Document officiel généré le {new Date().toLocaleDateString('fr-FR')} • Réf: {codeAff}</span>
                </div>

            </div>
        </div>
    );
}
