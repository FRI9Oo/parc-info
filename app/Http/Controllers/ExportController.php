<?php

namespace App\Http\Controllers;

use App\Models\AffectationMateriel;
use App\Models\AuditLog;
use App\Models\Employe;
use App\Models\Materiel;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Export Materiels inventory to CSV
     */
    public function exportMateriels(): StreamedResponse
    {
        $fileName = 'inventaire_materiels_' . date('Y-m-d_H-i') . '.csv';

        $materiels = Materiel::with(['categorie', 'affectations' => function ($q) {
            $q->occupantMateriel()->with('employe');
        }])->get();

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename={$fileName}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($materiels) {
            $file = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, [
                'ID',
                'Nom du Matériel',
                'Marque',
                'Modèle',
                'N° Série',
                'N° Inventaire',
                'Catégorie',
                'Statut',
                'Possesseur Actuel',
                'Caractéristiques',
            ], ';');

            foreach ($materiels as $m) {
                $current = $m->affectations->first();
                $isDisponible = is_null($current);
                $occupant = $current && $current->employe
                    ? $current->employe->nom . ' ' . $current->employe->prenom . ' (' . $current->employe->matricule . ')'
                    : 'Aucun';

                fputcsv($file, [
                    $m->id,
                    $m->nom,
                    $m->marque,
                    $m->modele,
                    $m->numero_serie,
                    $m->numero_inventaire,
                    $m->categorie?->nom_categorie ?? 'Non catégorisé',
                    $isDisponible ? 'Disponible' : 'Affecté',
                    $occupant,
                    $m->caracteristique ?? '',
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export Affectations history to CSV
     */
    public function exportAffectations(): StreamedResponse
    {
        $fileName = 'historique_affectations_' . date('Y-m-d_H-i') . '.csv';

        $affectations = AffectationMateriel::with(['employe.service', 'materiel.categorie'])
            ->orderByDesc('date_affectation')
            ->get();

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename={$fileName}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($affectations) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, [
                'Code Affectation',
                'Date Affectation',
                'Employé - Matricule',
                'Employé - Nom & Prénom',
                'Employé - Service',
                'Matériel - Nom',
                'Matériel - N° Série',
                'Matériel - N° Inventaire',
                'Matériel - Catégorie',
                'Date Restitution',
                'État',
            ], ';');

            foreach ($affectations as $a) {
                fputcsv($file, [
                    'AFF-' . str_pad($a->id, 5, '0', STR_PAD_LEFT),
                    $a->date_affectation->format('d/m/Y'),
                    $a->employe?->matricule ?? '',
                    $a->employe ? ($a->employe->nom . ' ' . $a->employe->prenom) : '',
                    $a->employe?->service?->nom_service ?? '',
                    $a->materiel?->nom ?? '',
                    $a->materiel?->numero_serie ?? '',
                    $a->materiel?->numero_inventaire ?? '',
                    $a->materiel?->categorie?->nom_categorie ?? '',
                    $a->date_restitution ? $a->date_restitution->format('d/m/Y') : 'Non restitué',
                    $a->etat,
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export Employes list to CSV
     */
    public function exportEmployes(): StreamedResponse
    {
        $fileName = 'annuaire_employes_' . date('Y-m-d_H-i') . '.csv';

        $employes = Employe::with('service.division.departement.direction')
            ->withCount('affectations')
            ->orderBy('nom')
            ->get();

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename={$fileName}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($employes) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, [
                'ID',
                'Matricule',
                'Nom',
                'Prénom',
                'Fonction',
                'Service',
                'Division',
                'Département',
                'Direction',
                'Nombre Matériels Affectés',
            ], ';');

            foreach ($employes as $e) {
                $service = $e->service;
                $division = $service?->division;
                $departement = $division?->departement;
                $direction = $departement?->direction;

                fputcsv($file, [
                    $e->id,
                    $e->matricule,
                    $e->nom,
                    $e->prenom,
                    $e->fonction ?? '',
                    $service?->nom_service ?? '',
                    $division?->nom_division ?? '',
                    $departement?->nom_departement ?? '',
                    $direction?->nom_direction ?? '',
                    $e->affectations_count,
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export Audit Logs to CSV
     */
    public function exportAuditLogs(): StreamedResponse
    {
        $fileName = 'journal_audit_' . date('Y-m-d_H-i') . '.csv';

        $logs = AuditLog::with('user')->orderByDesc('created_at')->get();

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename={$fileName}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, [
                'ID',
                'Horodatage',
                'Utilisateur',
                'Module',
                'Action',
                'Description',
                'Adresse IP',
            ], ';');

            foreach ($logs as $l) {
                fputcsv($file, [
                    $l->id,
                    $l->created_at->format('d/m/Y H:i:s'),
                    $l->user_name ?? 'Système',
                    $l->module,
                    $l->action,
                    $l->description,
                    $l->ip_address ?? '',
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
