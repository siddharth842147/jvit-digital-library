const fetch = require('node-fetch');
const BookLookup = require('../models/BookLookup');
const { toIsbn13 } = require('../utils/isbn');

// TTL for cache (in ms) — 30 days
const CACHE_TTL = 1000 * 60 * 60 * 24 * 30;

const normalizeOpenLibraryData = (info, isbn13) => {
    if (!info) return null;
    return {
        title: info.title || info.title_suggest || '',
        author: (info.authors && info.authors[0] && info.authors[0].name) || (info.author_name && info.author_name[0]) || '',
        publisher: (info.publishers && info.publishers[0] && info.publishers[0].name) || (info.publisher && info.publisher[0]) || '',
        publishedYear: info.publish_date ? (parseInt(info.publish_date.match(/\d{4}/)?.[0]) || new Date().getFullYear()) : (info.first_publish_year || new Date().getFullYear()),
        pages: info.number_of_pages || info.number_of_pages_maybe || '',
        coverImage: (info.cover && (info.cover.large || info.cover.medium || info.cover.small)) || (info.cover_i ? `https://covers.openlibrary.org/b/id/${info.cover_i}-L.jpg` : ''),
        description: typeof info.description === 'string' ? info.description : (info.description?.value || info.notes || ''),
        isbn: isbn13
    };
};

const normalizeGoogleBooksData = (info, isbn13) => {
    if (!info || !info.volumeInfo) return null;
    const v = info.volumeInfo;
    return {
        title: v.title || '',
        author: (v.authors && v.authors[0]) || '',
        publisher: v.publisher || '',
        publishedYear: v.publishedDate ? (parseInt(v.publishedDate.match(/\d{4}/)?.[0]) || new Date().getFullYear()) : new Date().getFullYear(),
        pages: v.pageCount || '',
        coverImage: (v.imageLinks && (v.imageLinks.extraLarge || v.imageLinks.large || v.imageLinks.medium || v.imageLinks.thumbnail)) || '',
        description: v.description || '',
        isbn: isbn13
    };
};

exports.lookupISBN = async (req, res) => {
    try {
        const raw = req.params.isbn;
        const isbn13 = toIsbn13(raw);
        if (!isbn13) return res.status(400).json({ success: false, message: 'Invalid ISBN' });

        // Check cache
        const cached = await BookLookup.findOne({ isbn13 });
        if (cached && (Date.now() - new Date(cached.fetchedAt).getTime()) < CACHE_TTL) {
            return res.status(200).json({ success: true, source: 'cache', data: cached.data });
        }

        let result = null;
        let source = '';

        // 1. Try Google Books first (usually more reliable metadata)
        try {
            const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}`);
            const gbJson = await gbRes.json();
            if (gbJson.totalItems > 0 && gbJson.items[0]) {
                result = normalizeGoogleBooksData(gbJson.items[0], isbn13);
                source = 'googlebooks';
            }
        } catch (err) {
            console.error('Google Books fallback error', err);
        }

        // 2. Try Open Library if Google fails
        if (!result) {
            try {
                const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn13}&format=json&jscmd=data`);
                const olJson = await olRes.json();
                const key = `ISBN:${isbn13}`;
                if (olJson && olJson[key]) {
                    result = normalizeOpenLibraryData(olJson[key], isbn13);
                    source = 'openlibrary';
                } else {
                    // Try Open Library search
                    const s = await fetch(`https://openlibrary.org/search.json?isbn=${isbn13}`);
                    const sj = await s.json();
                    if (sj && sj.docs && sj.docs.length > 0) {
                        result = normalizeOpenLibraryData(sj.docs[0], isbn13);
                        source = 'openlibrary_search';
                    }
                }
            } catch (err) {
                console.error('Open Library fallback error', err);
            }
        }

        if (!result) {
            return res.status(404).json({ success: false, message: 'No data found for ISBN' });
        }

        // Save to cache
        await BookLookup.findOneAndUpdate(
            { isbn13 },
            { data: result, fetchedAt: new Date() },
            { upsert: true, new: true }
        );

        return res.status(200).json({ success: true, source, data: result });
    } catch (err) {
        console.error('ISBN lookup error', err);
        return res.status(500).json({ success: false, message: 'Lookup failed' });
    }
};
