import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { subscriptionApi } from '../api/subscriptionApi';

/**
 * Lets a FREE user upgrade to Premium via the simulated Stripe (test mode)
 * checkout on the backend (card 4242 4242 4242 4242 / `pm_card_visa`).
 * On success we refresh the subscription status so `StartRouteButton`
 * immediately stops showing the interstitial.
 */
export function UpgradePage() {
  const navigate = useNavigate();
  const refreshSubscriptionStatus = useAuthStore((s) => s.refreshSubscriptionStatus);

  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  async function handleSubscribe() {
    setIsProcessing(true);
    setFeedback(null);
    try {
      await subscriptionApi.subscribe();
      await refreshSubscriptionStatus();
      setFeedback({ kind: 'success', message: '¡Ya eres Premium! Disfruta de la app sin anuncios.' });
      setTimeout(() => navigate('/routes'), 1500);
    } catch {
      setFeedback({ kind: 'error', message: 'No se pudo procesar el pago. Inténtalo de nuevo.' });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="page page--centered">
      <div className="upgrade-card">
        <span className="upgrade-card__icon">🏔️</span>
        <h1>Hazte Premium</h1>
        <p>Sin anuncios al iniciar tus rutas, fotos ilimitadas y rutas exclusivas.</p>
        <p className="muted">Pago simulado con Stripe en modo test (tarjeta 4242 4242 4242 4242).</p>

        {feedback && (
          <p className={feedback.kind === 'success' ? 'form-success' : 'form-error'}>
            {feedback.message}
          </p>
        )}

        <button onClick={handleSubscribe} disabled={isProcessing}>
          {isProcessing ? 'Procesando pago...' : 'Suscribirme (modo prueba Stripe)'}
        </button>
      </div>
    </div>
  );
}
