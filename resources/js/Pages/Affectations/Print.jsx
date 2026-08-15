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
            {/* Empty title prevents browser from printing title in header */}
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
                        overflow: hidden !important;
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
            <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center bg-white p-3.5 rounded-xl shadow border border-slate-200 print-hidden-controls print:hidden">
                <div>
                    <h1 className="font-extrabold text-sm text-slate-900">{t('print_title')} ({codeAff})</h1>
                    <p className="text-[11px] text-slate-500">{t('print_doc_ready')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.history.back()}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                        ← {t('back')}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-1.5 bg-[#11508f] hover:bg-[#0d3d6e] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
                    >
                        🖨️ {t('print_button')}
                    </button>
                </div>
            </div>

            {/* Printable Document Container (Strict Single Page A4 Sizing) */}
            <div className="print-sheet-wrapper max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none">

                {/* Header: Official SRM Emblem Logo + Company Department Title */}
                <div className="flex justify-between items-start pb-3 border-b border-slate-200 mb-3">
                    <div className="flex items-center gap-3">
                        <ApplicationLogo className="h-12 w-auto" />
                    </div>
                    <div className="text-right">
                        <h2 className="text-xs font-extrabold text-[#11508f]">Société Régionale Multiservices Souss-Massa SA</h2>
                        <p className="text-[11px] text-slate-600 font-medium">Direction Systèmes d'Information & Transformation Digitale</p>
                        <p className="text-[10px] text-slate-500 font-medium">Service Infrastructure et Supervision SI</p>
                    </div>
                </div>

                {/* Centered Document Title */}
                <div className="text-center my-3">
                    <h1 className="text-base font-extrabold tracking-tight text-slate-800 uppercase">
                        {t('print_heading')}
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {t('print_ref')} : <strong className="text-slate-800">{codeAff}</strong> | {t('print_date')} : <strong className="text-slate-800">{formatDate(affectation.date_affectation)}</strong>
                    </p>
                </div>

                {/* Section 1: Informations du Bénéficiaire */}
                <div className="mb-3">
                    <h2 className="text-[11px] font-black text-[#11508f] uppercase tracking-wider mb-1.5">
                        1. {t('print_section_beneficiary')}
                    </h2>
                    <div className="p-3 rounded-xl border border-slate-200 border-l-4 border-l-[#11508f] bg-slate-50/50 print:bg-white text-xs">
                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                            <div className="flex">
                                <span className="w-24 text-slate-600 font-medium shrink-0">{t('name')} :</span>
                                <span className="font-extrabold text-slate-900">{emp.nom} {emp.prenom}</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-slate-600 font-medium shrink-0">{t('employes_matricule')} :</span>
                                <span className="font-extrabold text-slate-900 font-mono">{emp.matricule}</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-slate-600 font-medium shrink-0">{t('services')} :</span>
                                <span className="font-extrabold text-[#11508f]">{service.nom_service || '—'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-slate-600 font-medium shrink-0">{t('employes_fonction')} :</span>
                                <span className="font-bold text-slate-900">{emp.fonction || '—'}</span>
                            </div>
                            <div className="flex col-span-2">
                                <span className="w-24 text-slate-600 font-medium shrink-0">{t('divisions')} / {t('departements')} :</span>
                                <span className="font-bold text-slate-800">
                                    {division.nom_division ? `${division.nom_division} • ` : ''}
                                    {departement.nom_departement ? `${departement.nom_departement} • ` : ''}
                                    {direction.nom_direction || '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Désignation du Matériel Affecté */}
                <div className="mb-3">
                    <h2 className="text-[11px] font-black text-[#11508f] uppercase tracking-wider mb-1.5">
                        2. {t('print_section_materiel')}
                    </h2>
                    <table className="w-full text-xs border border-slate-300 border-collapse text-center">
                        <thead>
                            <tr className="bg-slate-100/80 print:bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-300">
                                <th className="p-2 border-r border-slate-300 text-left">{t('materiels_name')}</th>
                                <th className="p-2 border-r border-slate-300">{t('materiels_category')}</th>
                                <th className="p-2 border-r border-slate-300">{t('materiels_brand')}</th>
                                <th className="p-2 border-r border-slate-300">{t('materiels_model')}</th>
                                <th className="p-2 border-r border-slate-300">{t('materiels_serial')}</th>
                                <th className="p-2">{t('materiels_inventory')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-800 font-medium">
                            <tr className="border-b border-slate-200 bg-white">
                                <td className="p-2 border-r border-slate-200 text-left font-bold text-slate-900">
                                    {mat.nom}
                                    {mat.caracteristique && (
                                        <span className="block text-[10px] font-normal text-slate-500">{mat.caracteristique}</span>
                                    )}
                                </td>
                                <td className="p-2 border-r border-slate-200">{mat.categorie?.nom_categorie || '—'}</td>
                                <td className="p-2 border-r border-slate-200 font-bold">{mat.marque || '—'}</td>
                                <td className="p-2 border-r border-slate-200">{mat.modele || '—'}</td>
                                <td className="p-2 border-r border-slate-200 font-mono font-bold text-indigo-700">{mat.numero_serie}</td>
                                <td className="p-2 font-mono font-bold">{mat.numero_inventaire}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 3: Engagements du Bénéficiaire (Print Terms) */}
                <div className="mb-3 p-3 rounded-xl border border-emerald-300 border-l-4 border-l-emerald-600 bg-emerald-50/50 print:bg-white text-[11px] text-slate-700">
                    <h4 className="font-extrabold text-emerald-900 uppercase tracking-wider mb-1 text-[11px]">
                        3. {t('print_section_commitments')} :
                    </h4>
                    <ul className="space-y-1 list-disc ms-4 text-slate-800">
                        <li>{t('print_term_1')}</li>
                        <li>{t('print_term_2')}</li>
                        <li>{t('print_term_3')}</li>
                        <li>{t('print_term_4')}</li>
                    </ul>
                </div>

                {/* Section 4: Émargement & Validation (Signatures) */}
                <div>
                    <h2 className="text-[11px] font-black text-[#11508f] uppercase tracking-wider mb-1.5">
                        4. {t('print_section_signatures')}
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        
                        {/* Card 1: Bénéficiaire */}
                        <div className="p-2.5 rounded-xl border border-slate-300 border-t-4 border-t-[#11508f] bg-white min-h-[95px] flex flex-col justify-between text-xs">
                            <div>
                                <div className="font-extrabold uppercase text-[#11508f] text-[10px] mb-1">{t('print_sig_beneficiary')}</div>
                                <div className="text-[11px] font-bold text-slate-800">{emp.nom} {emp.prenom}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{t('date')} : ___/___/______</div>
                            </div>
                            <div className="pt-1.5 border-t border-dashed border-slate-200 text-right text-[9px] italic text-slate-400">
                                {t('print_sig_beneficiary_sub')}
                            </div>
                        </div>

                        {/* Card 2: Supérieur Hiérarchique */}
                        <div className="p-2.5 rounded-xl border border-slate-300 border-t-4 border-t-[#11508f] bg-white min-h-[95px] flex flex-col justify-between text-xs">
                            <div>
                                <div className="font-extrabold uppercase text-[#11508f] text-[10px] mb-1">{t('print_sig_supervisor')}</div>
                                <div className="text-[11px] font-medium text-slate-600">Nom : ________________</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{t('date')} : ___/___/______</div>
                            </div>
                            <div className="pt-1.5 border-t border-dashed border-slate-200 text-right text-[9px] italic text-slate-400">
                                {t('print_sig_supervisor_sub')}
                            </div>
                        </div>

                        {/* Card 3: Direction SI */}
                        <div className="p-2.5 rounded-xl border border-slate-300 border-t-4 border-t-[#11508f] bg-white min-h-[95px] flex flex-col justify-between text-xs">
                            <div>
                                <div className="font-extrabold uppercase text-[#11508f] text-[10px] mb-1">{t('print_sig_dsitd')}</div>
                                <div className="text-[11px] font-medium text-slate-600">Visa Responsable Parc</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">{t('date')} : ___/___/______</div>
                            </div>
                            <div className="pt-1.5 border-t border-dashed border-slate-200 text-right text-[9px] italic text-slate-400">
                                {t('print_sig_dsitd_sub')}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Micro Footer for Legal Traceability */}
                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400">
                    <span>SRM Souss-Massa SA — Système de Gestion du Parc Informatique</span>
                    <span>Document généré automatiquement • Réf: {codeAff}</span>
                </div>

            </div>
        </div>
    );
}
