import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../data/repositories/media_repository.dart';

/// Lets the user pick a photo from the gallery/camera and upload it for
/// a given route (simulated cloud storage on the backend side).
class PhotoUploader extends StatefulWidget {
  const PhotoUploader({super.key, required this.routeId});

  final String routeId;

  @override
  State<PhotoUploader> createState() => _PhotoUploaderState();
}

class _PhotoUploaderState extends State<PhotoUploader> {
  final _repository = MediaRepository();
  bool _isUploading = false;

  Future<void> _pickAndUpload() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;

    setState(() => _isUploading = true);
    try {
      await _repository.uploadRoutePhoto(routeId: widget.routeId, filePath: picked.path);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Foto subida correctamente')),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo subir la foto')),
      );
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: _isUploading ? null : _pickAndUpload,
      icon: _isUploading
          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
          : const Icon(Icons.add_a_photo),
      label: Text(_isUploading ? 'Subiendo...' : 'Añadir foto de la ruta'),
    );
  }
}
