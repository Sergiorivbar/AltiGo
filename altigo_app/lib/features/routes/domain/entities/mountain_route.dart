enum RouteDifficulty { easy, moderate, hard, expert }

RouteDifficulty difficultyFromString(String value) {
  switch (value) {
    case 'easy':
      return RouteDifficulty.easy;
    case 'hard':
      return RouteDifficulty.hard;
    case 'expert':
      return RouteDifficulty.expert;
    default:
      return RouteDifficulty.moderate;
  }
}

/// Mirrors the `routes` table — most numeric fields (distance, elevation
/// gain/loss) are computed server-side by PostGIS triggers/functions.
class MountainRoute {
  const MountainRoute({
    required this.id,
    required this.name,
    required this.description,
    required this.difficulty,
    required this.distanceMeters,
    required this.elevationGainM,
    required this.elevationLossM,
    required this.estimatedDurationMin,
    required this.isPremiumOnly,
  });

  final String id;
  final String name;
  final String? description;
  final RouteDifficulty difficulty;
  final double distanceMeters;
  final double elevationGainM;
  final double elevationLossM;
  final int? estimatedDurationMin;
  final bool isPremiumOnly;

  double get distanceKm => distanceMeters / 1000;

  factory MountainRoute.fromJson(Map<String, dynamic> json) => MountainRoute(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String?,
        difficulty: difficultyFromString(json['difficulty'] as String? ?? 'moderate'),
        distanceMeters: double.tryParse('${json['distance_meters'] ?? 0}') ?? 0,
        elevationGainM: double.tryParse('${json['elevation_gain_m'] ?? 0}') ?? 0,
        elevationLossM: double.tryParse('${json['elevation_loss_m'] ?? 0}') ?? 0,
        estimatedDurationMin: json['estimated_duration_min'] as int?,
        isPremiumOnly: json['is_premium_only'] as bool? ?? false,
      );
}
