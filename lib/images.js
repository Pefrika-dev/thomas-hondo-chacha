/* Shared image URL optimiser.
   Used by build.mjs (static cards) and api/render.js (server-rendered pages)
   so a cover URL typed in the admin is delivered at a sensible size/format. */
function optimiseImageUrl(value, width) {
  const target = Number(width) || 640;
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const url = new URL(raw, 'https://www.thomashondochacha.co.ke');
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'images.unsplash.com') {
      url.searchParams.set('w', String(target));
      url.searchParams.set('fm', 'webp');
      url.searchParams.set('q', '70');
      url.searchParams.set('fit', 'crop');
      url.searchParams.delete('auto');
      return url.toString();
    }

    if (host === 'commons.wikimedia.org') {
      if (!url.searchParams.has('width')) url.searchParams.set('width', String(target));
      return url.toString();
    }

    if (host === 'upload.wikimedia.org') {
      const parts = url.pathname.split('/').filter(Boolean);
      const file = decodeURIComponent(parts[parts.length - 1] || '');
      if (file) {
        return 'https://commons.wikimedia.org/wiki/Special:FilePath/' +
          encodeURIComponent(file).replace(/%20/g, '_') + '?width=' + target;
      }
    }

    if (host === 'image.thum.io') {
      return raw
        .replace(/\/width\/\d+/, '/width/' + target)
        .replace(/\/crop\/\d+/, '/crop/' + Math.round(target * 0.75));
    }

    /* Local raster art has a WebP twin generated from the same source. */
    if (host === 'thomashondochacha.co.ke' || raw.startsWith('/assets/') || raw.startsWith('assets/')) {
      if (/\.(png|jpe?g)$/i.test(url.pathname)) return raw.replace(/\.(png|jpe?g)$/i, '.webp');
    }
  } catch (error) {
    /* An unusual URL is left exactly as the editor entered it. */
  }

  return raw;
}

module.exports = { optimiseImageUrl };
