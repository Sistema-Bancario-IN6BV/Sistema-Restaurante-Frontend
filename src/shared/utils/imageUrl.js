export const resolveImageUrl = (path) => {
    if (path == null) return null;

    // If it's an object with secure_url or similar, prefer that
    if (typeof path === 'object') {
        const candidate = path.secure_url || path.url || path.path || path.location || path.filename || path.public_id || null;
        if (candidate) return resolveImageUrl(candidate);
        // If it's an array-like object
        if (Array.isArray(path) && path.length > 0) return resolveImageUrl(path[0]);
    }

    let raw = String(path).trim();

    // If looks like a JSON array string, try to parse and use first element
    if (raw.startsWith('[') && raw.endsWith(']')) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return resolveImageUrl(parsed[0]);
            }
        } catch (e) {
            // fall through
        }
    }

    // Strip wrapping quotes if present (e.g. '"value"')
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        raw = raw.substring(1, raw.length - 1).trim();
    }

    if (!raw) return null;

    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;
    if (raw.includes('res.cloudinary.com')) return `https://${raw.replace(/^\/+/, '')}`;

    const cloudinaryBase = import.meta.env.VITE_CLOUDINARY_BASE_URL || 'https://res.cloudinary.com/db5rnorif/image/upload/';
    return `${cloudinaryBase}${raw.replace(/^\/+/, '')}`;
};

export default resolveImageUrl;
