import React, { useState, useEffect } from 'react';
import { Users, ExternalLink, Check, X } from 'lucide-react';

interface TikTokFollower {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  follower_count?: number;
}

interface TikTokAuthProps {
  onFollowersLoaded: (followers: TikTokFollower[]) => void;
  onClose: () => void;
}

const TikTokAuth: React.FC<TikTokAuthProps> = ({ onFollowersLoaded, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [followers, setFollowers] = useState<TikTokFollower[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simuler la connexion TikTok (en attendant l'API officielle)
  const connectToTikTok = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Simulation d'une connexion TikTok
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler des abonnés TikTok réels
      const mockFollowers: TikTokFollower[] = [
        { id: '1', username: '@sarah_dance', display_name: 'Sarah', avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 15000 },
        { id: '2', username: '@mike_comedy', display_name: 'Mike', avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 8500 },
        { id: '3', username: '@emma_lifestyle', display_name: 'Emma', avatar_url: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 22000 },
        { id: '4', username: '@alex_fitness', display_name: 'Alex', avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 12000 },
        { id: '5', username: '@lisa_art', display_name: 'Lisa', avatar_url: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 18500 },
        { id: '6', username: '@david_music', display_name: 'David', avatar_url: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 31000 },
        { id: '7', username: '@anna_travel', display_name: 'Anna', avatar_url: 'https://images.pexels.com/photos/1081685/pexels-photo-1081685.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 9200 },
        { id: '8', username: '@tom_gaming', display_name: 'Tom', avatar_url: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 45000 },
        { id: '9', username: '@sophie_food', display_name: 'Sophie', avatar_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 16800 },
        { id: '10', username: '@ryan_tech', display_name: 'Ryan', avatar_url: 'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 27500 },
        { id: '11', username: '@mia_fashion', display_name: 'Mia', avatar_url: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 38000 },
        { id: '12', username: '@jake_sports', display_name: 'Jake', avatar_url: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 14200 },
        { id: '13', username: '@chloe_beauty', display_name: 'Chloe', avatar_url: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 52000 },
        { id: '14', username: '@noah_diy', display_name: 'Noah', avatar_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 11500 },
        { id: '15', username: '@zoe_pets', display_name: 'Zoe', avatar_url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 19800 },
        { id: '16', username: '@ethan_comedy', display_name: 'Ethan', avatar_url: 'https://images.pexels.com/photos/1181717/pexels-photo-1181717.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 33500 },
        { id: '17', username: '@ava_dance', display_name: 'Ava', avatar_url: 'https://images.pexels.com/photos/1181721/pexels-photo-1181721.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 41000 },
        { id: '18', username: '@lucas_vlogs', display_name: 'Lucas', avatar_url: 'https://images.pexels.com/photos/1181724/pexels-photo-1181724.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 28700 },
        { id: '19', username: '@grace_singing', display_name: 'Grace', avatar_url: 'https://images.pexels.com/photos/1181725/pexels-photo-1181725.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 17300 },
        { id: '20', username: '@mason_pranks', display_name: 'Mason', avatar_url: 'https://images.pexels.com/photos/1181730/pexels-photo-1181730.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop', follower_count: 36200 }
      ];

      setFollowers(mockFollowers);
      setIsConnected(true);
      
    } catch (err) {
      setError('Erreur lors de la connexion à TikTok. Veuillez réessayer.');
    } finally {
      setIsConnecting(false);
    }
  };

  const useFollowers = () => {
    onFollowersLoaded(followers);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-black">Connexion TikTok</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <div className="text-center">
              <Users size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Connectez votre compte TikTok pour utiliser vos vrais abonnés dans le jeu !
              </p>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={connectToTikTok}
                disabled={isConnecting}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink size={20} />
                    <span>Se connecter à TikTok</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>⚠️ Version démo : utilise des abonnés simulés</p>
              <p>L'API TikTok officielle sera intégrée prochainement</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600 mb-4">
              <Check size={20} />
              <span className="font-semibold">Connecté avec succès !</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                Abonnés trouvés : {followers.length}
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {followers.slice(0, 10).map(follower => (
                  <div key={follower.id} className="flex items-center space-x-3">
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
                        {follower.username}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {follower.follower_count?.toLocaleString()}
                    </span>
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
                onClick={() => {
                  setIsConnected(false);
                  setFollowers([]);
                }}
                className="flex items-center justify-center space-x-2 flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Users size={16} />
                <span>Reconnecter</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TikTokAuth;