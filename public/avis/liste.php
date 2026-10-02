<?php
// Avis publiés, du plus récent au plus ancien : prénom et initiale du nom, note, texte, dates, réponse.
// Ni l'e-mail ni la commune ne sortent d'ici.
declare(strict_types=1);
require __DIR__ . '/_commun.php';

entretien();

$pdo = base();
$avis = $pdo->query("SELECT prenom, nom, note, texte, publie_le, date_intervention, reponse, repondu_le
    FROM avis WHERE statut = 'publie' ORDER BY publie_le DESC, id DESC LIMIT 60")->fetchAll();
$bilan = $pdo->query("SELECT COUNT(*) AS total, AVG(note) AS moyenne FROM avis WHERE statut = 'publie'")->fetch();

header('Cache-Control: public, max-age=60');
repondre_json([
    'avis' => array_map(fn(array $a) => [
        'prenom' => nom_public($a),
        'note' => (int) $a['note'],
        'texte' => $a['texte'],
        'publie_le' => substr($a['publie_le'], 0, 10),
        'intervention' => substr($a['date_intervention'], 0, 7),
        'reponse' => $a['reponse'],
        'repondu_le' => $a['repondu_le'] ? substr($a['repondu_le'], 0, 10) : null,
    ], $avis),
    'total' => (int) $bilan['total'],
    'moyenne' => $bilan['total'] ? round((float) $bilan['moyenne'], 1) : null,
]);
