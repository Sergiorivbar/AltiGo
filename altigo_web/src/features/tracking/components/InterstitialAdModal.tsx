import { useEffect, useState } from 'react';

const AD_DURATION_SECONDS = 5;

interface InterstitialAdModalProps {
  onDismissed: () => void;
}

/**
 * Simulates a full-screen AdMob interstitial for the web build.
 * AdMob is a mobile-only SDK (Android/iOS) — this overlay reproduces the
 * same UX contract (full-screen, blocks interaction, resolves on close)
 * so that when this gets ported to Flutter/React Native, only this
 * component needs to be swapped for the real `InterstitialAd` SDK call;
 * the FREE/PREMIUM decision logic in `StartRouteButton` stays untouched.
 */
export function InterstitialAdModal({ onDismissed }: InterstitialAdModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <div className="ad-overlay" role="dialog" aria-modal="true">
      <div className="ad-overlay__content">
        <span className="ad-overlay__badge">Anuncio · AltiGo Free</span>
        <h2>¡Hazte Premium y elimina los anuncios!</h2>
        <p>Disfruta de rutas sin interrupciones, fotos ilimitadas y contenido exclusivo.</p>
        <button
          className="ad-overlay__close"
          onClick={onDismissed}
          disabled={secondsLeft > 0}
        >
          {secondsLeft > 0 ? `Cerrar anuncio (${secondsLeft}s)` : 'Cerrar y empezar mi ruta'}
        </button>
      </div>
    </div>
  );
}
