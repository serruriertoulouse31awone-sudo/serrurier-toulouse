// Avis clients : affichage des avis publiés (servis par /avis/liste.php) et envoi du formulaire.
// Rien n'est publié sans validation : chaque avis part d'abord par e-mail au serrurier.

type AvisPublie = {
  prenom: string;
  note: number;
  texte: string;
  publie_le: string;
  intervention: string;
  reponse: string | null;
  repondu_le: string | null;
};

type ListeAvis = { avis: AvisPublie[]; total: number; moyenne: number | null };

const ETOILE =
  '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.751a.53.53 0 0 1 .294.904l-3.736 3.644a2.123 2.123 0 0 0-.611 1.878l.882 5.145a.53.53 0 0 1-.77.559l-4.618-2.428a2.122 2.122 0 0 0-1.973 0l-4.618 2.428a.53.53 0 0 1-.77-.56l.882-5.144a2.123 2.123 0 0 0-.611-1.878L2.16 9.79a.53.53 0 0 1 .294-.904l5.165-.751a2.123 2.123 0 0 0 1.596-1.16z"/>';

const jourMoisAn = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const moisAn = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
// Dates reçues au format AAAA-MM-JJ (et AAAA-MM pour l'intervention) : lues à midi pour ne jamais changer de jour.
const jour = (date: string) => jourMoisAn.format(new Date(`${date}T12:00:00`));

function echapper(texte: string) {
  return texte.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

const icone = (classe = "") => `<svg class="rating-star-icon${classe}" aria-hidden="true" viewBox="0 0 24 24">${ETOILE}</svg>`;

function etoiles(note: number) {
  return Array.from({ length: 5 }, (_, i) => icone(i < note ? "" : " rating-star-icon--vide")).join("");
}

// Moyenne : cinq étoiles pâles, recouvertes d'étoiles pleines sur la largeur de la note (4,5 = quatre et demie).
function etoilesMoyenne(moyenne: number) {
  const cinq = icone().repeat(5);
  return `<span class="etoiles-fond">${cinq}</span><span class="etoiles-plein" style="width:${(moyenne / 5) * 100}%">${cinq}</span>`;
}

function carte(a: AvisPublie) {
  const initiales = a.prenom.split(/\s+/).map((mot) => mot.slice(0, 1)).join("").slice(0, 2).toUpperCase();
  const reponse = a.reponse
    ? `<div class="avis-reponse"><strong>Réponse de Serrurier Toulouse</strong>${a.repondu_le ? `<span class="avis-reponse-date">le ${jour(a.repondu_le)}</span>` : ""}<p>${echapper(a.reponse)}</p></div>`
    : "";
  return `<article class="avis-card"><div class="avis-top"><div class="avis-avatar" aria-hidden="true">${echapper(initiales)}</div><div><div class="avis-name">${echapper(a.prenom)}</div><div class="avis-stars-sm" role="img" aria-label="Note : ${a.note} sur 5">${etoiles(a.note)}</div></div></div><p class="avis-dates"><span>Publié le ${jour(a.publie_le)}</span><span>Intervention en ${moisAn.format(new Date(`${a.intervention}-01T12:00:00`))}</span></p><p class="avis-text">${echapper(a.texte)}</p>${reponse}</article>`;
}

export async function chargerAvis() {
  const outer = document.querySelector<HTMLElement>(".avis-marquee-outer");
  const track = outer?.querySelector<HTMLElement>(".avis-marquee-track");
  if (!outer || !track) return;

  let liste: ListeAvis;
  try {
    const reponse = await fetch("/avis/liste.php", { headers: { Accept: "application/json" } });
    if (!reponse.ok) throw new Error(String(reponse.status));
    liste = (await reponse.json()) as ListeAvis;
  } catch {
    outer.classList.add("avis-statique");
    track.innerHTML = '<p class="avis-vide">Les avis n\'ont pas pu être chargés. Réessayez dans un instant.</p>';
    return;
  }

  const score = document.querySelector<HTMLElement>(".avis-big-score");
  const compte = document.querySelector<HTMLElement>(".avis-count");
  const etoilesEntete = document.querySelector<HTMLElement>(".avis-score .avis-stars");
  if (liste.total && liste.moyenne !== null) {
    const moyenne = liste.moyenne.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (score) score.textContent = moyenne;
    if (compte) compte.textContent = `${liste.total} avis`;
    if (etoilesEntete) {
      etoilesEntete.innerHTML = etoilesMoyenne(liste.moyenne);
      etoilesEntete.setAttribute("aria-label", `Note moyenne : ${moyenne} sur 5`);
    }
  } else {
    if (compte) compte.textContent = "Aucun avis pour l'instant";
    if (etoilesEntete) {
      etoilesEntete.innerHTML = etoilesMoyenne(0);
      etoilesEntete.setAttribute("aria-label", "Pas encore de note");
    }
  }

  if (!liste.avis.length) {
    outer.classList.add("avis-statique");
    track.innerHTML = '<p class="avis-vide">Aucun avis publié pour l\'instant. Vous avez fait appel à nous ? Partagez votre expérience avec le formulaire ci-dessous.</p>';
    return;
  }

  // Un jeu de cartes doit couvrir l'écran pour que le défilement boucle sans trou ; sinon, cartes fixes.
  const cartes = liste.avis.map(carte).join("");
  const largeurCarte = 344;
  if (liste.avis.length * largeurCarte < outer.clientWidth) {
    outer.classList.add("avis-statique");
    track.innerHTML = cartes;
    return;
  }
  outer.classList.remove("avis-statique");
  track.innerHTML = cartes + cartes + cartes;
}

export function brancherFormulaireAvis(apresChangement: () => void) {
  const formulaire = document.querySelector<HTMLFormElement>(".avis-form");
  if (!formulaire) return () => undefined;
  const depot = formulaire.closest("details");
  const retour = formulaire.querySelector<HTMLElement>(".avis-retour");
  const bouton = formulaire.querySelector<HTMLButtonElement>('button[type="submit"]');
  const texte = formulaire.querySelector<HTMLTextAreaElement>('textarea[name="texte"]');
  const compteur = formulaire.querySelector<HTMLElement>(".avis-compteur");
  const noteTexte = formulaire.querySelector<HTMLElement>(".avis-note-texte");
  const date = formulaire.querySelector<HTMLInputElement>('input[name="date_intervention"]');
  if (date) date.max = new Date().toISOString().slice(0, 10);
  // lien à envoyer aux clients après une intervention : https://www.serruriertoulouse.fr/#laisser-un-avis
  if (depot && location.hash === "#laisser-un-avis") depot.open = true;

  const compter = () => {
    if (compteur && texte) compteur.textContent = `${texte.value.length} / ${texte.maxLength}`;
  };
  const noter = (evenement: Event) => {
    const choix = evenement.target as HTMLInputElement;
    if (choix.name === "note" && noteTexte) noteTexte.textContent = `${choix.value} sur 5`;
  };

  const envoyer = async (evenement: SubmitEvent) => {
    evenement.preventDefault();
    if (!retour || !bouton) return;
    formulaire.querySelectorAll("[aria-invalid]").forEach((champ) => champ.removeAttribute("aria-invalid"));
    bouton.disabled = true;
    retour.className = "avis-retour";
    retour.textContent = "Envoi en cours…";
    try {
      const reponse = await fetch(formulaire.action, {
        method: "POST",
        body: new FormData(formulaire),
        headers: { Accept: "application/json" },
      });
      const resultat = (await reponse.json()) as { ok: boolean; message: string; erreurs?: Record<string, string>; lien_google?: string | null };
      retour.textContent = resultat.message;
      retour.classList.add(resultat.ok ? "avis-retour--ok" : "avis-retour--erreur");
      if (resultat.ok) {
        formulaire.reset();
        compter();
        if (noteTexte) noteTexte.textContent = "Choisissez de 1 à 5 étoiles";
        formulaire.classList.add("avis-form--envoye");
        if (resultat.lien_google) {
          const lien = document.createElement("a");
          lien.href = resultat.lien_google;
          lien.rel = "noopener";
          lien.target = "_blank";
          lien.textContent = "Laisser aussi votre avis sur Google";
          retour.append(" ", lien);
        }
        retour.tabIndex = -1;
        retour.focus();
      } else if (resultat.erreurs) {
        const noms = Object.keys(resultat.erreurs);
        noms.forEach((nom) => {
          const champ = formulaire.elements.namedItem(nom);
          if (champ instanceof Element) champ.setAttribute("aria-invalid", "true");
        });
        retour.textContent = `${resultat.message} ${Object.values(resultat.erreurs).join(" ")}`;
        (formulaire.elements.namedItem(noms[0]) as HTMLElement | null)?.focus?.();
      }
    } catch {
      retour.textContent = "L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.";
      retour.classList.add("avis-retour--erreur");
    } finally {
      bouton.disabled = false;
      apresChangement();
    }
  };

  formulaire.addEventListener("submit", envoyer);
  formulaire.addEventListener("change", noter);
  texte?.addEventListener("input", compter);
  depot?.addEventListener("toggle", apresChangement);
  return () => {
    formulaire.removeEventListener("submit", envoyer);
    formulaire.removeEventListener("change", noter);
    texte?.removeEventListener("input", compter);
    depot?.removeEventListener("toggle", apresChangement);
  };
}
