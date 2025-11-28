# État d'Implémentation des Fonctionnalités

Ce document suit l'avancement du développement des fonctionnalités clés de l'application "Planificateur Théocratique".

## Légende des Statuts

-   ✅ **Implémenté** : La fonctionnalité est complète et fonctionnelle.
-   🟡 **Partiellement implémenté** : La fonctionnalité existe mais est incomplète ou manque de certains aspects.
-   ❌ **Non implémenté** : La fonctionnalité n'a pas encore été développée.

## Suivi des Fonctionnalités Administrateur

| Réf.     | Fonctionnalité                                                                                                   | Statut                        | Détails                                                                                                                                                                                            |
| :------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ADM-01** | Créer, modifier ou archiver un **type de sujet**.                                                                  | ✅ **Implémenté**               | La création, la modification et l'archivage des types de sujets sont maintenant entièrement fonctionnels via l'interface d'administration.                                                              |
| **ADM-02** | Ajouter / mettre à jour un **participant** (âge, genre, rôle, disponibilités).                                     | ✅ **Implémenté**               | L'ajout et la mise à jour des informations des participants, y compris la gestion de leurs semaines d'indisponibilité, sont entièrement fonctionnels.                                               |
| **ADM-03** | Lancer la **génération automatique** du planning pour X semaines.                                                  | ✅ **Implémenté**               | La génération automatique est possible pour plusieurs semaines consécutives. L'IA tient compte de l'historique mis à jour après chaque semaine pour garantir la continuité et la rotation.         |
| **ADM-04** | **Forcer** manuellement une affectation ou un remplacement.                                                       | ✅ **Implémenté**               | Il est désormais possible de modifier manuellement une affectation (remplacer un participant) directement depuis la vue détaillée d'un programme.                                                 |
| **ADM-05** | Recevoir une **alerte J-1** avant la publication du nouveau planning.                                              | ✅ **Implémenté**               | Un système de statut de programme (Brouillon / Publié) a été ajouté. Une notification alerte les administrateurs lorsqu'un brouillon approche de sa date de début, les invitant à le valider et le publier. |
| **ADM-06** | **Exporter** le planning en PDF / impression.                                                                    | ✅ **Implémenté**               | Une fonctionnalité d'impression optimisée et de partage (via l'API Web Share) est disponible pour chaque programme généré.                                                                        |
| **ADM-07** | Consulter un **dashboard de statistiques** (sujets/utilisateur, fréquence, répartition par type/âge).              | ✅ **Implémenté** | Le tableau de bord des statistiques a été amélioré avec des analyses détaillées par âge et par fréquence d'attribution, en plus des vues existantes.                                        |
| **ADM-08** | Configurer la **périodicité d’actualisation** des listes (rotation).                                               | ✅ **Implémenté**               | La configuration de la rotation en semaines (`rotationWeeks`) pour chaque type de sujet est possible via l'écran "Sujets", ce qui répond au besoin.                                                  |
| **ADM-09** | Gérer l'**exclusion temporaire** d'un participant et recevoir une alerte pour sa réévaluation.                   | 🟡 **Partiellement implémenté** | L'interface permet d'exclure/réactiver un participant. Toutefois, la date de fin n'est pas configurable et l'alerte de réévaluation est limitée à une icône dans la liste des participants.       |

## Suivi des Fonctionnalités Membre

| Réf.     | Fonctionnalité                                                                         | Statut                        | Détails                                                                                                                                                                        |
| :------- | :------------------------------------------------------------------------------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MEM-01** | Consulter **mes sujets à venir** et la date.                                             | ✅ **Implémenté**               | Un écran dédié "Mes Sujets" permet désormais aux membres de consulter leurs attributions à venir via un sélecteur de participant.                                                  |
| **MEM-02** | **Signaler une indisponibilité** sur un créneau.                                         | ✅ **Implémenté**           | Un membre peut désormais gérer ses propres indisponibilités depuis son écran personnel "Mes Sujets", via un calendrier de sélection de semaines.                                    |
| **MEM-03** | Accéder à **mon historique** de participation.                                           | ✅ **Implémenté**               | Un écran dédié "Mes Sujets" permet de consulter l'historique de participation via un sélecteur de participant.                                                                 |
| **MEM-04** | Recevoir une **notification (mail / push)** dès qu’un nouveau planning me concerne.   | ❌ **Non implémenté**           | Le système de notifications actuel est uniquement destiné aux administrateurs pour la validation des programmes.                                                               |

## Suivi des Fonctionnalités Système

| Réf. | Fonctionnalité | Statut | Détails |
| :--- | :--- | :--- | :--- |
| **SYS-01** | Appliquer les contraintes (âge, genre, rôle, rotation, etc.) lors de la génération. | ✅ **Implémenté** | Le prompt envoyé à l'IA inclut l'ensemble des règles et contraintes définies dans l'application pour garantir un planning conforme. |
| **SYS-02** | Recalculer automatiquement lorsqu’un forçage est appliqué. | ❌ **Non implémenté** | Une modification manuelle est une exception et ne déclenche pas une nouvelle génération automatique du reste du planning. |
| **SYS-03** | Enregistrer chaque opération pour le log d’audit. | ❌ **Non implémenté** | Seule la date de "dernière modification" d'un programme est enregistrée, sans détail sur la nature ou l'auteur du changement. |
| **SYS-04** | Mettre à jour en temps réel les indicateurs demandés. | ✅ **Implémenté** | L'architecture de l'application (basée sur React) garantit que les données, notamment dans le dashboard des statistiques, sont recalculées et affichées en temps réel. |