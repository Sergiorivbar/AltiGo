import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore';
import { ensureLocationPermission } from '../../../core/hooks/useGeolocation';
import { InterstitialAdModal } from './InterstitialAdModal';

/**
 * The monetization centerpiece (web port of the Flutter `StartRouteButton`):
 * when the user clicks "Iniciar Ruta" we check their role — resolved from
 * the backend (`user.isPremium`), never decided on the client alone.
 *   - FREE    -> show the full-screen simulated interstitial; once dismissed, start GPS
 *   - PREMIUM -> skip the ad and start GPS tracking immediately
 */
export function StartRouteButton({ routeId }: { routeId: string }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startTracking() {
    navigate(`/routes/${routeId}/active`);
  }

  async function handleClick() {
    if (isProcessing) return;
    setError(null);
    setIsProcessing(true);

    try {
      if (!user) {
        setError('Debes iniciar sesión para empezar una ruta.');
        return;
      }

      // 1. Check GPS permissions BEFORE showing the ad — no point making the
      //    user sit through an interstitial if tracking can't start afterwards.
      const hasLocationPermission = await ensureLocationPermission();
      if (!hasLocationPermission) {
        setError('Necesitamos acceso a tu ubicación para iniciar la ruta.');
        return;
      }

      // 2. THE CONDITIONAL LOGIC — heart of the monetization flow.
      if (!user.isPremium) {
        // FREE -> show the interstitial; `startTracking` runs onDismissed
        setShowAd(true);
        return;
      }

      // PREMIUM -> skip the ad entirely
      await startTracking();
    } finally {
      if (!showAd) setIsProcessing(false);
    }
  }

  async function handleAdDismissed() {
    setShowAd(false);
    await startTracking();
    setIsProcessing(false);
  }

  return (
    <>
      <button className="start-route-btn" onClick={handleClick} disabled={isProcessing}>
        {isProcessing && !showAd ? 'Preparando...' : '▶ Iniciar Ruta'}
      </button>
      {error && <p className="form-error">{error}</p>}
      {showAd && <InterstitialAdModal onDismissed={handleAdDismissed} />}
    </>
  );
}
