import React, { useState, useEffect } from 'react';
import { Users, ExternalLink, Check, X, AlertTriangle, Loader } from 'lucide-react';
import { tiktokAPI, TikTokUser, TikTokFollower } from '../services/tiktokApi';

interface RealTikTokAuthProps {
  onFollowersLoaded: (followers: TikTokFollower[]) => void;
  onClose: () => void;
}

const RealTikTokAuth: React.FC<RealTikTokAuthProps> = ({ onFollowersLoaded, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [user, setUser] = useState<TikTokUser | null>(null);
  const [followers, setFollowers] = useState<TikTokFollower[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const savedToken = tiktokAPI.loadToken();
    if (savedToken) {
      setIsConnected(true);
      loadUserInfo();
    }

    // Vérifier si nous revenons d'une autorisation TikTok
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setError(`Erreur d'autorisation: ${error}`);
    } else if (code) {
      handleAuthorizationCode(code);
    }
  }, []);

  const handleAuthorizationCode = async (code: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const token = await tiktokAPI.exchangeCodeForToken(code);
      tiktokAPI.saveToken(token);
      setIsConnected(true);
      await loadUserInfo();
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      const userInfo = await tiktokAPI.getUserInfo();
      setUser(userInfo);
    } catch (err) {
      setError('Erreur lors du chargement des informations utilisateur');
      console.error(err);
    }
  };

  const connectToTikTok = () => {
    setError(null);
    const authUrl = tiktokAPI.getAuthorizationUrl();
    window.location.href = authUrl;
  };

  const loadFollowers = async () => {
    setIsLoadingFollowers(true);
    setError(null);

    try {
      const followersData = await tiktokAPI.getAllFollowers();
      setFollowers(followersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des abonnés');
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const useFollowers = () => {
    onFollowersLoaded(followers);
    onClose();
  };

  const disconnect = () => {
    tiktokAPI.logout();
    setIsConnected(false);
    setUser(null);
    setFollowers([]);
  };

  const SetupInstructions = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-orange-600 mb-4">
        <AlertTriangle size={20} />
        <span className="font-semibold">Configuration requise</span>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
        <h4 className="font-semibold text-gray-800">Pour utiliser l'API TikTok réelle :</h4>
        
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>
            Créez une application sur le{' '}
            <a 
              href="https://developers.tiktok.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              TikTok Developer Portal
            </a>
          </li>
          <li>Obtenez votre <code className="bg-gray-200 px-1 rounded">Client Key</code> et <code className="bg-gray-200 px-1 rounded">Client Secret</code></li>
          <li>Configurez l'URI de redirection : <code className="bg-gray-200 px-1 rounded text-xs">{window.location.origin}</code></li>
          <li>Remplacez les valeurs dans <code className="bg-gray-200 px-1 rounded">src/services/tiktokApi.ts</code></li>
          <li>Activez les permissions : <code className="bg-gray-200 px-1 rounded text-xs">user.info.basic</code>, <code className="bg-gray-200 px-1 rounded text-xs">user.info.profile</code></li>
          <li>Ajoutez votre domaine dans les "Authorized domains" de votre app TikTok</li>
        </ol>

        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 text-xs font-semibold mb-1">
            ⚠️ Erreur actuelle : Client Key invalide
          </p>
          <p className="text-yellow-800 text-xs">
            <strong>Solution :</strong> Remplacez les valeurs par défaut dans le code par vos vraies clés TikTok.
            Les clés actuelles sont des exemples et ne fonctionnent pas.
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setShowSetupInstructions(false)}
          className="flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Retour
        </button>
        <button
          onClick={connectToTikTok}
          className="flex-1 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Essayer quand même
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-black">Connexion TikTok Réelle</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {showSetupInstructions ? (
          <SetupInstructions />
        ) : !isConnected ? (
          <div className="space-y-4">
            <div className="text-center">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Connectez votre vrai compte TikTok pour utiliser vos vrais abonnés !
              </p>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {isConnecting ? (
                <div className="flex items-center justify-center space-x-2 py-3">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Connexion en cours...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={connectToTikTok}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink size={20} />
                    <span>Se connecter à TikTok</span>
                  </button>
                  
                  <button
                    onClick={() => setShowSetupInstructions(true)}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Instructions de configuration
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600 mb-4">
              <Check size={20} />
              <span className="font-semibold">Connecté avec succès !</span>
            </div>

            {user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={user.avatar_url} 
                    alt={user.display_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{user.display_name}</h4>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>
              </div>
            )}

            {followers.length === 0 ? (
              <div className="text-center">
                <button
                  onClick={loadFollowers}
                  disabled={isLoadingFollowers}
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isLoadingFollowers ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Chargement des abonnés...</span>
                    </>
                  ) : (
                    <>
                      <Users size={20} />
                      <span>Charger mes abonnés</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Abonnés trouvés : {followers.length}
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {followers.slice(0, 10).map(follower => (
                      <div key={follower.open_id} className="flex items-center space-x-3">
                        <img 
                          src={follower.avatar_url} 
                          alt={follower.display_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {follower.display_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            @{follower.username}
                          </p>
                        </div>
                        {follower.follower_count && (
                          <span className="text-xs text-gray-400">
                            {follower.follower_count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                    {followers.length > 10 && (
                      <p className="text-xs text-gray-500 text-center">
                        ... et {followers.length - 10} autres
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={useFollowers}
                    className="flex items-center justify-center space-x-2 flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check size={16} />
                    <span>Utiliser ces abonnés</span>
                  </button>
                  <button
                    onClick={loadFollowers}
                    disabled={isLoadingFollowers}
                    className="flex items-center justify-center space-x-2 flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Users size={16} />
                    <span>Recharger</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={disconnect}
              className="w-full py-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTikTokAuth;