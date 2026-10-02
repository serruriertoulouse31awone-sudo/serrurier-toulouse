<?php
// Modèle des réglages du système d'avis. Sur l'hébergement OVH, la copie remplie s'appelle avis-config.php
// et se pose UN DOSSIER AU-DESSUS de la racine du site (à côté du dossier www/, pas dedans) : elle n'est
// ainsi jamais servie sur le web. Elle ne va jamais dans le dépôt Git.
return [
    // Base MySQL créée dans l'espace client OVH (Hébergement > Bases de données)
    'base' => [
        'hote' => 'xxxxxx.mysql.db',
        'port' => 3306,
        'nom' => 'xxxxxx',
        'utilisateur' => 'xxxxxx',
        'mot_de_passe' => 'à saisir sur le serveur',
    ],
    // 64 caractères aléatoires (php -r "echo bin2hex(random_bytes(32));") : sert à l'empreinte des adresses IP
    'secret' => 'à générer sur le serveur',
    'site' => 'https://www.serruriertoulouse.fr',
    // Adresse du domaine, créée chez OVH : sans elle, les e-mails partent mal (SPF)
    'expediteur' => 'contact@serruriertoulouse.fr',
    'nom_expediteur' => 'Serrurier Toulouse',
    // Qui reçoit les nouveaux avis et les rappels
    'destinataire' => 'contact@serruriertoulouse.fr',
    // Lien « laisser un avis » de la fiche Google, proposé après l'envoi ; vide tant qu'il n'y en a pas
    'lien_google' => '',
    // En local seulement : dossier où écrire les e-mails au lieu de les envoyer. Toujours null en production.
    'capture' => null,
];
