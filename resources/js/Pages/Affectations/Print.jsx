import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Print({ affectation }) {
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
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8 text-slate-900 font-sans print:p-0 print:bg-white">
            {/* Empty title prevents browser from printing title in header */}
            <Head title="" />

            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 0mm !important;
                }
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0mm !important;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                    }
                    .print-sheet-wrapper {
                        padding: 10mm 14mm !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        width: 100% !important;
                    }
                    .print-hidden-controls {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Print action controls (Hidden during print) */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow border border-slate-200 print-hidden-controls print:hidden">
                <div>
                    <h1 className="font-extrabold text-slate-900">Fiche de Prise en Charge ({codeAff})</h1>
                    <p className="text-xs text-slate-500">Document A4 officiel prêt pour l'impression ou l'export PDF</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                        ← Retour
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="btn-zellij px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2"
                    >
                        🖨️ Imprimer la Fiche
                    </button>
                </div>
            </div>

            {/* Printable Document Container (Exact Replica of Target PDF Design) */}
            <div className="print-sheet-wrapper max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none">

                {/* Header: Official SRM Emblem Logo + Company Department Title */}
                <div className="flex justify-between items-start pb-6 border-b border-slate-200 mb-6">
                    <div className="flex items-center gap-4">
                        <ApplicationLogo className="h-16 w-auto" />
                    </div>
                    <div className="text-right">
                        <h2 className="text-sm font-extrabold text-[#11508f]">Société Régionale Multiservices Souss-Massa SA</h2>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">Direction Systèmes d'Information & Transformation Digitale</p>
                        <p className="text-xs text-slate-600 font-medium">Service Infrastructure et Supervision SI</p>
                    </div>
                </div>

                {/* Centered Document Title */}
                <div className="text-center my-6">
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-500 uppercase font-heading">
                        FICHE D'AFFECTATION DE MATÉRIEL INFORMATIQUE
                    </h1>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">
                        Référence : <strong className="text-slate-700">{codeAff}</strong> | Date d'affectation : <strong className="text-slate-700">{formatDate(affectation.date_affectation)}</strong>
                    </p>
                </div>

                {/* Section 1: Informations du Bénéficiaire */}
                <div className="mb-6">
                    <h2 className="text-xs font-black text-[#11508f] uppercase tracking-wider mb-2 font-heading">
                        1. INFORMATIONS DU BÉNÉFICIAIRE
                    </h2>
                    <div className="p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#11508f] bg-white text-xs">
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-6">
                            <div className="flex">
                                <span className="w-28 text-slate-600 font-medium shrink-0">Nom & Prénom :</span>
                                <span className="font-extrabold text-slate-900">{emp.nom} {emp.prenom}</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-slate-600 font-medium shrink-0">Matricule :</span>
                                <span className="font-extrabold text-slate-900">{emp.matricule}</span>
                            </div>
                            <div className="flex">
                                <span className="w-28 text-slate-600 font-medium shrink-0">Service :</span>
                                <span className="font-extrabold text-[#11508f]">{service.nom_service || '—'}</span>
                            </div>
                            <div className="flex">
                                <span className="w-24 text-slate-600 font-medium shrink-0">Fonction :</span>
                                <span className="font-extrabold text-slate-900">{emp.fonction || '—'}</span>
                            </div>
                            <div className="flex col-span-2">
                                <span className="w-28 text-slate-600 font-medium shrink-0">Division / Dept :</span>
                                <span className="font-extrabold text-slate-900">
                                    {division.nom_division ? `${division.nom_division} — ` : ''}{service.nom_service || '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Désignation du Matériel Affecté */}
                <div className="mb-6">
                    <h2 className="text-xs font-black text-[#11508f] uppercase tracking-wider mb-2 font-heading">
                        2. DÉSIGNATION DU MATÉRIEL AFFECTÉ
                    </h2>
                    <table className="w-full text-xs border border-[#11508f] border-collapse text-center">
                        <thead>
                            <tr className="bg-white text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#11508f]">
                                <th className="p-2.5 border-r border-[#11508f] text-left">DÉSIGNATION</th>
                                <th className="p-2.5 border-r border-[#11508f]">CATÉGORIE</th>
                                <th className="p-2.5 border-r border-[#11508f]">MARQUE</th>
                                <th className="p-2.5 border-r border-[#11508f]">MODÈLE</th>
                                <th className="p-2.5 border-r border-[#11508f]">N° DE SÉRIE</th>
                                <th className="p-2.5">N° D'INVENTAIRE</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-800 font-medium">
                            <tr className="border-b border-[#cbd5e1]">
                                <td className="p-2.5 border-r border-[#cbd5e1] text-left font-bold text-slate-900">{mat.nom}</td>
                                <td className="p-2.5 border-r border-[#cbd5e1]">{mat.categorie?.nom_categorie || '—'}</td>
                                <td className="p-2.5 border-r border-[#cbd5e1]">{mat.marque}</td>
                                <td className="p-2.5 border-r border-[#cbd5e1]">{mat.modele}</td>
                                <td className="p-2.5 border-r border-[#cbd5e1] font-mono">{mat.numero_serie}</td>
                                <td className="p-2.5 font-mono">{mat.numero_inventaire}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 3: Engagements du Bénéficiaire */}
                <div className="mb-6 p-4 rounded-xl border border-emerald-300 border-l-4 border-l-[#57b24a] bg-emerald-50/50 text-xs text-slate-700">
                    <h4 className="font-extrabold text-emerald-800 uppercase tracking-wider mb-2 font-heading">
                        ENGAGEMENTS DU BÉNÉFICIAIRE & CONDITIONS D'UTILISATION :
                    </h4>
                    <ul className="space-y-1.5 list-disc ms-4 text-emerald-950 font-medium">
                        <li>Le bénéficiaire s'engage à utiliser ce matériel exclusivement dans le cadre de ses activités professionnelles.</li>
                        <li>Il est responsable de la bonne conservation, de la sécurité et du soin apporté au matériel confié.</li>
                        <li>Toute anomalie, panne, perte ou vol doit être immédiatement signalé à la DSITD.</li>
                        <li>En cas de changement de service, de poste ou de cessation de fonction, le matériel doit être restitué sans délai à la DSITD.</li>
                    </ul>
                </div>

                {/* Section 4: Émargement & Validation */}
                <div className="mb-6">
                    <h2 className="text-xs font-black text-[#11508f] uppercase tracking-wider mb-2 font-heading">
                        3. ÉMARGEMENT & VALIDATION
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        
                        {/* Card 1 */}
                        <div className="p-4 rounded-xl border border-slate-300 border-t-4 border-t-[#11508f] bg-white min-h-[140px] flex flex-col justify-between text-xs">
                            <div>
                                <div className="font-extrabold uppercase text-[#11508f] font-heading mb-2">LE BÉNÉFICIAIRE</div>
                                <div className="font-bold text-slate-800">Nom & Prénom : <span className="font-normal">{emp.nom} {emp.prenom}</span></div>
                                <div className="font-bold text-slate-800 mt-1">Date :</div>
                            </div>
                            <div className="pt-2 border-t border-dashed border-slate-200 text-right text-[10px] italic text-slate-400">
                                Signature du bénéficiaire
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-4 rounded-xl border border-slate-300 border-t-4 border-t-[#11508f] bg-white min-h-[140px] flex flex-col justify-between text-xs">
                            <div>
                                <div className="font-extrabold uppercase text-[#11508f] font-heading mb-2">RESPONSABLE HIÉRARCHIQUE</div>
                                <div className="font-bold text-slate-800">Nom & Prénom :</div>
                                <div className="font-bold text-slate-800 mt-1">Date :</div>
                            </div>
                            <div className="pt-2 border-t border-dashed border-slate-200 text-right text-[10px] italic text-slate-400">
                                Signature & Visa
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-4 rounded-xl border border-slate-300 border-t-4 border-t-[#11508f] bg-white min-h-[140px] flex flex-col justify-between text-xs">
                            <div>
                                <div className="font-extrabold uppercase text-[#11508f] font-heading mb-2">DIRECTION DSITD</div>
                                <div className="font-bold text-slate-800">Nom & Prénom :</div>
                                <div className="font-bold text-slate-800 mt-1">Date :</div>
                            </div>
                            <div className="pt-2 border-t border-dashed border-slate-200 text-right text-[10px] italic text-slate-400">
                                Signature & Cachet
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
