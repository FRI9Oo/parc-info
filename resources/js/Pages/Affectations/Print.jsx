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
            <Head title={`Impression ${codeAff}`} />

            {/* Print action controls (Hidden during print) */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow print:hidden">
                <div>
                    <h1 className="font-bold text-slate-800">Fiche de Prise en Charge ({codeAff})</h1>
                    <p className="text-xs text-slate-500">Prêt pour l'impression ou l'export au format PDF</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                        ← Retour
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#11508f] hover:bg-[#0d3d6e] rounded-lg transition flex items-center gap-2"
                    >
                        🖨️ Imprimer le Document
                    </button>
                </div>
            </div>

            {/* Printable Document Container (A4 layout styled) */}
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-lg shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none">

                {/* Header */}
                <div className="flex justify-between items-center border-b-2 border-slate-800 pb-6 mb-8">
                    <div>
                        <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">Royaume du Maroc</div>
                        <div className="text-lg font-extrabold text-[#11508f]">PARC INFORMATIQUE CENTRAL</div>
                        <div className="text-xs text-slate-600">Direction des Systèmes d'Information & Télécommunications</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded border border-slate-300 inline-block">
                            Réf : {codeAff}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Date d'édition : {formatDate(new Date().toISOString())}</div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center my-6">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 border-y border-slate-300 py-3 bg-slate-50">
                        Fiche de Prise en Charge de Matériel Informatique
                    </h2>
                </div>

                {/* Section 1: Employé */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-[#11508f] uppercase tracking-wide border-b pb-1 mb-3">
                        I. Identification du Bénéficiaire
                    </h3>
                    <table className="w-full text-xs border border-slate-300 border-collapse">
                        <tbody>
                            <tr className="border-b border-slate-300">
                                <td className="p-2.5 font-bold bg-slate-50 w-1/4 border-r border-slate-300">Nom & Prénom :</td>
                                <td className="p-2.5 font-medium text-slate-900 w-1/4 border-r border-slate-300">{emp.nom} {emp.prenom}</td>
                                <td className="p-2.5 font-bold bg-slate-50 w-1/4 border-r border-slate-300">Matricule :</td>
                                <td className="p-2.5 font-mono font-bold text-slate-900 w-1/4">{emp.matricule}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Fonction :</td>
                                <td className="p-2.5 font-medium text-slate-900 border-r border-slate-300">{emp.fonction || '—'}</td>
                                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Service :</td>
                                <td className="p-2.5 font-medium text-slate-900">{service.nom_service || '—'}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Division :</td>
                                <td className="p-2.5 font-medium text-slate-900 border-r border-slate-300">{division.nom_division || '—'}</td>
                                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Département :</td>
                                <td className="p-2.5 font-medium text-slate-900">{departement.nom_departement || '—'}</td>
                            </tr>
                            <tr>
                                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Direction :</td>
                                <td colSpan={3} className="p-2.5 font-medium text-slate-900">{direction.nom_direction || '—'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section 2: Matériel */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-[#11508f] uppercase tracking-wide border-b pb-1 mb-3">
                        II. Désignation des Équipements Affectés
                    </h3>
                    <table className="w-full text-xs border border-slate-300 border-collapse">
                        <tbody>
                            <tr className="border-b border-slate-300">
                                <td className="p-2.5 font-bold bg-slate-50 w-1/4 border-r border-slate-300">Désignation du Matériel :</td>
                                <td className="p-2.5 font-bold text-slate-900 w-1/4 border-r border-slate-300">{mat.nom}</td>
                                <td className="p-2.5 font-bold bg-slate-50 w-1/4 border-r border-slate-300">Catégorie :</td>
                                <td className="p-2.5 font-medium text-slate-900 w-1/4">{mat.categorie?.nom_categorie || '—'}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Marque & Modèle :</td>
                                <td className="p-2.5 font-medium text-slate-900 border-r border-slate-300">{mat.marque} {mat.modele}</td>
                                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Date d'Affectation :</td>
                                <td className="p-2.5 font-bold text-slate-900">{formatDate(affectation.date_affectation)}</td>
                            </tr>
                            <tr className="border-b border-slate-300">
                                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">N° de Série :</td>
                                <td className="p-2.5 font-mono font-bold text-slate-900 border-r border-slate-300">{mat.numero_serie}</td>
                                <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">N° d'Inventaire :</td>
                                <td className="p-2.5 font-mono font-bold text-slate-900">{mat.numero_inventaire}</td>
                            </tr>
                            {mat.caracteristique && (
                                <tr>
                                    <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Spécifications Techniques :</td>
                                    <td colSpan={3} className="p-2.5 font-mono text-xs text-slate-800">{mat.caracteristique}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Section 3: Engagement */}
                <div className="mb-12 bg-slate-50 p-4 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <h4 className="font-bold text-slate-900 mb-1">Engagement & Responsabilités du Bénéficiaire :</h4>
                    <p>
                        Je soussigné(e), <strong className="text-slate-900">{emp.nom} {emp.prenom}</strong>, certifie avoir reçu en parfait état de marche le matériel informatique décrit ci-dessus. Je m'engage à :
                    </p>
                    <ul className="list-disc ms-5 mt-1 space-y-0.5">
                        <li>Utiliser cet équipement exclusivement dans le cadre de mes fonctions professionnelles.</li>
                        <li>Assurer la garde et la conservation matérielle de cet équipement contre le vol et la détérioration.</li>
                        <li>Restituer le matériel sur demande du Service Informatique ou lors de la fin de mon affectation.</li>
                    </ul>
                </div>

                {/* Section 4: Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300">
                    <div className="text-center p-4 border border-slate-200 rounded min-h-[140px] flex flex-col justify-between">
                        <div>
                            <div className="font-bold text-xs uppercase text-slate-800">Visa & Signature du Bénéficiaire</div>
                            <div className="text-[10px] text-slate-500 italic">(Précédé de la mention "Lu et approuvé")</div>
                        </div>
                        <div className="text-xs font-semibold text-slate-400 border-t border-dashed border-slate-300 pt-2">
                            {emp.nom} {emp.prenom}
                        </div>
                    </div>

                    <div className="text-center p-4 border border-slate-200 rounded min-h-[140px] flex flex-col justify-between">
                        <div>
                            <div className="font-bold text-xs uppercase text-slate-800">Pour la Direction SI & Télécoms</div>
                            <div className="text-[10px] text-slate-500 italic">(Cachet et Signature du Responsable)</div>
                        </div>
                        <div className="text-xs font-semibold text-slate-400 border-t border-dashed border-slate-300 pt-2">
                            Service Parc Informatique
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-[10px] text-slate-400 border-t pt-3">
                    Fiche générée automatiquement par la plateforme Gestion du Parc Informatique • Document Administratif Confidentiel
                </div>
            </div>
        </div>
    );
}
