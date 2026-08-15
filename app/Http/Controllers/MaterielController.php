<?php

namespace App\Http\Controllers;

use App\Models\Achat;
use App\Models\AuditLog;
use App\Models\Categorie;
use App\Models\Marque;
use App\Models\Materiel;
use App\Models\Modele;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MaterielController extends Controller
{
    public function index()
    {
        $materiels = Materiel::with([
            'categorie',
            'achat.fournisseur',
            'marqueRel',
            'modeleRel',
            'affectations' => function ($q) {
                $q->occupantMateriel()->with('employe');
            },
        ])->withCount('affectations')->latest()->get()->map(function ($m) {
            $currentAffectation = $m->affectations->first();

            return [
                'id' => $m->id,
                'nom' => $m->nom,
                'marque' => $m->marque,
                'modele' => $m->modele,
                'numero_serie' => $m->numero_serie,
                'numero_inventaire' => $m->numero_inventaire,
                'caracteristique' => $m->caracteristique,
                'categorie_id' => $m->categorie_id,
                'categorie' => $m->categorie,
                'achat_id' => $m->achat_id,
                'achat' => $m->achat,
                'affectations_count' => $m->affectations_count,
                'is_disponible' => is_null($currentAffectation),
                'occupant' => $currentAffectation && $currentAffectation->employe
                    ? ($currentAffectation->employe->nom . ' ' . $currentAffectation->employe->prenom)
                    : null,
            ];
        });

        return Inertia::render('Materiels/Index', [
            'materiels' => $materiels,
            'categories' => Categorie::orderBy('nom_categorie')->get(),
            'achats' => Achat::with('fournisseur')->orderByDesc('date_achat')->get(),
            'marques' => Marque::with('modeles')->orderBy('nom_marque')->get(),
            'modeles' => Modele::with('marque')->orderBy('nom_modele')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'marque' => 'required|string|max:255',
            'modele' => 'required|string|max:255',
            'numero_serie' => 'required|string|unique:materiels,numero_serie',
            'numero_inventaire' => 'required|string|unique:materiels,numero_inventaire',
            'caracteristique' => 'nullable|string',
            'categorie_id' => 'required|exists:categories,id',
            'achat_id' => 'nullable|exists:achats,id',
            'marque_id' => 'nullable|exists:marques,id',
            'modele_id' => 'nullable|exists:modeles,id',
        ], [
            'numero_serie.unique' => 'Ce numéro de série existe déjà dans le parc informatique.',
            'numero_inventaire.unique' => 'Ce numéro d\'inventaire est déjà attribué à un autre équipement.',
            'nom.required' => 'Le nom du matériel est obligatoire.',
            'marque.required' => 'La marque est obligatoire.',
            'modele.required' => 'Le modèle est obligatoire.',
            'categorie_id.required' => 'Veuillez sélectionner une catégorie.',
        ]);

        $m = Materiel::create($validated);
        $m->load('achat');

        $achatInfo = $m->achat ? " (Achat: {$m->achat->numero_achat})" : "";
        AuditLog::record('Création', 'Matériels', "Ajout du matériel '{$m->nom}' (S/N: {$m->numero_serie}){$achatInfo}", $m);

        return redirect()->back()->with('success', "Matériel '{$m->nom}' ajouté avec succès au parc.");
    }

    public function update(Request $request, Materiel $materiel)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'marque' => 'required|string|max:255',
            'modele' => 'required|string|max:255',
            'numero_serie' => 'required|string|unique:materiels,numero_serie,' . $materiel->id,
            'numero_inventaire' => 'required|string|unique:materiels,numero_inventaire,' . $materiel->id,
            'caracteristique' => 'nullable|string',
            'categorie_id' => 'required|exists:categories,id',
            'achat_id' => 'nullable|exists:achats,id',
            'marque_id' => 'nullable|exists:marques,id',
            'modele_id' => 'nullable|exists:modeles,id',
        ], [
            'numero_serie.unique' => 'Ce numéro de série existe déjà dans le parc informatique.',
            'numero_inventaire.unique' => 'Ce numéro d\'inventaire est déjà attribué à un autre équipement.',
            'nom.required' => 'Le nom du matériel est obligatoire.',
            'marque.required' => 'La marque est obligatoire.',
            'modele.required' => 'Le modèle est obligatoire.',
            'categorie_id.required' => 'Veuillez sélectionner une catégorie.',
        ]);

        $materiel->update($validated);
        $materiel->load('achat');

        AuditLog::record('Modification', 'Matériels', "Modification du matériel '{$materiel->nom}' (S/N: {$materiel->numero_serie})", $materiel);

        return redirect()->back()->with('success', "Matériel '{$materiel->nom}' mis à jour avec succès.");
    }

    public function destroy(Materiel $materiel)
    {
        if ($materiel->affectations()->exists()) {
            return redirect()->back()->withErrors([
                'delete' => 'Impossible de supprimer : ce matériel a des affectations enregistrées.',
            ]);
        }

        $desc = "Suppression du matériel '{$materiel->nom}' (S/N: {$materiel->numero_serie})";
        $materiel->delete();

        AuditLog::record('Suppression', 'Matériels', $desc);

        return redirect()->back()->with('success', 'Matériel supprimé avec succès.');
    }

    /**
     * Download a ready-to-fill CSV/Excel template for bulk importing equipment
     */
    public function downloadTemplate(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="modele_import_materiels.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Microsoft Excel compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header row (semicolon delimiter for French/European Excel)
            fputcsv($handle, [
                'Nom du Materiel',
                'Marque',
                'Modele',
                'Numero de Serie',
                'Numero Inventaire',
                'Categorie',
                'Numero Achat',
                'Caracteristiques Techniques',
            ], ';');

            // Example sample rows
            fputcsv($handle, [
                'Dell Latitude 5540 Core i7',
                'Dell',
                'Latitude 5540',
                'SN-DELL-99881',
                'INV-26-8801',
                'PC Portable',
                'M-2026/01',
                'Intel Core i7-1365U, 16GB RAM, 512GB SSD NVMe',
            ], ';');

            fputcsv($handle, [
                'HP EliteBook 840 G10',
                'HP',
                'EliteBook 840 G10',
                'SN-HP-77612',
                'INV-26-8802',
                'PC Portable',
                'M-2026/02',
                'Intel Core i5-1345U, 16GB RAM, Windows 11 Pro',
            ], ';');

            fputcsv($handle, [
                'Écran Dell UltraSharp 27" 4K',
                'Dell',
                'UltraSharp U2723QE 4K',
                'SN-MON-44120',
                'INV-26-8803',
                'Écran / Moniteur',
                'M-2026/01',
                '27 Pouces 4K UHD IPS, USB-C 90W Hub',
            ], ';');

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Process bulk import of matériels from CSV/Excel file
     */
    public function bulkImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ], [
            'file.required' => 'Veuillez sélectionner un fichier CSV ou Excel.',
            'file.max' => 'Le fichier ne doit pas dépasser 10 Mo.',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();

        // Read entire content to detect delimiter & handle line breaks
        $content = file_get_contents($path);

        // Strip UTF-8 BOM if present
        if (str_starts_with($content, "\xEF\xBB\xBF")) {
            $content = substr($content, 3);
        }

        $lines = preg_split('/\r\n|\r|\n/', trim($content));
        if (count($lines) < 2) {
            return redirect()->back()->withErrors([
                'import' => 'Le fichier est vide ou ne contient aucune ligne de données.',
            ]);
        }

        // Auto-detect delimiter from the header row
        $firstLine = $lines[0];
        $delimiter = ';';
        if (substr_count($firstLine, ',') > substr_count($firstLine, ';')) {
            $delimiter = ',';
        } elseif (substr_count($firstLine, "\t") > substr_count($firstLine, ';')) {
            $delimiter = "\t";
        }

        $headers = str_getcsv($firstLine, $delimiter);
        $cleanHeaders = array_map(function ($h) {
            $clean = strtolower(trim($h));
            $clean = preg_replace('/[^a-z0-9]/', '', $clean);
            return $clean;
        }, $headers);

        // Header mapping indices
        $colNom = -1;
        $colMarque = -1;
        $colModele = -1;
        $colSerie = -1;
        $colInv = -1;
        $colCat = -1;
        $colAchat = -1;
        $colSpecs = -1;

        foreach ($cleanHeaders as $idx => $header) {
            if (str_contains($header, 'nom') || str_contains($header, 'designation')) $colNom = $idx;
            elseif (str_contains($header, 'marque') || str_contains($header, 'constructeur')) $colMarque = $idx;
            elseif (str_contains($header, 'modele')) $colModele = $idx;
            elseif (str_contains($header, 'serie') || str_contains($header, 'sn')) $colSerie = $idx;
            elseif (str_contains($header, 'inventaire') || str_contains($header, 'inv')) $colInv = $idx;
            elseif (str_contains($header, 'categorie') || str_contains($header, 'cat')) $colCat = $idx;
            elseif (str_contains($header, 'achat') || str_contains($header, 'marche')) $colAchat = $idx;
            elseif (str_contains($header, 'caracteristique') || str_contains($header, 'spec') || str_contains($header, 'desc')) $colSpecs = $idx;
        }

        // Fallbacks if headers are in standard order
        if ($colNom === -1 && isset($headers[0])) $colNom = 0;
        if ($colMarque === -1 && isset($headers[1])) $colMarque = 1;
        if ($colModele === -1 && isset($headers[2])) $colModele = 2;
        if ($colSerie === -1 && isset($headers[3])) $colSerie = 3;
        if ($colInv === -1 && isset($headers[4])) $colInv = 4;
        if ($colCat === -1 && isset($headers[5])) $colCat = 5;
        if ($colAchat === -1 && isset($headers[6])) $colAchat = 6;
        if ($colSpecs === -1 && isset($headers[7])) $colSpecs = 7;

        $categoriesCache = Categorie::all()->keyBy(fn($c) => mb_strtolower(trim($c->nom_categorie)));
        $achatsCache = Achat::all()->keyBy(fn($a) => mb_strtolower(trim($a->numero_achat)));
        $marquesCache = Marque::with('modeles')->get()->keyBy(fn($m) => mb_strtolower(trim($m->nom_marque)));

        $existingSerials = Materiel::pluck('numero_serie')->map(fn($s) => mb_strtolower(trim($s)))->toArray();
        $existingInvs = Materiel::pluck('numero_inventaire')->map(fn($i) => mb_strtolower(trim($i)))->toArray();

        $seenSerials = array_flip($existingSerials);
        $seenInvs = array_flip($existingInvs);

        $insertedCount = 0;
        $skippedErrors = [];

        DB::beginTransaction();

        try {
            for ($i = 1; $i < count($lines); $i++) {
                $lineContent = trim($lines[$i]);
                if (empty($lineContent)) continue;

                $row = str_getcsv($lineContent, $delimiter);
                $rowNum = $i + 1;

                $nom = trim($row[$colNom] ?? '');
                $marque = trim($row[$colMarque] ?? '');
                $modele = trim($row[$colModele] ?? '');
                $serie = trim($row[$colSerie] ?? '');
                $inv = trim($row[$colInv] ?? '');
                $catName = trim($row[$colCat] ?? '');
                $achatNum = trim($row[$colAchat] ?? '');
                $specs = trim($row[$colSpecs] ?? '');

                if (empty($nom) || empty($serie) || empty($inv)) {
                    $skippedErrors[] = "Ligne {$rowNum} ignorée : Nom, N° Série et N° Inventaire sont obligatoires.";
                    continue;
                }

                $lowerSerie = mb_strtolower($serie);
                $lowerInv = mb_strtolower($inv);

                if (isset($seenSerials[$lowerSerie])) {
                    $skippedErrors[] = "Ligne {$rowNum} ignorée : Le numéro de série '{$serie}' existe déjà ou est en double dans le fichier.";
                    continue;
                }

                if (isset($seenInvs[$lowerInv])) {
                    $skippedErrors[] = "Ligne {$rowNum} ignorée : Le numéro d'inventaire '{$inv}' existe déjà ou est en double dans le fichier.";
                    continue;
                }

                // Resolve Category (find or create)
                $lowerCat = mb_strtolower($catName);
                if (!empty($catName) && isset($categoriesCache[$lowerCat])) {
                    $categorieId = $categoriesCache[$lowerCat]->id;
                } elseif (!empty($catName)) {
                    $newCat = Categorie::create(['nom_categorie' => $catName]);
                    $categoriesCache[$lowerCat] = $newCat;
                    $categorieId = $newCat->id;
                } else {
                    // Default to first category or create 'Standard'
                    $defaultCat = $categoriesCache->first() ?? Categorie::create(['nom_categorie' => 'Équipement Général']);
                    $categorieId = $defaultCat->id;
                }

                // Resolve Achat if provided
                $achatId = null;
                $lowerAchat = mb_strtolower($achatNum);
                if (!empty($achatNum) && isset($achatsCache[$lowerAchat])) {
                    $achatId = $achatsCache[$lowerAchat]->id;
                }

                // Resolve Marque & Modele IDs if available
                $marqueId = null;
                $modeleId = null;
                $lowerMarque = mb_strtolower($marque);
                if (!empty($marque) && isset($marquesCache[$lowerMarque])) {
                    $marqueObj = $marquesCache[$lowerMarque];
                    $marqueId = $marqueObj->id;

                    $lowerModele = mb_strtolower($modele);
                    $modObj = $marqueObj->modeles->first(fn($m) => mb_strtolower(trim($m->nom_modele)) === $lowerModele);
                    if ($modObj) {
                        $modeleId = $modObj->id;
                    }
                }

                Materiel::create([
                    'nom' => $nom,
                    'marque' => $marque ?: 'Générique',
                    'modele' => $modele ?: 'Standard',
                    'numero_serie' => $serie,
                    'numero_inventaire' => $inv,
                    'caracteristique' => $specs,
                    'categorie_id' => $categorieId,
                    'achat_id' => $achatId,
                    'marque_id' => $marqueId,
                    'modele_id' => $modeleId,
                ]);

                $seenSerials[$lowerSerie] = true;
                $seenInvs[$lowerInv] = true;
                $insertedCount++;
            }

            DB::commit();

            AuditLog::record(
                'Création',
                'Matériels',
                "Importation en masse (Bulk Import) de {$insertedCount} matériel(s) via fichier Excel/CSV"
            );

            $msg = "Importation réussie : {$insertedCount} matériel(s) ajouté(s) avec succès.";
            if (count($skippedErrors) > 0) {
                $msg .= " (" . count($skippedErrors) . " ligne(s) ignorée(s)).";
            }

            return redirect()->back()->with('success', $msg)->with('importErrors', $skippedErrors);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors([
                'import' => "Erreur lors de l'importation en masse : " . $e->getMessage(),
            ]);
        }
    }
}