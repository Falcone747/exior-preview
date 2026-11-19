#!/usr/bin/env python3
"""Émet les pages de vente EXIOR à partir du document 01, copy élevé."""
from pathlib import Path

ROOT = Path("/workspace")

def chain(steps, live=False):
    cls = "chain chain-live" if live else "chain"
    parts = [f'<ol class="{cls}">']
    for i, (n, title, text) in enumerate(steps):
        parts.append("<li>")
        parts.append(
            f'<div class="step"><span class="n">{n}</span><strong>{title}</strong></div>'
        )
        if text:
            parts.append(f"<p>{text}</p>")
        if i < len(steps) - 1:
            parts.append('<div class="flow" aria-hidden="true"><i></i></div>')
        parts.append("</li>")
    parts.append("</ol>")
    return "\n".join(parts)

def figure(prefix, src, w, h, alt, eager=False):
    lazy = "" if eager else ' loading="lazy"'
    pri = ' fetchpriority="high"' if eager else ""
    return (
        f'<figure class="figure"><img src="{prefix}assets/visuels/{src}" '
        f'width="{w}" height="{h}" alt="{alt}"{lazy}{pri}></figure>'
    )

def page(prefix, title, desc, body, current, sticky="Obtenir mon architecture — 990 €"):
    home = prefix or "./"
    def h(path):
        return prefix + path
    links = [
        ("comment-ca-marche/", "La transformation"),
        ("architecture-evolutive/", "Votre architecture"),
        ("applications-metiers/", "Applications métiers"),
        ("methode/", "Méthode"),
        ("faq/", "Questions fréquentes"),
    ]
    def a(path, label):
        cur = ' aria-current="page"' if path == current else ""
        return f'<a href="{h(path)}"{cur}>{label}</a>'
    nav = "\n".join(a(p, l) for p, l in links)
    cta = h("commander/")
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#090a0b">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{h('assets/visuels/og.webp')}">
<link rel="icon" href="{h('assets/brand/favicon.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="{h('assets/site.css')}">
<script src="{h('assets/offre.js')}"></script>
</head>
<body>
<div class="glow" aria-hidden="true"></div>
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="top">
  <div class="wrap top-in">
    <a class="brand" href="{home}" aria-label="EXIOR, accueil"><span class="logo"></span></a>
    <nav class="nav" aria-label="Principal">
      <div class="nav-links">{nav}</div>
      <details class="nav-more">
        <summary>Menu</summary>
        <div class="panel">{nav}</div>
      </details>
      <a class="btn top-cta" href="{cta}">Obtenir mon architecture — 990 €</a>
    </nav>
  </div>
</header>
<main id="contenu">
{body}
</main>
<footer class="foot">
  <div class="wrap foot-in">
    <a class="brand" href="{home}" aria-label="EXIOR"><span class="logo"></span></a>
    <nav aria-label="Informations légales">
      <a href="{h('mentions-legales/')}">Mentions légales</a>
      <a href="{h('confidentialite/')}">Confidentialité</a>
      <a href="{h('cgv/')}">CGV</a>
      <a href="mailto:exior.tech@gmail.com">exior.tech@gmail.com</a>
    </nav>
  </div>
</footer>
<div class="sticky"><a class="btn btn-full" href="{cta}">{sticky}</a></div>
<script src="{h('assets/site.js')}"></script>
</body>
</html>
"""

def redirect(url):
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url={url}">
<script>location.replace("{url}")</script>
<title>EXIOR</title></head>
<body><p><a href="{url}">Continuer</a></p></body></html>
"""

P = ""
S = "../"

home_chain = chain([
    ("01", "Outils et données", "Logiciels, dossiers et référentiels déjà en place chez Meridian."),
    ("02", "Orchestration", "L’événement ouvre un parcours : état, donnée qui fait foi, prochaine tâche."),
    ("03", "Exécution", "Un agent spécialisé, une règle ou un collaborateur reçoit la tâche permise."),
    ("04", "Validation humaine", "Décision, risque ou responsabilité : le flux s’arrête sur une personne."),
    ("05", "Action", "L’écriture part dans l’outil autorisé. Le journal garde la trace."),
], live=True)

home = f"""
<section class="hero">
  <div class="wrap hero-in">
    <div>
      <p class="eyebrow">EXIOR — Enterprise transformation</p>
      <h1>Transformez le fonctionnement de votre entreprise.</h1>
      <p class="lead">Vos équipes ont les logiciels, les données et les compétences. Le temps part dans les passages : identifier le dossier, lire la donnée qui fait foi, demander une validation, écrire le statut, vérifier que l’étape est close.</p>
      <p class="strong">EXIOR conçoit l’architecture de ces passages. Outils connectés, règles, agents spécialisés, permissions et validation humaine. La conception s’arrête avant le déploiement.</p>
      <p class="price-line">990&nbsp;€ · Votre architecture personnalisée sous 7 jours ouvrés</p>
      <div class="actions">
        <a class="btn" href="commander/">Obtenir mon architecture — 990 €</a>
        <a class="link" href="methode/">Découvrir la méthode</a>
      </div>
      <p class="micro">Conception personnalisée. Déploiement technique et exploitation proposés séparément, sur devis.</p>
    </div>
    <div>
      {figure(P, "hero-accueil.webp", 1280, 720, "Réseau abstrait de blocs reliés, fond sombre, un nœud orangé. Aucune donnée réelle.", True)}
      <p class="label" style="margin-top:16px">Meridian · entreprise fictive</p>
      {home_chain}
      <p class="fine">Meridian n’est pas un client. La chaîne montre un fonctionnement conçu, pas un agent en production.</p>
    </div>
  </div>
</section>
<section class="sec reveal" id="probleme">
  <div class="wrap">
    <div class="sec-head">
      <h2>Vos logiciels travaillent. Qui fait travailler l’ensemble&nbsp;?</h2>
      <p>Chaque outil accomplit sa fonction. La coordination entre eux reste souvent humaine. C’est dans le passage d’un système à l’autre que se forment ressaisies, attentes et dossiers sans statut.</p>
    </div>
    {chain([
        ("1", "Email reçu", "L’événement entre. Rien n’est encore un dossier."),
        ("2", "Dossier", "La référence métier est cherchée à la main."),
        ("3", "Logiciel métier", "Une information est contrôlée dans un second outil."),
        ("4", "Collègue", "Une question part, sans file d’attente ni échéance."),
        ("5", "Tableau", "Le statut est recopié. La trace dépend de la personne."),
    ])}
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Une entreprise conçue pour agir, pas seulement pour enregistrer.</h2>
    </div>
    <div class="grid-5 stagger">
      <article class="card"><p class="label">Relier</p><h3>Le graphe réel</h3><p>Équipes, logiciels, données, documents et partenaires, avec le flux qui les lie.</p></article>
      <article class="card"><p class="label">Coordonner</p><h3>L’orchestration</h3><p>Passage d’étape, permission, état du dossier, donnée qui fait foi.</p></article>
      <article class="card"><p class="label">Exécuter</p><h3>Qui tient la tâche</h3><p>Agent spécialisé, règle logicielle ou collaborateur. Le rôle est écrit.</p></article>
      <article class="card"><p class="label">Contrôler</p><h3>Le point d’arrêt</h3><p>Validation humaine là où la décision, le risque ou la responsabilité l’exigent.</p></article>
      <article class="card"><p class="label">Évoluer</p><h3>Le socle</h3><p>Un outil ou un agent s’ajoute sans reconstruire l’organisation.</p></article>
    </div>
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Nous ne vous vendons pas un logiciel supplémentaire.</h2>
      <p>Un outil répond à un besoin isolé. Une automatisation exécute une séquence. Une architecture EXIOR nomme le déclencheur, la donnée, l’outil, le contrôle et le journal.</p>
    </div>
    <div class="grid-3 stagger">
      <article class="card"><h3>Outil</h3><p>Une fonction. Pas le parcours.</p></article>
      <article class="card"><h3>Automatisation</h3><p>Une séquence. Pas les exceptions ni la responsabilité.</p></article>
      <article class="card"><h3>Architecture EXIOR</h3><p>Orchestrateur, agents, règles, validation, trace.</p></article>
    </div>
  </div>
</section>
<section class="sec reveal" id="offre">
  <div class="wrap">
    <div class="sec-head">
      <h2>En 7 jours ouvrés, voyez comment votre entreprise pourrait fonctionner autrement.</h2>
      <p>Nous analysons votre organisation et concevons votre architecture numérique évolutive. Livrée sous 7 jours ouvrés après réception du dossier complet.</p>
    </div>
    <ul class="list">
      <li><strong>Cartographie.</strong> Processus, outils et points de friction.</li>
      <li><strong>Architecture cible.</strong> Données, logiciels, équipes et agents IA, avec l’orchestrateur.</li>
      <li><strong>Parcours avant / après.</strong> Priorités d’automatisation, sans gain chiffré.</li>
      <li><strong>Règles.</strong> Contrôle, gouvernance, sécurité, responsabilités.</li>
      <li><strong>Espace EXIOR.</strong> Vision des interfaces. Le dessin, pas l’environnement en service.</li>
      <li><strong>Plan de déploiement.</strong> Étapes, dépendances, hypothèses budgétaires. La mise en œuvre est hors des 990&nbsp;€.</li>
    </ul>
    <p class="price-line">990&nbsp;€ — paiement unique.</p>
    <div class="actions"><a class="btn" href="commander/">Obtenir mon architecture — 990 €</a></div>
    <p class="micro">La mission de conception commence à réception du dossier complet. La mise en œuvre technique n’est pas comprise.</p>
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Ce que change une architecture bien pensée</h2>
      <p>Trois scénarios de fonctionnement. Ce ne sont pas des automatisations promises, ni des clients.</p>
    </div>
    <div class="grid-3" style="align-items:start">
      <article>
        {figure(P, "ex-syndic.webp", 960, 720, "Flux abstrait de documents vers une forme bâtie. Scénario fictif, sans personne.")}
        <h3 style="margin-top:14px">Cabinet de syndic</h3>
        {chain([
            ("1", "Document reçu", "Email entrant."),
            ("2", "Copropriété", "Identification de la référence."),
            ("3", "Pièces", "Contrôle. Écart = exception."),
            ("4", "Écriture", "Préparation comptable."),
            ("5", "Validation", "Une personne autorise l’action finale."),
        ])}
      </article>
      <article>
        {figure(P, "ex-comptable.webp", 960, 720, "Dalles abstraites et bifurcation orangée. Scénario fictif de dossier comptable.")}
        <h3 style="margin-top:14px">Cabinet comptable</h3>
        {chain([
            ("1", "Pièce manquante", "Détection dans le dossier."),
            ("2", "Demande", "Le message est préparé, pas envoyé sans règle."),
            ("3", "Suivi", "Le dossier a un état."),
            ("4", "Exception", "Le collaborateur reçoit le cas, au moment utile."),
        ])}
      </article>
      <article>
        {figure(P, "ex-services.webp", 960, 720, "Chemin abstrait entre blocs. Scénario fictif d’une demande de service.")}
        <h3 style="margin-top:14px">Entreprise de services</h3>
        {chain([
            ("1", "Demande", "Réception."),
            ("2", "Devis", "Préparé dans l’outil commercial."),
            ("3", "Intervention", "Planifiée. L’imprévu revient à une personne."),
            ("4", "Facture", "Après l’étape qui la déclenche."),
        ])}
      </article>
    </div>
    <p class="micro">Ce sont des scénarios de fonctionnement envisageables dans une architecture, non des automatisations promises ou déjà livrées à l’achat du plan.</p>
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Vos décisions restent les vôtres.</h2>
      <p>L’architecture prévoit les droits d’accès, la séparation des responsabilités, la traçabilité et les points de validation humaine. Un processus sensible ne part pas sur un agent sans contrôle.</p>
    </div>
    <div class="grid-2 stagger">
      <article class="card"><h3>Permissions</h3><p>Qui lit, qui écrit, dans quel outil.</p></article>
      <article class="card"><h3>Séparation</h3><p>La personne qui prépare n’est pas celle qui valide.</p></article>
      <article class="card"><h3>Journal</h3><p>Chaque passage daté, rattaché à un rôle.</p></article>
      <article class="card"><h3>Données métier</h3><p>Le logiciel qui fait foi reste la référence. La sécurité du déploiement est spécifiée, pas réalisée dans les 990&nbsp;€.</p></article>
    </div>
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Votre prochaine évolution ne devrait pas nécessiter de tout reconstruire.</h2>
      <p>L’architecture distingue le socle et les ajouts. Vous décidez ensuite, pièce en main, ce qui part en déploiement.</p>
    </div>
    <div class="actions"><a class="btn" href="commander/">Concevoir mon architecture — 990 €</a></div>
    <p class="micro">Livraison sous 7 jours ouvrés après réception du dossier complet. Déploiement et exploitation sur devis.</p>
  </div>
</section>
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"Service","name":"Architecture évolutive de votre entreprise","provider":{{"@type":"Organization","name":"EXIOR","email":"exior.tech@gmail.com"}},"description":"Conception de l’architecture évolutive d’une entreprise. 990 euros, paiement unique, 7 jours ouvrés après réception du dossier complet. Déploiement hors périmètre.","offers":{{"@type":"Offer","price":"990","priceCurrency":"EUR"}}}}</script>
"""

arch = f"""
<section class="hero">
  <div class="wrap hero-in">
    <div>
      <p class="eyebrow">Votre architecture</p>
      <h1>L’architecture de votre prochaine entreprise.</h1>
      <p class="lead">Votre organisation, vos processus et vos technologies réunis dans un plan de transformation exploitable.</p>
      <p class="strong">EXIOR lit le fonctionnement actuel et décrit le système cible : logiciels, données, collaborateurs, agents spécialisés, orchestrateur et contrôles.</p>
      <p class="price-line">990&nbsp;€ · Livraison sous 7 jours ouvrés</p>
      <div class="actions"><a class="btn" href="../commander/">Commander mon architecture — 990 €</a></div>
      <p class="micro">Livrée sous 7 jours ouvrés après réception du dossier complet. Conception seulement.</p>
    </div>
    {figure(S, "hero-architecture.webp", 1280, 720, "Couches abstraites de modules sombres, un point orangé à la jointure.", True)}
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Une décision éclairée sur l’avenir de votre entreprise.</h2>
      <p>Vous ne recevez pas une liste générique d’outils. Vous obtenez l’ordre des transformations, les liens entre systèmes et le périmètre d’un premier déploiement.</p>
    </div>
    <ol class="layers">
      <li class="layer"><span class="n">1</span><div><strong>Diagnostic de fonctionnement</strong><p>Activités, flux, services, outils, passages manuels, contraintes métier.</p></div></li>
      <li class="layer"><span class="n">2</span><div><strong>Architecture opérationnelle cible</strong><p>Données, interfaces, orchestrateur, agents spécialisés, tâches, événements, supervision.</p></div></li>
      <li class="layer"><span class="n">3</span><div><strong>Processus de bout en bout</strong><p>Déclencheur, actions, conditions, exceptions, intervention humaine, trace, résultat.</p></div></li>
      <li class="layer"><span class="n">4</span><div><strong>Gouvernance et protection</strong><p>Permissions, validation, sécurité à prévoir, traitement des données, responsabilités.</p></div></li>
      <li class="layer"><span class="n">5</span><div><strong>Feuille de route</strong><p>Priorités, phases, prérequis, risques, dépendances, périmètre du premier déploiement.</p></div></li>
      <li class="layer"><span class="n">6</span><div><strong>Représentation visuelle</strong><p>Schémas du futur environnement. Toute démonstration reste illustrative tant que rien n’est déployé.</p></div></li>
    </ol>
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head"><h2>Comment cela se passe</h2></div>
    {chain([
        ("1", "Vous décrivez l’entreprise", "Activité, logiciels, processus, volumes indicatifs, contraintes. Aucun mot de passe, aucun accès de production."),
        ("2", "EXIOR analyse les flux", "Coordinations manuelles, dépendances, actions possibles, validations à maintenir."),
        ("3", "EXIOR conçoit le système", "Architecture, agents et interfaces envisageables, processus cibles, contrôles."),
        ("4", "Vous recevez l’architecture", "Sous 7 jours ouvrés à compter du dossier complet : livrables, priorités, mise en œuvre graduelle."),
    ])}
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <p class="price-xl">990&nbsp;€</p>
    <p class="price-line">Paiement unique · Conception personnalisée · Délai de 7 jours ouvrés.</p>
    <div class="grid-2" style="margin-top:28px">
      <article class="card"><h3>Inclus</h3><p>Analyse sur dossier, architecture cible, processus prioritaires, plan de transformation, livrables visuels.</p></article>
      <article class="card"><h3>Non inclus</h3><p>Programmation, hébergement d’une plateforme, connexions opérationnelles, migrations, accès aux API, agents en production, maintenance, abonnements tiers.</p></article>
    </div>
    <p class="micro">Après réception, un devis distinct peut couvrir les intégrations retenues. Aucun déploiement n’est obligatoire.</p>
    <div class="actions"><a class="btn" href="../commander/">Obtenir mon architecture — 990 €</a></div>
  </div>
</section>
"""

marche = f"""
<section class="hero">
  <div class="wrap hero-in">
    <div>
      <p class="eyebrow">La transformation</p>
      <h1>Du travail fragmenté à une organisation coordonnée.</h1>
      <p class="lead">Une entreprise ne fonctionne pas logiciel par logiciel. Elle fonctionne par des processus qui traversent les équipes, les données et les outils.</p>
      <p class="strong">EXIOR conçoit la structure qui permet de les piloter comme un ensemble : orchestrateur, agents, outils, garde-fous.</p>
      <p class="price-line">990&nbsp;€ · Livraison sous 7 jours ouvrés</p>
      <div class="actions"><a class="btn" href="../commander/">Obtenir mon architecture — 990 €</a>
      <a class="link" href="../methode/">Découvrir la méthode</a></div>
    </div>
    {figure(S, "hero-fonctionnement.webp", 1280, 720, "Cinq blocs sombres reliés, une étincelle orangée sur un connecteur.", True)}
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <h2>Un événement. Un processus. Un résultat.</h2>
      <p>Le principe tient en cinq temps. Chacun a un responsable possible : règle, agent ou personne.</p>
    </div>
    {chain([
        ("1", "Événement", "Email, document, échéance, mise à jour, demande d’un collaborateur."),
        ("2", "Compréhension", "Contexte, règles et données nécessaires, dans les accès définis."),
        ("3", "Coordination", "La tâche va au logiciel, à l’agent ou à la personne en mesure de l’exécuter."),
        ("4", "Exécution", "Actions autorisées, validations sensibles, exceptions."),
        ("5", "Traçabilité", "Les étapes importantes peuvent être enregistrées pour les utilisateurs habilités."),
    ], live=True)}
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Les couches de l’architecture multi-agents</h2>
      <p>Schéma cible. L’implémentation est une prestation distincte. Rien ici n’est un système déjà en service.</p>
    </div>
    {chain([
        ("1", "Sources de données", "Comptabilité, CRM, messagerie, dossiers, banques, logiciels métier. Une source fait foi par objet."),
        ("2", "Couche d’intégration", "API quand elles existent. Sinon, la limite est écrite et l’action reste humaine."),
        ("3", "Orchestrateur", "Événements, états, reprises. Il ne décide pas à la place des règles."),
        ("4", "Agents spécialisés", "Analyse, recherche, préparation, contrôle. Chacun a des outils et un périmètre."),
        ("5", "Contrôles et validation humaine", "Garde-fous, évaluation de la sortie, arrêt si le cas est sensible."),
        ("6", "Exécution dans les outils", "Écriture seulement là où la permission et la règle l’autorisent."),
        ("7", "Journal et pilotage", "Trace, exceptions, indicateur lu par le responsable. Pas un tableau de bord livré clé en main."),
    ])}
    <p class="micro">Les composants décrivent l’architecture cible. Leur implémentation est une prestation distincte.</p>
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Une facture fournisseur : au-delà de la lecture automatique</h2>
    </div>
    <div class="grid-2">
      <article class="card"><h3>Sans coordination</h3><p>Le document est extrait. Un collaborateur choisit le dossier, vérifie le contrat, contrôle les doublons, prépare la saisie, suit l’exception, constate la fin.</p></article>
      <article class="card"><h3>Avec une architecture déployée</h3><p>Le processus peut identifier le contexte, contrôler les règles, préparer l’opération dans le logiciel autorisé, soumettre le cas sensible, relancer le suivi, documenter l’état. Ceci décrit un déploiement, pas les 990&nbsp;€.</p></article>
    </div>
    <p class="micro">Le sujet est la chaîne de coordination, pas l’extraction de trois champs.</p>
    <div class="actions"><a class="btn" href="../commander/">Obtenir mon architecture — 990 €</a></div>
  </div>
</section>
"""

metiers = f"""
<section class="hero">
  <div class="wrap hero-in">
    <div>
      <p class="eyebrow">Applications métiers</p>
      <h1>Un même principe. Des processus propres à chaque entreprise.</h1>
      <p class="lead">EXIOR n’impose pas un logiciel standard. Le départ est l’opération, l’outil déjà là, et la règle du métier.</p>
      <p class="price-line">990&nbsp;€ · Livraison sous 7 jours ouvrés</p>
      <div class="actions"><a class="btn" href="../commander/">Obtenir mon architecture — 990 €</a></div>
    </div>
    {figure(S, "hero-metiers.webp", 1280, 720, "Trois groupes de nœuds sombres reliés par une ligne, un repère orangé.", True)}
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <h2>Coordonnez les copropriétés, pas seulement leurs documents.</h2>
      <p>Factures, correspondances, relevés, fournisseurs, copropriétaires, échéances et interventions traversent plusieurs applications.</p>
    </div>
    {figure(S, "ex-syndic.webp", 960, 720, "Documents abstraits convergeant vers une masse géométrique. Illustration, pas un syndic réel.")}
    {chain([
        ("1", "Identification", "La copropriété est la clé du dossier."),
        ("2", "Pièces", "Vérification. Le manque devient une exception."),
        ("3", "Contrôle comptable", "Règle avant écriture."),
        ("4", "Réponse", "Préparation, pas envoi automatique."),
        ("5", "Validation", "Les cas sensibles remontent à une personne."),
    ])}
    <p class="micro">Résultat recherché : moins de coordination manuelle, continuité de traitement, visibilité sur les dossiers. Aucun volume n’est promis.</p>
    <div class="actions"><a class="btn" href="../commander/">Concevoir l’architecture de mon cabinet</a></div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <h2>Faites avancer vos dossiers entre les outils et les équipes.</h2>
      <p>Les logiciels tiennent la production. Les pièces manquantes, les échanges et les échéances demandent une organisation transverse.</p>
    </div>
    {figure(S, "ex-comptable.webp", 960, 720, "Empilement abstrait et chemin qui se divise. Illustration de dossier, sans cabinet réel.")}
    {chain([
        ("1", "Demande", "Le besoin entre avec une référence client."),
        ("2", "Pièces", "Réception contrôlée contre la liste attendue."),
        ("3", "Dossier", "L’état est mis à jour dans l’outil de production."),
        ("4", "Contrôle", "Le collaborateur garde la responsabilité professionnelle."),
    ])}
    <p class="micro">Résultat recherché : des dossiers qui avancent avec moins de relances répétées, sans retirer la responsabilité de l’expert.</p>
    <div class="actions"><a class="btn" href="../commander/">Concevoir l’architecture de mon cabinet</a></div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head">
      <h2>Reliez la demande client à son exécution sur le terrain.</h2>
      <p>Demande, devis, planification, intervention, justificatif, compte rendu et facture reposent souvent sur plusieurs supports.</p>
    </div>
    {figure(S, "ex-services.webp", 960, 720, "Parcours abstrait de blocs, du signal à une extrémité. Illustration, pas une entreprise cliente.")}
    {chain([
        ("1", "Contexte", "La demande est rattachée au client et au site."),
        ("2", "Répartition", "Tâche administrative ou intervention."),
        ("3", "Suivi", "Chaque étape a un état."),
        ("4", "Imprévu", "L’écart revient à une personne, pas à une boucle silencieuse."),
    ])}
    <p class="micro">Résultat recherché : continuité entre l’administration, les techniciens et le client.</p>
    <div class="actions"><a class="btn" href="../commander/">Concevoir l’architecture de mon entreprise</a></div>
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Analyse de données et pilotage</h2>
      <p>L’architecture nomme la donnée qui fait foi, le contrôle de qualité, l’exception et l’indicateur lu par le responsable. Elle ne livre pas un entrepôt ni un tableau de bord en production.</p>
    </div>
    {chain([
        ("1", "Source de vérité", "Un objet métier, un système qui fait foi."),
        ("2", "Qualité", "Champ obligatoire, doublon, délai. Le critère est écrit."),
        ("3", "Exception", "L’écart stoppe le flux et ouvre une tâche."),
        ("4", "Pilotage", "L’indicateur est défini : file d’exceptions, âge des dossiers, étapes en attente de validation."),
        ("5", "Décision", "Le responsable lit l’indicateur. L’architecture ne décide pas à sa place."),
    ])}
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head">
      <h2>Votre activité est différente&nbsp;? Le point de départ reste le même.</h2>
      <p>Nous étudions les organisations où l’information passe entre des systèmes, des personnes et des décisions.</p>
    </div>
    <div class="actions"><a class="btn" href="../commander/">Présenter mon fonctionnement</a></div>
  </div>
</section>
"""

methode = f"""
<section class="hero">
  <div class="wrap hero-in">
    <div>
      <p class="eyebrow">Méthode</p>
      <h1>Une architecture de transformation. Pas un rapport générique.</h1>
      <p class="lead">Votre entreprise a déjà ses outils, ses contraintes et ses processus. EXIOR les modélise pour un environnement cible cohérent, évolutif, exécutable par étapes.</p>
      <p class="price-line">Livrée sous 7 jours ouvrés après réception du dossier complet.</p>
      <div class="actions"><a class="btn" href="../commander/">Commander l’architecture — 990 €</a></div>
    </div>
    {figure(S, "hero-methode.webp", 1280, 720, "Blocs sombres en progression, le dernier marqué d’un point orangé.", True)}
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="sec-head"><h2>Méthode en 7 jours ouvrés</h2></div>
    {chain([
        ("J0", "Lancement — dossier complet", "Formulaire, activité, outils, données disponibles, processus prioritaires, contraintes connues."),
        ("1", "Comprendre", "Organisation, flux, systèmes, responsabilités, points de friction."),
        ("2", "Concevoir", "Architecture cible, composants, agents envisagés, règles, interfaces, points de contrôle."),
        ("3", "Prioriser", "Scénarios de bout en bout, dépendances, complexité, risques, ordre de déploiement."),
        ("J7", "Livraison — dossier de transformation", "Schémas, processus cibles, priorités, feuille de route, conditions de mise en œuvre."),
    ])}
    <p class="micro">La mission est livrée sous 7 jours ouvrés après réception du dossier complet. Le calendrier peut être précisé au contrat si un élément indispensable manque.</p>
  </div>
</section>
<section class="sec reveal">
  <div class="wrap">
    <div class="sec-head"><h2>Ce que vous pouvez faire ensuite</h2></div>
    <div class="grid-3 stagger">
      <article class="card"><h3>Feuille de route</h3><p>Le document vous appartient selon le contrat. Il sert aux décisions internes.</p></article>
      <article class="card"><h3>Déploiement EXIOR</h3><p>Devis distinct : intégrations, hébergement, sécurité, agents, processus, tests, accompagnement.</p></article>
      <article class="card"><h3>Évolution</h3><p>Le socle initial est séparé des améliorations ultérieures.</p></article>
    </div>
    <div class="actions"><a class="btn" href="../commander/">Commander l’architecture — 990 €</a></div>
  </div>
</section>
"""

faq = f"""
<section class="hero">
  <div class="wrap hero-in">
    <div>
      <p class="eyebrow">Questions fréquentes</p>
      <h1>Avant de commander l’architecture.</h1>
      <p class="lead">Les réponses ci-dessous fixent le périmètre des 990&nbsp;€. Le déploiement n’y est pas inclus.</p>
      <p class="price-line">990&nbsp;€ · 7 jours ouvrés après réception du dossier complet</p>
    </div>
    {figure(S, "hero-faq.webp", 1280, 720, "Deux volumes sombres et des lignes fines sur fond noir, un point orangé.", True)}
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="faq">
      <details><summary>Que vais-je recevoir pour 990&nbsp;€&nbsp;?</summary><p>Une architecture personnalisée : organisation actuelle et cible, processus prioritaires, intégration envisagée des outils, agents possibles, règles de contrôle, feuille de route de déploiement.</p></details>
      <details><summary>Est-ce qu’EXIOR installe les agents en 7 jours&nbsp;?</summary><p>Non. Les 7 jours ouvrés couvrent la conception et la livraison de l’architecture. Le déploiement réel est une prestation distincte, sur devis.</p></details>
      <details><summary>Faut-il remplacer nos logiciels&nbsp;?</summary><p>Pas nécessairement. La méthode part des outils existants et examine comment les relier ou compléter leurs fonctions, selon leurs possibilités d’intégration.</p></details>
      <details><summary>L’architecture est-elle standardisée&nbsp;?</summary><p>La méthode est structurée. L’analyse, les parcours, les choix d’architecture et la feuille de route sont ceux de votre entreprise.</p></details>
      <details><summary>Que se passe-t-il si nos logiciels n’ont pas d’API&nbsp;?</summary><p>L’architecture écrit les possibilités, les limites, les alternatives et les actions laissées aux collaborateurs. Aucune connexion n’est garantie sans vérification.</p></details>
      <details><summary>Qui garde le contrôle&nbsp;?</summary><p>Votre entreprise conserve les décisions et les permissions métier. Le plan définit les validations, les droits et les responsabilités à maintenir lors d’un déploiement.</p></details>
      <details><summary>Les données sont-elles protégées&nbsp;?</summary><p>La conception identifie les mesures de sécurité, d’accès et de protection à intégrer. Une mise en production ultérieure fera l’objet de dispositions techniques et contractuelles, notamment au regard du RGPD. L’hébergement n’est pas inclus dans la conception.</p></details>
      <details><summary>Quel est le coût du déploiement et de la maintenance&nbsp;?</summary><p>Il dépend du périmètre, des logiciels, des volumes et de la sécurité. EXIOR propose un devis après l’architecture. Aucun prix universel de déploiement ou d’abonnement n’est affiché.</p></details>
      <details><summary>Sommes-nous obligés de déployer avec EXIOR&nbsp;?</summary><p>Non. L’architecture est une prestation autonome. Le déploiement est facultatif.</p></details>
      <details><summary>Quand commence le délai de 7 jours ouvrés&nbsp;?</summary><p>À réception du dossier complet nécessaire à l’analyse.</p></details>
    </div>
    <div class="actions"><a class="btn" href="../commander/">Obtenir mon architecture — 990 €</a></div>
  </div>
</section>
"""

commander = f"""
<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Commander</p>
    <h1>990&nbsp;€ HT. L’architecture, en 7 jours ouvrés.</h1>
    <p class="lead">Paiement unique. Conception de l’architecture évolutive. Le délai part à la réception du dossier complet.</p>
    <p class="strong">Le déploiement, l’Espace EXIOR en service, l’hébergement et l’exploitation sont sur devis séparé. Aucun déploiement n’est obligatoire.</p>
    <div class="actions"><a class="btn" data-stripe href="https://buy.stripe.com/fZu5kC0Zqenp5VF6h77IY05" rel="noopener">Payer 990&nbsp;€</a></div>
    <p class="micro">Le bouton ouvre le paiement Stripe. Il ne déploie rien.</p>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="grid-2">
      <article>
        <h2>Inclus</h2>
        <ul class="list">
          <li>Analyse sur dossier.</li>
          <li>Architecture cible : données, orchestrateur, agents envisagés, interfaces.</li>
          <li>Processus prioritaires, avec exceptions et validations.</li>
          <li>Règles de contrôle, gouvernance, responsabilités.</li>
          <li>Plan de transformation et livrables visuels.</li>
          <li>Vision de l’Espace EXIOR. Un dessin, pas un environnement ouvert.</li>
        </ul>
      </article>
      <article>
        <h2>Hors périmètre</h2>
        <ul class="list">
          <li>Programmation de logiciels.</li>
          <li>Hébergement d’une plateforme.</li>
          <li>Connexions opérationnelles et accès aux API.</li>
          <li>Migrations de données.</li>
          <li>Agents en production.</li>
          <li>Maintenance et abonnements tiers.</li>
        </ul>
      </article>
    </div>
  </div>
</section>
<section class="sec" id="dossier">
  <div class="wrap">
    <h2>Le dossier</h2>
    <p class="lead">Sept indications. Aucun mot de passe, aucun secret d’accès. L’envoi ouvre votre messagerie vers exior.tech@gmail.com.</p>
    <form class="fields" action="mailto:exior.tech@gmail.com" method="post" enctype="text/plain">
      <div><label for="activite">Activité</label><input id="activite" name="activite" required></div>
      <div><label for="taille">Taille</label><input id="taille" name="taille" required></div>
      <div><label for="logiciels">Logiciels</label><input id="logiciels" name="logiciels" required></div>
      <div><label for="processus">Processus prioritaire</label><input id="processus" name="processus" required></div>
      <div><label for="volume">Volume indicatif</label><input id="volume" name="volume"></div>
      <div><label for="priorites">Priorités</label><textarea id="priorites" name="priorites"></textarea></div>
      <div><label for="contraintes">Contraintes</label><textarea id="contraintes" name="contraintes"></textarea></div>
      <div><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
      <button class="btn" type="submit">Envoyer le dossier</button>
      <p class="micro">Vos réponses servent à préparer l’architecture. Elles partent par votre messagerie. Aucun accès à vos systèmes n’est demandé.</p>
    </form>
  </div>
</section>
"""

pages = {
    ROOT / "index.html": page(P, "EXIOR | Transformez le fonctionnement de votre entreprise",
        "EXIOR conçoit l'architecture évolutive de votre entreprise : outils, données, processus et agents IA coordonnés. Votre plan personnalisé en 7 jours ouvrés, 990 €.",
        home, ""),
    ROOT / "architecture-evolutive/index.html": page(S, "Architecture évolutive d'entreprise — 990 € | EXIOR",
        "Conception de l'architecture évolutive de votre entreprise. 990 €, 7 jours ouvrés après le dossier complet. Déploiement sur devis.",
        arch, "architecture-evolutive/"),
    ROOT / "comment-ca-marche/index.html": page(S, "Comment EXIOR transforme le fonctionnement d'une entreprise",
        "Orchestrateur, agents spécialisés, outils, validation humaine et journal. La conception EXIOR, avant tout déploiement.",
        marche, "comment-ca-marche/"),
    ROOT / "applications-metiers/index.html": page(S, "EXIOR pour les syndics, cabinets comptables et entreprises de services",
        "Même principe d'architecture, processus propres au syndic, au cabinet comptable et à l'entreprise de services.",
        metiers, "applications-metiers/"),
    ROOT / "methode/index.html": page(S, "La méthode EXIOR — architecture personnalisée en 7 jours ouvrés",
        "Dossier complet, compréhension, conception, priorisation, livraison. 7 jours ouvrés. Déploiement distinct.",
        methode, "methode/"),
    ROOT / "faq/index.html": page(S, "Questions fréquentes — architecture EXIOR, 990 €",
        "Périmètre des 990 €, délai, logiciels existants, API, contrôle, données, déploiement facultatif.",
        faq, "faq/"),
    ROOT / "commander/index.html": page(S, "Commander l'architecture EXIOR — 990 € HT",
        "990 € HT, paiement unique, architecture livrée en 7 jours ouvrés après le dossier complet. Déploiement sur devis.",
        commander, "commander/"),
}

redirects = {
    "offre": "../architecture-evolutive/",
    "expertise": "../applications-metiers/",
    "situations": "../applications-metiers/",
    "sources": "../faq/",
    "privacy": "../confidentialite/",
    "terms": "../cgv/",
}

for path, html in pages.items():
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html)
    print("wrote", path.relative_to(ROOT))

for folder, url in redirects.items():
    p = ROOT / folder / "index.html"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(redirect(url))
    print("redirect", folder)
