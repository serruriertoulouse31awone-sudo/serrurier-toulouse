<?php
// Avis clients de Serrurier Toulouse : fonctions communes à deposer.php, liste.php et gerer.php.
// Les réglages (base de données, adresses, secret) ne sont pas dans le site : avis-config.php, un dossier
// au-dessus de la racine web (modèle : config/avis-config.exemple.php du dépôt). En local, la variable
// d'environnement AVIS_CONFIG donne un autre chemin.
declare(strict_types=1);

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

date_default_timezone_set('Europe/Paris');
mb_internal_encoding('UTF-8');

// Motifs de refus ou de retrait : la même liste figure sur la page /avis-clients (src/pages/avis-clients.astro).
const MOTIFS = [
    'sans-intervention' => "L'avis ne correspond à aucune intervention que nous avons pu retrouver.",
    'hors-sujet' => "L'avis ne porte pas sur une intervention de Serrurier Toulouse.",
    'propos' => "L'avis contient des propos injurieux, diffamatoires, discriminatoires ou menaçants.",
    'donnees' => "L'avis contient des données personnelles (nom complet, adresse, téléphone) ou des coordonnées.",
    'publicite' => "L'avis contient de la publicité ou un lien.",
    'doublon' => "Un avis a déjà été déposé pour la même intervention.",
    'demande-auteur' => "Vous nous avez demandé de retirer votre avis.",
    'autre' => 'Autre motif',
];

function chemin_reglages(): string
{
    return getenv('AVIS_CONFIG') ?: dirname(__DIR__, 2) . '/avis-config.php';
}

function reglages(): array
{
    static $r = null;
    if ($r === null) {
        $chemin = chemin_reglages();
        if (!is_file($chemin)) {
            error_log('avis : réglages introuvables (' . $chemin . ')');
            http_response_code(503);
            exit('Service des avis momentanément indisponible.');
        }
        $r = require $chemin;
    }
    return $r;
}

function base(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $b = reglages()['base'];
        $pdo = new PDO(
            sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $b['hote'], $b['port'] ?? 3306, $b['nom']),
            $b['utilisateur'],
            $b['mot_de_passe'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false],
        );
        $pdo->exec("CREATE TABLE IF NOT EXISTS avis (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            statut ENUM('attente','publie','refuse') NOT NULL DEFAULT 'attente',
            prenom VARCHAR(40) NOT NULL,
            nom VARCHAR(60) NOT NULL,
            email VARCHAR(120) NOT NULL,
            commune VARCHAR(80) NOT NULL,
            date_intervention DATE NOT NULL,
            note TINYINT UNSIGNED NOT NULL,
            texte TEXT NOT NULL,
            reponse TEXT NULL,
            motif VARCHAR(400) NULL,
            depose_le DATETIME NOT NULL,
            publie_le DATETIME NULL,
            repondu_le DATETIME NULL,
            refuse_le DATETIME NULL,
            rappel_le DATETIME NULL,
            ip_empreinte CHAR(64) NULL,
            jeton CHAR(64) NOT NULL,
            KEY statut_date (statut, publie_le),
            KEY envois (ip_empreinte, depose_le)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }
    return $pdo;
}

function maintenant(): string
{
    return date('Y-m-d H:i:s');
}

function e(?string $texte): string
{
    return htmlspecialchars((string) $texte, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function veut_json(): bool
{
    return str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
}

function repondre_json(array $donnees, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// L'adresse du visiteur ne sert qu'à limiter les envois ; elle n'est gardée que sous forme d'empreinte, 30 jours.
function empreinte_ip(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        // derrière un relais : la dernière adresse est celle qu'il a vue, la première peut être inventée par le visiteur
        $chaine = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
        $relais = trim((string) end($chaine));
        if (filter_var($relais, FILTER_VALIDATE_IP)) {
            $ip = $relais;
        }
    }
    return hash_hmac('sha256', $ip, reglages()['secret']);
}

// Texte saisi : UTF-8 valide, espaces et retours à la ligne ramenés à une espace, coupé à la longueur + 1
// (un texte trop long reste ainsi détectable par l'appelant).
function nettoyer(mixed $valeur, int $longueur): string
{
    if (!is_string($valeur) || !mb_check_encoding($valeur, 'UTF-8')) {
        return '';
    }
    return mb_substr(trim((string) preg_replace('/[\p{Cc}\p{Cf}\s]+/u', ' ', $valeur)), 0, $longueur + 1);
}

function nom_public(array $avis): string
{
    return $avis['prenom'] . ' ' . mb_strtoupper(mb_substr($avis['nom'], 0, 1)) . '.';
}

function date_longue(?string $date): string
{
    if (!$date) {
        return '';
    }
    $mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    $t = strtotime($date);
    return (int) date('j', $t) . ' ' . $mois[(int) date('n', $t) - 1] . ' ' . date('Y', $t);
}

function lien_gestion(array $avis, string $ancre = ''): string
{
    return rtrim(reglages()['site'], '/') . '/avis/gerer.php?id=' . $avis['id'] . '&jeton=' . $avis['jeton'] . ($ancre ? '#' . $ancre : '');
}

function envoyer_courriel(string $a, string $sujet, string $texte, ?string $html = null, ?string $repondre_a = null): bool
{
    $r = reglages();
    $de = $r['expediteur'];
    $entetes = [
        'From' => mb_encode_mimeheader($r['nom_expediteur'], 'UTF-8', 'Q') . ' <' . $de . '>',
        'Reply-To' => $repondre_a ?? $de,
        'MIME-Version' => '1.0',
        'Date' => date(DATE_RFC2822),
        'Message-ID' => '<' . bin2hex(random_bytes(12)) . '@' . substr((string) strrchr($de, '@'), 1) . '>',
    ];
    if ($html === null) {
        $entetes['Content-Type'] = 'text/plain; charset=UTF-8';
        $entetes['Content-Transfer-Encoding'] = 'base64';
        $corps = chunk_split(base64_encode($texte));
    } else {
        $limite = 'avis-' . bin2hex(random_bytes(8));
        $entetes['Content-Type'] = 'multipart/alternative; boundary="' . $limite . '"';
        $corps = "--$limite\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($texte))
            . "--$limite\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($html))
            . "--$limite--\r\n";
    }
    $sujet = mb_encode_mimeheader($sujet, 'UTF-8', 'B', "\r\n");

    // En local seulement : le message est écrit dans un dossier au lieu de partir. Jamais en production.
    if (!empty($r['capture'])) {
        if (!is_dir($r['capture'])) {
            mkdir($r['capture'], 0700, true);
        }
        $lignes = "To: $a\r\nSubject: $sujet\r\n";
        foreach ($entetes as $cle => $valeur) {
            $lignes .= "$cle: $valeur\r\n";
        }
        $fichier = $r['capture'] . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.eml';
        return file_put_contents($fichier, $lignes . "\r\n" . $corps) !== false;
    }

    $parti = mail($a, $sujet, $corps, $entetes, '-f' . $de);
    if (!$parti) {
        error_log('avis : mail() a refusé le message pour ' . $a);
    }
    return $parti;
}

// Gabarit commun des e-mails HTML : un bloc blanc, des boutons, rien de distant (aucune image, aucun suivi).
function courriel_html(string $titre, string $contenu): string
{
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>' . e($titre) . '</title></head>'
        . '<body style="margin:0;padding:24px;background:#f3effb;font-family:Arial,Helvetica,sans-serif;color:#1a0d2e">'
        . '<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px">'
        . '<h1 style="font-size:20px;margin:0 0 16px">' . e($titre) . '</h1>' . $contenu
        . '</div></body></html>';
}

function bouton(string $lien, string $texte, string $fond = '#5020b8'): string
{
    return '<a href="' . e($lien) . '" style="display:inline-block;margin:6px 8px 6px 0;padding:12px 20px;border-radius:8px;background:'
        . $fond . ';color:#fff;font-weight:bold;text-decoration:none">' . e($texte) . '</a>';
}

// Une fois par jour au plus, au passage d'un visiteur : suppression des avis échus, rappel des avis en attente.
function entretien(): void
{
    $marque = dirname(chemin_reglages()) . '/avis-entretien.txt';
    if (is_file($marque) && filemtime($marque) > time() - 86400) {
        return;
    }
    @touch($marque);

    $pdo = base();
    $jour = new DateTimeImmutable();
    $pdo->prepare("DELETE FROM avis WHERE statut = 'publie' AND publie_le < ?")->execute([$jour->modify('-3 years')->format('Y-m-d H:i:s')]);
    $pdo->prepare("DELETE FROM avis WHERE statut = 'refuse' AND refuse_le < ?")->execute([$jour->modify('-6 months')->format('Y-m-d H:i:s')]);
    $pdo->prepare('UPDATE avis SET ip_empreinte = NULL WHERE depose_le < ?')->execute([$jour->modify('-30 days')->format('Y-m-d H:i:s')]);

    $requete = $pdo->prepare("SELECT * FROM avis WHERE statut = 'attente' AND depose_le < ? AND (rappel_le IS NULL OR rappel_le < ?) ORDER BY depose_le");
    $limite = $jour->modify('-3 days')->format('Y-m-d H:i:s');
    $requete->execute([$limite, $limite]);
    $attente = $requete->fetchAll();
    if (!$attente) {
        return;
    }
    $texte = count($attente) . " avis attendent votre décision. Ils doivent être publiés ou refusés dans les 7 jours qui suivent leur dépôt.\n\n";
    $html = '<p>' . count($attente) . ' avis attendent votre décision. Ils doivent être publiés ou refusés dans les 7 jours qui suivent leur dépôt.</p>';
    foreach ($attente as $a) {
        $ligne = nom_public($a) . ' (' . $a['commune'] . '), ' . $a['note'] . '/5, déposé le ' . date_longue($a['depose_le']);
        $texte .= "- $ligne :\n  " . lien_gestion($a) . "\n";
        $html .= '<p style="margin:16px 0 4px"><strong>' . e($ligne) . '</strong></p>' . bouton(lien_gestion($a), 'Voir et décider');
    }
    $titre = count($attente) . ' avis en attente de votre décision';
    if (envoyer_courriel(reglages()['destinataire'], $titre, $texte, courriel_html($titre, $html))) {
        $ids = implode(',', array_map('intval', array_column($attente, 'id')));
        $pdo->prepare("UPDATE avis SET rappel_le = ? WHERE id IN ($ids)")->execute([maintenant()]);
    }
}
