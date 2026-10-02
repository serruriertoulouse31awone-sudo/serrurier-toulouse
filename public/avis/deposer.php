<?php
// Dépôt d'un avis : contrôle des champs, limite d'envois, enregistrement « en attente », e-mail au serrurier.
// Rien n'est publié ici : la publication se décide depuis le lien de l'e-mail (gerer.php).
declare(strict_types=1);
require __DIR__ . '/_commun.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    exit;
}

function finir(bool $ok, string $message, array $erreurs = [], int $code = 200): never
{
    if (veut_json()) {
        $lien = $ok ? (reglages()['lien_google'] ?: null) : null;
        repondre_json(['ok' => $ok, 'message' => $message, 'erreurs' => $erreurs ?: null, 'lien_google' => $lien], $code);
    }
    // Sans JavaScript : une page simple, puis retour au site.
    http_response_code($code);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex"><title>Votre avis - Serrurier Toulouse</title></head>'
        . '<body style="font-family:Arial,Helvetica,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem;color:#1a0d2e;line-height:1.6">'
        . '<h1 style="font-size:1.4rem">' . ($ok ? 'Merci pour votre avis' : 'Votre avis n\'a pas pu être envoyé') . '</h1><p>' . e($message) . '</p>';
    if ($erreurs) {
        echo '<ul>' . implode('', array_map(fn($m) => '<li>' . e($m) . '</li>', $erreurs)) . '</ul>';
    }
    echo '<p><a href="/#avis" style="color:#5020b8;font-weight:bold">' . ($ok ? 'Revenir au site' : 'Revenir au formulaire') . '</a></p></body></html>';
    exit;
}

function champ(string $nom, int $longueur): string
{
    return nettoyer($_POST[$nom] ?? '', $longueur);
}

// Champ piège, invisible pour un visiteur : seul un robot le remplit. On lui répond comme si de rien n'était.
if (($_POST['site'] ?? '') !== '') {
    finir(true, 'Merci ! Votre avis sera lu avant publication, sous 7 jours au plus.');
}

$prenom = champ('prenom', 40);
$nom = champ('nom', 60);
$email = champ('email', 120);
$commune = champ('commune', 80);
$date = champ('date_intervention', 10);
$note = filter_var($_POST['note'] ?? '', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 5]]);
$texte = champ('texte', 600);

$erreurs = [];
if (!preg_match("/^\\p{L}[\\p{L}\\p{M}' .-]{0,39}$/u", $prenom)) {
    $erreurs['prenom'] = 'Indiquez votre prénom.';
}
if (!preg_match("/^\\p{L}[\\p{L}\\p{M}' .-]{0,59}$/u", $nom)) {
    $erreurs['nom'] = 'Indiquez votre nom.';
}
if (strlen($email) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erreurs['email'] = 'Indiquez une adresse e-mail valide.';
}
if (!preg_match("/^[\\p{L}\\p{N}][\\p{L}\\p{M}\\p{N}' .()-]{1,79}$/u", $commune)) {
    $erreurs['commune'] = 'Indiquez la commune de l\'intervention.';
}
$jour = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
$aujourdhui = new DateTimeImmutable('today');
if (!$jour || $jour->format('Y-m-d') !== $date || $jour > $aujourdhui || $jour < $aujourdhui->modify('-2 years')) {
    $erreurs['date_intervention'] = 'Indiquez la date de l\'intervention (dans les deux dernières années).';
}
if ($note === false) {
    $erreurs['note'] = 'Choisissez une note de 1 à 5.';
}
$longueur = mb_strlen($texte);
if ($longueur < 20 || $longueur > 600) {
    $erreurs['texte'] = 'Votre avis doit faire entre 20 et 600 caractères.';
} elseif (preg_match('~(https?://|www\.)~i', $texte)) {
    $erreurs['texte'] = 'Les liens ne sont pas acceptés dans un avis.';
}
if (($_POST['accord'] ?? '') !== '1') {
    $erreurs['accord'] = 'Cochez la case qui autorise la publication de votre avis.';
}
if ($erreurs) {
    finir(false, 'Merci de vérifier le formulaire.', $erreurs, 422);
}

$pdo = base();
$empreinte = empreinte_ip();
$compter = $pdo->prepare('SELECT COUNT(*) FROM avis WHERE ip_empreinte = ? AND depose_le > ?');
$compter->execute([$empreinte, date('Y-m-d H:i:s', time() - 3600)]);
$derniere_heure = (int) $compter->fetchColumn();
$compter->execute([$empreinte, date('Y-m-d H:i:s', time() - 86400)]);
$dernier_jour = (int) $compter->fetchColumn();
if ($derniere_heure >= 3 || $dernier_jour >= 6) {
    finir(false, 'Trop d\'avis envoyés depuis votre connexion. Réessayez plus tard.', [], 429);
}
if ((int) $pdo->query("SELECT COUNT(*) FROM avis WHERE statut = 'attente'")->fetchColumn() >= 50) {
    finir(false, 'Le dépôt d\'avis est momentanément suspendu. Réessayez dans quelques jours.', [], 503);
}

$avis = [
    'prenom' => $prenom, 'nom' => $nom, 'email' => $email, 'commune' => $commune, 'date_intervention' => $date,
    'note' => $note, 'texte' => $texte, 'depose_le' => maintenant(), 'ip_empreinte' => $empreinte, 'jeton' => bin2hex(random_bytes(32)),
];
$pdo->prepare('INSERT INTO avis (' . implode(',', array_keys($avis)) . ') VALUES (' . implode(',', array_fill(0, count($avis), '?')) . ')')
    ->execute(array_values($avis));
$avis['id'] = (int) $pdo->lastInsertId();

$qui = nom_public($avis) . ' (' . $commune . ')';
$titre = "Nouvel avis $note/5 de $qui à valider";
$details = "Déposé le " . date_longue($avis['depose_le']) . ' à ' . date('H:i') . "\nNote : $note/5\nDe : $prenom $nom <$email>\n"
    . "Commune : $commune\nIntervention du : " . date_longue($date) . "\n\n« $texte »\n\n";
$texte_courriel = $details . "Rien n'est publié sans votre accord. Pour publier, refuser ou répondre :\n" . lien_gestion($avis) . "\n";
$html = '<p style="font-size:22px;color:#b38600;margin:0 0 8px">' . str_repeat('★', $note) . str_repeat('☆', 5 - $note) . '</p>'
    . '<p style="margin:0 0 4px"><strong>' . e("$prenom $nom") . '</strong> &lt;' . e($email) . '&gt;</p>'
    . '<p style="margin:0 0 4px">Commune : ' . e($commune) . ' · intervention du ' . e(date_longue($date)) . '</p>'
    . '<p style="margin:0 0 16px;color:#5b4a75">Déposé le ' . e(date_longue($avis['depose_le'])) . ' à ' . date('H:i') . '</p>'
    . '<blockquote style="margin:0 0 20px;padding:12px 16px;border-left:4px solid #FFBE00;background:#faf7ff">' . nl2br(e($texte)) . '</blockquote>'
    . '<p style="margin:0 0 8px">Rien n\'est publié sans votre accord :</p>'
    . bouton(lien_gestion($avis, 'publier'), 'Publier', '#1e6b3a') . bouton(lien_gestion($avis, 'refuser'), 'Refuser', '#b3261e')
    . bouton(lien_gestion($avis, 'repondre'), 'Répondre')
    . '<p style="margin:16px 0 0;font-size:13px;color:#5b4a75">Pour écrire au client, répondez simplement à cet e-mail.</p>';
envoyer_courriel(reglages()['destinataire'], $titre, $texte_courriel, courriel_html($titre, $html), $email);

finir(true, 'Merci ! Votre avis sera lu avant publication, sous 7 jours au plus.');
