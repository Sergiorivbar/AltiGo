import 'dart:async';

import 'package:google_mobile_ads/google_mobile_ads.dart';

/// Loads and shows the full-screen interstitial ad shown to FREE users
/// right before a route starts. Encapsulates AdMob's lifecycle so the
/// rest of the app only deals with a single `Future`.
class AdMobService {
  AdMobService._();
  static final AdMobService instance = AdMobService._();

  InterstitialAd? _interstitialAd;
  bool _isLoading = false;

  /// Google's official TEST ad unit ID for interstitials (Android).
  /// Replace with the real ad unit ID before shipping to production.
  static const _testInterstitialAdUnitId = 'ca-app-pub-3940256099942544/1033173712';

  /// Pre-loads the ad so it's ready by the time the user taps "Iniciar Ruta".
  /// Call this from the route detail screen's initState.
  Future<void> preloadInterstitial() async {
    if (_interstitialAd != null || _isLoading) return;
    _isLoading = true;

    await InterstitialAd.load(
      adUnitId: _testInterstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _isLoading = false;
        },
        onAdFailedToLoad: (error) {
          _interstitialAd = null;
          _isLoading = false;
        },
      ),
    );
  }

  /// Shows the ad (if available) and resolves once it's dismissed.
  /// If no ad is ready, resolves immediately so a third-party SDK hiccup
  /// never blocks the user from starting their route.
  Future<void> showInterstitialAndWait() {
    final completer = Completer<void>();
    final ad = _interstitialAd;

    if (ad == null) {
      completer.complete();
      return completer.future;
    }

    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _interstitialAd = null;
        completer.complete();
        preloadInterstitial(); // warm up the next one
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _interstitialAd = null;
        completer.complete();
      },
    );

    ad.show();
    return completer.future;
  }
}
