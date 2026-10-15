/* Consentement aux cookies + Google Tag Manager (GTM-M8QK3J3T).
   GTM n'est chargé qu'après « Accepter » : avant tout choix, et après un refus, aucun appel à Google.
   Le mode consentement de Google démarre « refusé », puis passe à « accordé » au clic.
   Le choix est gardé 6 mois dans le navigateur ; le lien « Gérer les cookies » du pied de page rouvre le bandeau. */
(function () {
  var GTM = 'GTM-M8QK3J3T', CLE = 'consentement-cookies', DUREE = 182 * 24 * 3600 * 1000;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });

  function lire() {
    try { var c = JSON.parse(localStorage.getItem(CLE)); return c && Date.now() - c.date < DUREE ? c.choix : null; } catch (e) { return null; }
  }
  function ecrire(choix) { try { localStorage.setItem(CLE, JSON.stringify({ choix: choix, date: Date.now() })); } catch (e) {} }

  var charge = false;
  function chargerGTM() {
    if (charge) return; charge = true;
    gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM;
    document.head.appendChild(s);
  }

  var css = '#bandeau-cookies{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:440px;margin-left:auto;background:#1A0D2E;color:#EDE6FA;'
    + 'border:1px solid rgba(255,190,0,.35);border-radius:14px;padding:18px 18px 16px;box-shadow:0 12px 40px rgba(10,4,24,.45);font:400 14.5px/1.5 "DM Sans",system-ui,sans-serif}'
    + '#bandeau-cookies p{margin:0 0 14px}#bandeau-cookies a{color:#FFD24D}#bandeau-cookies .boutons{display:flex;gap:10px}'
    + '#bandeau-cookies button{flex:1;min-height:44px;border-radius:10px;font:600 15px "DM Sans",system-ui,sans-serif;cursor:pointer;border:1.5px solid #FFBE00}'
    + '#bandeau-cookies .refuser{background:transparent;color:#FFFFFF}#bandeau-cookies .accepter{background:#FFBE00;color:#1A0D2E}'
    + '#bandeau-cookies button:focus-visible{outline:3px solid #FFFFFF;outline-offset:2px}';

  function bandeau() {
    if (document.getElementById('bandeau-cookies')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement('div');
    b.id = 'bandeau-cookies'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Cookies');
    b.innerHTML = '<p>Avec votre accord, nous utilisons des cookies de Google pour mesurer les appels et demandes venus de nos annonces. '
      + 'Refuser ne change rien à l\'utilisation du site. <a href="/confidentialite#cookies">En savoir plus</a></p>'
      + '<div class="boutons"><button type="button" class="refuser">Refuser</button><button type="button" class="accepter">Accepter</button></div>';
    document.body.appendChild(b);
    b.querySelector('.refuser').onclick = function () { ecrire('non'); b.remove(); };
    b.querySelector('.accepter').onclick = function () { ecrire('oui'); b.remove(); chargerGTM(); };
  }

  var choix = lire();
  if (choix === 'oui') chargerGTM();
  document.addEventListener('DOMContentLoaded', function () {
    if (!choix) bandeau();
    document.querySelectorAll('[data-gerer-cookies]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        // retirer un accord : Google ne peut plus lire ses cookies ; on recharge pour décharger GTM
        if (lire() === 'oui') { try { localStorage.removeItem(CLE); } catch (x) {} location.reload(); return; }
        bandeau();
      });
    });
  });
})();
