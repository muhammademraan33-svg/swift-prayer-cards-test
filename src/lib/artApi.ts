// Combined Pexels + Pixabay image API

const PEXELS_API_KEY = "X6x17AZ7r5kg7ViRIiE33JuEwA7RHF17EbdFYNXg5jqn5mNRg2EAvkwl";
const PIXABAY_API_KEY = "54670247-d6839253912348db4e9fc20e1";

export interface NormalizedPhoto {
  id: string;
  artist: string;
  alt: string;
  medium: string;
  large: string;
  source: "pexels" | "pixabay";
}

// --- Pexels ---
async function pexelsSearch(query: string, limit: number): Promise<NormalizedPhoto[]> {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const data = await res.json();
    return (data.photos || []).map((p: any) => ({
      id: `pexels-${p.id}`,
      artist: p.photographer || "Unknown",
      alt: p.alt || query,
      medium: p.src.medium,
      large: p.src.large2x,
      source: "pexels" as const,
    }));
  } catch {
    return [];
  }
}

async function pexelsCurated(limit: number): Promise<NormalizedPhoto[]> {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/curated?per_page=${limit}`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const data = await res.json();
    return (data.photos || []).map((p: any) => ({
      id: `pexels-${p.id}`,
      artist: p.photographer || "Unknown",
      alt: p.alt || "Photo",
      medium: p.src.medium,
      large: p.src.large2x,
      source: "pexels" as const,
    }));
  } catch {
    return [];
  }
}

// --- Pixabay ---
async function pixabaySearch(query: string, limit: number): Promise<NormalizedPhoto[]> {
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${limit}&orientation=horizontal&image_type=photo&safesearch=true`
    );
    const data = await res.json();
    return (data.hits || []).map((h: any) => ({
      id: `pixabay-${h.id}`,
      artist: h.user || "Unknown",
      alt: h.tags || query,
      medium: h.webformatURL,
      large: h.largeImageURL,
      source: "pixabay" as const,
    }));
  } catch {
    return [];
  }
}

async function pixabayCurated(limit: number): Promise<NormalizedPhoto[]> {
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&per_page=${limit}&orientation=horizontal&image_type=photo&safesearch=true&editors_choice=true`
    );
    const data = await res.json();
    return (data.hits || []).map((h: any) => ({
      id: `pixabay-${h.id}`,
      artist: h.user || "Unknown",
      alt: h.tags || "Photo",
      medium: h.webformatURL,
      large: h.largeImageURL,
      source: "pixabay" as const,
    }));
  } catch {
    return [];
  }
}

// --- Interleave results from both sources ---
function interleave(a: NormalizedPhoto[], b: NormalizedPhoto[]): NormalizedPhoto[] {
  const result: NormalizedPhoto[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}

/** Search both Pexels and Pixabay, merge results */
export async function searchPhotos(query: string, limit = 20): Promise<NormalizedPhoto[]> {
  const half = Math.ceil(limit / 2);
  const [pexels, pixabay] = await Promise.all([
    pexelsSearch(query, half),
    pixabaySearch(query, half),
  ]);
  return interleave(pexels, pixabay);
}

/** Get curated photos from both sources */
export async function getCuratedPhotos(limit = 20): Promise<NormalizedPhoto[]> {
  const half = Math.ceil(limit / 2);
  const [pexels, pixabay] = await Promise.all([
    pexelsCurated(half),
    pixabayCurated(half),
  ]);
  return interleave(pexels, pixabay);
}
