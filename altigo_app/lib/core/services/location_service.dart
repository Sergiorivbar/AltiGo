import 'package:geolocator/geolocator.dart';

/// Wraps GPS permission handling and the real-time position stream
/// used while a route is in progress.
class LocationService {
  Future<bool> ensurePermissions() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.deniedForever) return false;

    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    return serviceEnabled &&
        (permission == LocationPermission.always || permission == LocationPermission.whileInUse);
  }

  Stream<Position> trackPosition() {
    const settings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 5, // minimum meters between updates
    );
    return Geolocator.getPositionStream(locationSettings: settings);
  }
}
