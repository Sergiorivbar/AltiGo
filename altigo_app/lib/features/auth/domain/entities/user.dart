enum UserRole { free, premium, admin }

UserRole userRoleFromString(String value) {
  switch (value) {
    case 'premium':
      return UserRole.premium;
    case 'admin':
      return UserRole.admin;
    default:
      return UserRole.free;
  }
}

class User {
  const User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.isPremiumActive = false,
  });

  final String id;
  final String email;
  final String? fullName;
  final UserRole role;

  /// Resolved from the backend's `/billing/subscription-status` endpoint —
  /// the single source of truth for whether the AdMob interstitial is skipped.
  final bool isPremiumActive;

  bool get isPremium => isPremiumActive;

  User copyWith({UserRole? role, bool? isPremiumActive}) => User(
        id: id,
        email: email,
        fullName: fullName,
        role: role ?? this.role,
        isPremiumActive: isPremiumActive ?? this.isPremiumActive,
      );

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as String,
        email: json['email'] as String,
        fullName: json['fullName'] as String? ?? json['full_name'] as String?,
        role: userRoleFromString(json['role'] as String? ?? 'free'),
      );
}
