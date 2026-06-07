import { useEffect, useRef, useState } from 'react';
import { mediaApi, type RoutePhotoDto } from '../api/mediaApi';

export function PhotoGallery({ routeId }: { routeId: string }) {
  const [photos, setPhotos] = useState<RoutePhotoDto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function reload() {
    mediaApi.list(routeId).then(setPhotos).catch(() => undefined);
  }

  useEffect(reload, [routeId]);

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await mediaApi.upload(routeId, file);
      reload();
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="photo-gallery">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileSelected}
      />
      <button
        className="outlined-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? 'Subiendo...' : '📷 Añadir foto de la ruta'}
      </button>

      <div className="photo-gallery__grid">
        {photos.map((photo) => (
          <figure key={photo.id} className="photo-gallery__item">
            <img src={photo.photo_url} alt={photo.caption ?? 'Foto de la ruta'} />
            {photo.caption && <figcaption>{photo.caption}</figcaption>}
          </figure>
        ))}
        {photos.length === 0 && <p className="muted">Aún no hay fotos para esta ruta.</p>}
      </div>
    </div>
  );
}
