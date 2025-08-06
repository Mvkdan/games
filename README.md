# TikTok Games Platform

Une plateforme de jeux TikTok avec enregistrement vidéo, incluant un jeu de balle rebondissante et un système de bataille entre abonnés TikTok.

## Fonctionnalités

### Jeux disponibles
- **Bouncing Ball** : Jeu de balle rebondissante avec effets visuels
- **TikTok Battle** : Combat entre abonnés TikTok avec physique réaliste

### Intégration TikTok
- Connexion avec de vrais comptes TikTok via l'API officielle
- Utilisation des vrais abonnés dans les jeux
- Mode simulé avec des abonnés fictifs pour les tests

### Enregistrement vidéo
- Enregistrement en format vertical TikTok (1080x1920)
- Qualité HD à 60 FPS
- Téléchargement direct des vidéos

## Configuration de l'API TikTok

Pour utiliser l'intégration TikTok réelle :

### 1. Créer une application TikTok

1. Rendez-vous sur le [TikTok Developer Portal](https://developers.tiktok.com/)
2. Créez un nouveau projet/application
3. Configurez les paramètres de votre application

### 2. Configuration des permissions

Demandez les permissions suivantes :
- `user.info.basic` : Informations de base de l'utilisateur
- `user.info.profile` : Profil utilisateur (nom, avatar)
- `user.info.stats` : Statistiques (optionnel)

### 3. Configuration de l'URI de redirection

Ajoutez cette URI de redirection dans votre application TikTok :
```
http://localhost:5173/auth/tiktok/callback
```

Pour la production, remplacez par votre domaine :
```
https://votre-domaine.com/auth/tiktok/callback
```

### 4. Configuration du code

Modifiez le fichier `src/services/tiktokApi.ts` :

```typescript
const defaultConfig: TikTokConfig = {
  clientKey: 'VOTRE_VRAI_CLIENT_KEY', // Remplacez par votre vraie Client Key depuis TikTok Developer Portal
  clientSecret: 'VOTRE_VRAI_CLIENT_SECRET', // Remplacez par votre vraie Client Secret
  redirectUri: window.location.origin + '/auth/tiktok/callback',
  scope: ['user.info.basic', 'user.info.profile']
};
```

### ⚠️ **IMPORTANT : Erreur actuelle**

L'erreur que vous voyez ("client_key invalide") est normale car les clés dans le code sont des exemples qui ne fonctionnent pas. 

**Pour résoudre cette erreur :**

1. **Créez votre propre application TikTok** sur [developers.tiktok.com](https://developers.tiktok.com/)
2. **Obtenez vos vraies clés** (Client Key et Client Secret)
3. **Remplacez les valeurs** dans `src/services/tiktokApi.ts`
4. **Configurez l'URI de redirection** : `https://relaxed-narwhal-eb8064.netlify.app`
5. **Ajoutez votre domaine** dans les "Authorized domains" de votre app TikTok

### 5. Variables d'environnement (optionnel)

Créez un fichier `.env` pour sécuriser vos clés :

```env
VITE_TIKTOK_CLIENT_KEY=votre_client_key
VITE_TIKTOK_CLIENT_SECRET=votre_client_secret
```

Puis modifiez `tiktokApi.ts` :

```typescript
const defaultConfig: TikTokConfig = {
  clientKey: import.meta.env.VITE_TIKTOK_CLIENT_KEY || 'VOTRE_CLIENT_KEY',
  clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || 'VOTRE_CLIENT_SECRET',
  // ...
};
```

## Limitations de l'API TikTok

### Accès aux abonnés
- L'accès à la liste des abonnés peut être limité selon les politiques de TikTok
- Certaines fonctionnalités peuvent nécessiter une approbation spéciale de TikTok
- Le nombre d'abonnés récupérables peut être limité

### Taux de requêtes
- L'API TikTok a des limites de taux strictes
- L'application implémente des pauses entre les requêtes pour respecter ces limites

### Permissions
- Les permissions peuvent varier selon le type de compte (personnel vs business)
- Certaines données peuvent nécessiter des permissions spéciales

## Installation et développement

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Build pour la production
npm run build
```

## Technologies utilisées

- **React** + **TypeScript** : Interface utilisateur
- **Tailwind CSS** : Styles
- **Canvas API** : Rendu des jeux
- **MediaRecorder API** : Enregistrement vidéo
- **TikTok API** : Intégration TikTok
- **Vite** : Build tool

## Structure du projet

```
src/
├── components/
│   ├── GameMenu.tsx           # Menu principal
│   ├── BouncingBallGame.tsx   # Jeu de balle rebondissante
│   ├── TikTokBattleGame.tsx   # Jeu de bataille TikTok
│   ├── TikTokAuth.tsx         # Authentification simulée
│   ├── RealTikTokAuth.tsx     # Authentification réelle
│   └── VideoRecorder.tsx      # Enregistrement vidéo
├── services/
│   └── tiktokApi.ts          # Service API TikTok
└── App.tsx                   # Composant principal
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.

## Licence

Ce projet est sous licence MIT.

---

**Créé par Kyle8973**