// Art Institute of Chicago API — free, no key required
// Docs: https://api.artic.edu/docs/

const AIC_BASE = "https://api.artic.edu/api/v1";
const AIC_IIIF = "https://www.artic.edu/iiif/2";

export interface ArtPhoto {
  id: number;
  title: string;
  artist_title: string | null;
  image_id: string | null;
  thumbnail: { width: number; height: number } | null;
}

/** Build an IIIF image URL at the requested width */
export const aicImageUrl = (imageId: string, width = 843) =>
  `${AIC_IIIF}/${imageId}/full/${width},/0/default.jpg`;

/** Convert an AIC artwork into a standardised photo object our components use */
export const toPhoto = (art: ArtPhoto) => ({
  id: art.id,
  artist: art.artist_title || "Unknown",
  alt: art.title || "Artwork",
  medium: art.image_id ? aicImageUrl(art.image_id, 400) : "",
  large: art.image_id ? aicImageUrl(art.image_id, 1686) : "",
});

export type NormalizedPhoto = ReturnType<typeof toPhoto>;

const FIELDS = "id,title,artist_title,image_id,thumbnail";

/** Search artworks by keyword */
export async function searchArt(query: string, limit = 20): Promise<NormalizedPhoto[]> {
  const res = await fetch(
    `${AIC_BASE}/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}&fields=${FIELDS}&query[term][is_public_domain]=true`
  );
  const data = await res.json();
  return (data.data || [])
    .filter((a: ArtPhoto) => a.image_id)
    .map(toPhoto);
}

/** Get curated / popular artworks */
export async function getCuratedArt(limit = 20): Promise<NormalizedPhoto[]> {
  const res = await fetch(
    `${AIC_BASE}/artworks?limit=${limit}&fields=${FIELDS}&query[term][is_public_domain]=true`
  );
  const data = await res.json();
  return (data.data || [])
    .filter((a: ArtPhoto) => a.image_id)
    .map(toPhoto);
}
