interface TikTokConfig {
  clientKey: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

interface TikTokUser {
  open_id: string;
  union_id: string;
  avatar_url: string;
  display_name: string;
  username: string;
}

interface TikTokFollower {
  open_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  follower_count?: number;
}

class TikTokAPI {
  private config: TikTokConfig;
  private accessToken: string | null = null;

  constructor(config: TikTokConfig) {
    this.config = config;
  }

  // Étape 1: Générer l'URL d'autorisation
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_key: this.config.clientKey,
      scope: this.config.scope.join(','),
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      state: this.generateState() // Pour la sécurité
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  // Étape 2: Échanger le code d'autorisation contre un access token
  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.config.clientKey,
        client_secret: this.config.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erreur TikTok API: ${data.error_description || data.error}`);
    }

    this.accessToken = data.access_token;
    return data.access_token;
  }

  // Étape 3: Récupérer les informations de l'utilisateur
  async getUserInfo(): Promise<TikTokUser> {
    if (!this.accessToken) {
      throw new Error('Access token requis');
    }

    const response = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'username']
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des infos utilisateur: ${data.error.message}`);
    }

    return data.data.user;
  }

  // Étape 4: Récupérer les abonnés (Note: Cette API peut être limitée)
  async getFollowers(cursor?: string): Promise<{ followers: TikTokFollower[], cursor?: string, hasMore: boolean }> {
    if (!this.accessToken) {
      throw new Error('Access token requis');
    }

    const body: any = {
      max_count: 20,
      fields: ['open_id', 'username', 'display_name', 'avatar_url', 'follower_count']
    };

    if (cursor) {
      body.cursor = cursor;
    }

    const response = await fetch('https://open.tiktokapis.com/v2/user/followers/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des abonnés: ${data.error.message}`);
    }

    return {
      followers: data.data.users || [],
      cursor: data.data.cursor,
      hasMore: data.data.has_more || false
    };
  }

  // Récupérer tous les abonnés (avec pagination)
  async getAllFollowers(): Promise<TikTokFollower[]> {
    const allFollowers: TikTokFollower[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore && allFollowers.length < 100) { // Limite à 100 pour éviter les timeouts
      try {
        const result = await this.getFollowers(cursor);
        allFollowers.push(...result.followers);
        cursor = result.cursor;
        hasMore = result.hasMore;
        
        // Pause pour respecter les limites de taux
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Erreur lors de la récupération des abonnés:', error);
        break;
      }
    }

    return allFollowers;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Méthode pour vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Méthode pour déconnecter l'utilisateur
  logout(): void {
    this.accessToken = null;
    localStorage.removeItem('tiktok_access_token');
  }

  // Sauvegarder le token dans le localStorage
  saveToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('tiktok_access_token', token);
  }

  // Charger le token depuis le localStorage
  loadToken(): string | null {
    const token = localStorage.getItem('tiktok_access_token');
    if (token) {
      this.accessToken = token;
    }
    return token;
  }
}

// Configuration par défaut (vous devez remplacer ces valeurs)
const defaultConfig: TikTokConfig = {
  clientKey: 'sbawulcxdn8hgi2v71', // À remplacer par votre vraie clé
  clientSecret: '295Jy7pimKrHMfQuzl8bQYDebCggNQGS', // À remplacer par votre vraie clé secrète
  redirectUri: window.location.origin + '/auth/tiktok/callback',
  scope: ['user.info.profile', 'user.info.stats'] // Ajustez selon vos besoins
};

export const tiktokAPI = new TikTokAPI(defaultConfig);
export type { TikTokUser, TikTokFollower };