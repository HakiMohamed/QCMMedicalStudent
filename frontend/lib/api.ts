import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { setGlobalLoading } from './contexts/LoadingContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

let activeRequests = 0;

const updateLoading = (increment: boolean) => {
  if (increment) {
    activeRequests++;
    if (activeRequests === 1) {
      setGlobalLoading(true);
    }
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) {
      setGlobalLoading(false);
    }
  }
};

// Création de l'instance axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor pour les requêtes
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    updateLoading(true);
    
    // Ajouter un token d'authentification si disponible
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('accessToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    updateLoading(false);
    return Promise.reject(error);
  }
);

// Interceptor pour les réponses
apiClient.interceptors.response.use(
  (response) => {
    updateLoading(false);
    return response;
  },
  (error: AxiosError) => {
    updateLoading(false);
    // Gestion globale des erreurs
    if (error.response) {
      // Erreur avec réponse du serveur
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          // Non autorisé - rediriger vers login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          break;
        case 403:
          // Accès interdit
          console.error('Accès interdit');
          break;
        case 404:
          // Ressource non trouvée
          console.error('Ressource non trouvée');
          break;
        case 500:
          // Erreur serveur
          console.error('Erreur serveur');
          break;
        default:
          console.error('Erreur inconnue:', status);
      }

      // Retourner le message d'erreur du serveur si disponible
      const errorMessage = data?.message || error.message || 'Une erreur est survenue';
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Requête envoyée mais pas de réponse
      console.error('Pas de réponse du serveur');
      return Promise.reject(new Error('Impossible de contacter le serveur. Vérifiez votre connexion.'));
    } else {
      // Erreur lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message);
      return Promise.reject(error);
    }
  }
);

export default apiClient;

