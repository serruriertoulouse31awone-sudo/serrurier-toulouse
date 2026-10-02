<?php
// Page de décision, ouverte depuis l'e-mail : publier, refuser (motif envoyé à l'auteur), répondre, retirer.
// Le lien porte un jeton propre à l'avis. Ouvrir la page ne change rien : seuls les boutons (POST) agissent,
// car les messageries visitent parfois les liens d'un e-mail pour les analyser.
declare(strict_types=1);
require __DIR__ . '/_commun.php';

header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');

function page(string $titre, string $contenu): never
{
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex, nofollow"><title>' . e($titre) . ' - Avis Serrurier Toulouse</title><style>'
        . 'body{margin:0;background:#f3effb;font-family:Arial,Helvetica,sans-serif;color:#1a0d2e;line-height:1.55}'
        . 'main{max-width:40rem;margin:0 auto;padding:1.5rem 1rem 3rem}h1{font-size:1.45rem;margin:.5rem 0 1rem}'
        . 'h2{font-size:1.1rem;margin:0 0 .75rem}section,.carte{background:#fff;border-radius:12px;padding:1.2rem;margin:0 0 1rem}'
        . 'dl{display:grid;grid-template-columns:auto 1fr;gap:.3rem 1rem;margin:0 0 1rem}dt{font-weight:bold}dd{margin:0}'
        . 'blockquote{margin:0;padding:.8rem 1rem;border-left:4px solid #FFBE00;background:#faf7ff}'
        . '.etat{display:inline-block;padding:.3rem .8rem;border-radius:999px;font-weight:bold;font-size:.9rem}'
        . '.attente{background:#fff3cd;color:#6b4e00}.publie{background:#dff3e6;color:#1e6b3a}.refuse{background:#fbe2e0;color:#8c1d16}'
        . '.message{background:#dff3e6;color:#1e6b3a;font-weight:bold}.erreur{background:#fbe2e0;color:#8c1d16;font-weight:bold}'
        . 'fieldset{border:0;padding:0;margin:0 0 .75rem}legend{font-weight:bold;margin-bottom:.4rem}'
        . 'label{display:block;margin:.35rem 0}.choix{display:flex;gap:.5rem;align-items:flex-start}.choix input{margin-top:.3rem}'
        . 'textarea{width:100%;box-sizing:border-box;font:inherit;padding:.6rem;border:1.5px solid #6b5b86;border-radius:8px;min-height:6rem}'
        . 'button{font:inherit;font-weight:bold;border:0;border-radius:8px;padding:.8rem 1.3rem;color:#fff;background:#5020b8;cursor:pointer}'
        . 'button.vert{background:#1e6b3a}button.rouge{background:#b3261e}'
        . ':focus-visible{outline:3px solid #844DFB;outline-offset:2px}.aide{font-size:.88rem;color:#5b4a75}'
        . '</style></head><body><main><p class="aide">Serrurier Toulouse · avis clients</p><h1>' . e($titre) . '</h1>' . $contenu . '</main></body></html>';
    exit;
}

function charger(int $id): ?array
{
    $q = base()->prepare('SELECT * FROM avis WHERE id = ?');
    $q->execute([$id]);
    return $q->fetch() ?: null;
}

function prevenir_auteur(array $avis, string $motif, bool $retrait): bool
{
    $phrase = $retrait
        ? 'Votre avis, publié le ' . date_longue($avis['publie_le']) . ', a été retiré de notre site, pour le motif suivant :'
        : "Merci d'avoir pris le temps de donner votre avis. Nous ne pouvons pas le publier, pour le motif suivant :";
    $rappel = 'Votre avis, déposé le ' . date_longue($avis['depose_le']) . ' :';
    $site = rtrim(reglages()['site'], '/');
    $texte = "Bonjour {$avis['prenom']},\n\n$phrase\n$motif\n\n$rappel\n« {$avis['texte']} »\n\n"
        . "Pour toute question, répondez simplement à ce message.\n\nSerrurier Toulouse\n$site\n";
    $html = '<p>Bonjour ' . e($avis['prenom']) . ',</p><p>' . e($phrase) . '</p><p><strong>' . e($motif) . '</strong></p>'
        . '<p>' . e($rappel) . '</p><blockquote style="margin:0 0 16px;padding:12px 16px;border-left:4px solid #FFBE00;background:#faf7ff">'
        . e($avis['texte']) . '</blockquote><p>Pour toute question, répondez simplement à ce message.</p>'
        . '<p>Serrurier Toulouse<br><a href="' . e($site) . '" style="color:#5020b8">' . e($site) . '</a></p>';
    return envoyer_courriel($avis['email'], 'Votre avis sur Serrurier Toulouse', $texte, courriel_html('Votre avis sur Serrurier Toulouse', $html));
}

function formulaire_motif(string $action, string $bouton): string
{
    $choix = '';
    foreach (MOTIFS as $cle => $libelle) {
        $choix .= '<label class="choix"><input type="radio" name="motif" value="' . e($cle) . '" required><span>' . e($libelle) . '</span></label>';
    }
    return '<form method="post"><input type="hidden" name="action" value="' . $action . '">'
        . '<fieldset><legend>Motif, envoyé à l\'auteur par e-mail</legend>' . $choix . '</fieldset>'
        . '<label for="precision-' . $action . '">Précision (obligatoire pour « Autre motif »)</label>'
        . '<textarea id="precision-' . $action . '" name="precision" maxlength="300"></textarea>'
        . '<p><button class="rouge">' . e($bouton) . '</button></p></form>';
}

$id = (int) ($_GET['id'] ?? 0);
$jeton = (string) ($_GET['jeton'] ?? '');
$avis = $id ? charger($id) : null;
if (!$avis || !hash_equals($avis['jeton'], $jeton)) {
    http_response_code(404);
    page('Lien non valable', '<section><p>Ce lien ne correspond à aucun avis. L\'avis a peut-être été supprimé à la fin de sa durée de conservation.</p></section>');
}

$message = '';
$erreur = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string) ($_POST['action'] ?? '');
    $pdo = base();
    if ($action === 'publier' && $avis['statut'] === 'attente') {
        $pdo->prepare("UPDATE avis SET statut = 'publie', publie_le = ? WHERE id = ?")->execute([maintenant(), $id]);
        $message = 'Avis publié : il apparaît sur le site d\'ici une minute.';
    } elseif (($action === 'refuser' && $avis['statut'] === 'attente') || ($action === 'retirer' && $avis['statut'] === 'publie')) {
        $cle = (string) ($_POST['motif'] ?? '');
        $precision = nettoyer($_POST['precision'] ?? '', 300);
        if (!isset(MOTIFS[$cle]) || ($cle === 'autre' && $precision === '') || mb_strlen($precision) > 300) {
            $erreur = 'Choisissez un motif, et précisez-le si vous choisissez « Autre motif » (300 caractères au plus).';
        } else {
            $motif = $cle === 'autre' ? $precision : MOTIFS[$cle] . ($precision !== '' ? ' ' . $precision : '');
            $pdo->prepare("UPDATE avis SET statut = 'refuse', motif = ?, refuse_le = ? WHERE id = ?")->execute([$motif, maintenant(), $id]);
            $parti = prevenir_auteur($avis, $motif, $action === 'retirer');
            $message = ($action === 'retirer' ? 'Avis retiré du site. ' : 'Avis refusé. ')
                . ($parti ? 'Son auteur a reçu le motif par e-mail.' : 'Attention : l\'e-mail à son auteur n\'est pas parti, écrivez-lui à ' . $avis['email'] . '.');
            if (!$parti) {
                $erreur = $message;
                $message = '';
            }
        }
    } elseif ($action === 'repondre' && $avis['statut'] !== 'refuse') {
        $reponse = nettoyer($_POST['reponse'] ?? '', 600);
        if (mb_strlen($reponse) > 600) {
            $erreur = 'La réponse ne doit pas dépasser 600 caractères.';
        } else {
            $pdo->prepare('UPDATE avis SET reponse = ?, repondu_le = ? WHERE id = ?')
                ->execute([$reponse === '' ? null : $reponse, $reponse === '' ? null : maintenant(), $id]);
            $message = $reponse === '' ? 'Réponse supprimée.' : ($avis['statut'] === 'publie'
                ? 'Réponse enregistrée : elle s\'affiche sous l\'avis.' : 'Réponse enregistrée : elle s\'affichera sous l\'avis une fois publié.');
        }
    } else {
        $erreur = 'Cette action n\'est plus possible : l\'avis a changé d\'état entre-temps.';
    }
    $avis = charger($id);
}

$etat = match ($avis['statut']) {
    'attente' => '<span class="etat attente">En attente de votre décision</span>',
    'publie' => '<span class="etat publie">Publié le ' . e(date_longue($avis['publie_le'])) . '</span>',
    default => '<span class="etat refuse">Refusé le ' . e(date_longue($avis['refuse_le'])) . '</span>',
};
$html = ($message ? '<section class="message" role="status">' . e($message) . '</section>' : '')
    . ($erreur ? '<section class="erreur" role="alert">' . e($erreur) . '</section>' : '')
    . '<div class="carte"><p>' . $etat . '</p><dl>'
    . '<dt>Note</dt><dd><span aria-hidden="true" style="color:#b38600">' . str_repeat('★', (int) $avis['note']) . str_repeat('☆', 5 - (int) $avis['note']) . '</span> ' . (int) $avis['note'] . '/5</dd>'
    . '<dt>Auteur</dt><dd>' . e($avis['prenom'] . ' ' . $avis['nom']) . ' (publié : ' . e(nom_public($avis)) . ')</dd>'
    . '<dt>E-mail</dt><dd><a href="mailto:' . e($avis['email']) . '">' . e($avis['email']) . '</a></dd>'
    . '<dt>Commune</dt><dd>' . e($avis['commune']) . '</dd>'
    . '<dt>Intervention</dt><dd>' . e(date_longue($avis['date_intervention'])) . '</dd>'
    . '<dt>Déposé le</dt><dd>' . e(date_longue($avis['depose_le'])) . ' à ' . e(substr($avis['depose_le'], 11, 5)) . '</dd>'
    . '</dl><blockquote>' . e($avis['texte']) . '</blockquote>'
    . ($avis['statut'] === 'refuse' ? '<p><strong>Motif envoyé à l\'auteur :</strong> ' . e($avis['motif']) . '</p>' : '')
    . '</div>';

if ($avis['statut'] === 'attente') {
    $html .= '<section id="publier"><h2>Publier</h2><p class="aide">L\'avis s\'affiche sur le site avec le prénom, l\'initiale du nom, la note, le texte, la date de publication et le mois de l\'intervention.</p>'
        . '<form method="post"><input type="hidden" name="action" value="publier"><button class="vert">Publier cet avis</button></form></section>'
        . '<section id="refuser"><h2>Refuser</h2>' . formulaire_motif('refuser', 'Refuser et prévenir l\'auteur') . '</section>';
}
if ($avis['statut'] !== 'refuse') {
    $html .= '<section id="repondre"><h2>Répondre</h2><form method="post"><input type="hidden" name="action" value="repondre">'
        . '<label for="reponse">Votre réponse, visible sous l\'avis avec sa date (vide pour la supprimer)</label>'
        . '<textarea id="reponse" name="reponse" maxlength="600">' . e($avis['reponse']) . '</textarea>'
        . '<p><button>Enregistrer la réponse</button></p></form></section>';
}
if ($avis['statut'] === 'publie') {
    $html .= '<section id="retirer"><h2>Retirer du site</h2>' . formulaire_motif('retirer', 'Retirer et prévenir l\'auteur') . '</section>';
}

page('Avis de ' . nom_public($avis), $html);
