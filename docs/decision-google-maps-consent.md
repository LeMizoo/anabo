# Décision : chargement des cartes Google Maps

- **Date :** 3 novembre 2026
- **Statut :** décision temporaire, comportement conservé

## Décision

Les cartes Google Maps intégrées aux idées de voyage restent chargées sans attendre le choix de consentement. Aucun changement de code ni de politique cookies n’est effectué pour cette décision.

## Contexte

Les itinéraires de la page « Idées de voyage » sont affichés dans des iframes Google Maps. À la vérification, ces iframes sont chargées même si le visiteur refuse les cookies. Le widget Trustindex, lui, n’est chargé qu’après acceptation du consentement.

## Conséquence connue

Google Maps peut contacter un service tiers avant que le visiteur ait accepté. La politique cookies actuelle décrit le widget Trustindex/Tripadvisor, mais ne précise pas le chargement des cartes. Ce décalage est accepté pour le moment et ne doit pas être interprété comme une validation de conformité.

## Réexamen

Réexaminer cette décision avant toute modification du bandeau de consentement ou de la politique cookies, ou si les exigences de confidentialité évoluent. À ce moment-là, choisir explicitement entre bloquer les iframes Maps avant consentement et mettre à jour l’information fournie aux visiteurs.
