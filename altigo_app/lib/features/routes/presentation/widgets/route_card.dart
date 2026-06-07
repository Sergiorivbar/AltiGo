import 'package:flutter/material.dart';

import '../../domain/entities/mountain_route.dart';

class RouteCard extends StatelessWidget {
  const RouteCard({super.key, required this.route, required this.onTap});

  final MountainRoute route;
  final VoidCallback onTap;

  String _difficultyLabel(RouteDifficulty difficulty) {
    switch (difficulty) {
      case RouteDifficulty.easy:
        return 'Fácil';
      case RouteDifficulty.moderate:
        return 'Moderada';
      case RouteDifficulty.hard:
        return 'Difícil';
      case RouteDifficulty.expert:
        return 'Experto';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        onTap: onTap,
        title: Text(route.name),
        subtitle: Text(
          '${route.distanceKm.toStringAsFixed(1)} km · '
          '+${route.elevationGainM.toStringAsFixed(0)} m · '
          '${_difficultyLabel(route.difficulty)}',
        ),
        trailing: route.isPremiumOnly
            ? const Icon(Icons.workspace_premium, color: Colors.amber)
            : const Icon(Icons.chevron_right),
      ),
    );
  }
}
