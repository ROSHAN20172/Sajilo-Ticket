import Bus from '../models/operator/busModel.js';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create cache directory if it doesn't exist
const cacheDir = path.join(__dirname, '..', 'cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

export const getBusDetails = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    return res.json(bus);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Image proxy for Google Drive images to bypass CORS restrictions
export const imageProxy = async (req, res) => {
  try {
    const fileId = req.query.id;

    if (!fileId) {
      return res.status(400).json({ message: 'File ID is required' });
    }

    // Set aggressive headers for CORS and caching
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cross-Origin-Embedder-Policy', 'credentialless');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    // Check if we have a cached version
    const cachePath = path.join(cacheDir, `${fileId}.jpg`);
    if (fs.existsSync(cachePath)) {
      const stat = fs.statSync(cachePath);
      const fileBuffer = fs.readFileSync(cachePath);
      res.set('Content-Type', 'image/jpeg');
      res.set('Content-Length', stat.size);
      return res.send(fileBuffer);
    }

    // We'll try multiple Google Drive URL formats to increase chances of success
    const urls = [
      `https://lh3.googleusercontent.com/d/${fileId}`,
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    ];

    // Try each URL until we get a successful response
    let success = false;
    let imageData = null;

    for (const url of urls) {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 8000, // 8 second timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
            'Referer': 'https://drive.google.com/',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        });

        // If we got here, we have a successful response
        if (response.status === 200 && response.data) {
          const contentType = response.headers['content-type'] || 'image/jpeg';
          res.set('Content-Type', contentType);

          // Save to cache
          try {
            fs.writeFileSync(cachePath, Buffer.from(response.data));
          } catch (cacheError) {
          }

          res.send(response.data);
          success = true;
          break;
        }
      } catch (urlError) {
      }
    }

    // If all fetching methods failed, try redirect as last resort
    if (!success) {
      return res.redirect(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`);
    }
  } catch (error) {

    // Try to send a default fallback image
    try {
      const fallbackPath = path.join(__dirname, '..', 'public', 'image-not-found.svg');
      if (fs.existsSync(fallbackPath)) {
        res.set('Content-Type', 'image/svg+xml');
        return res.sendFile(fallbackPath);
      }
    } catch (fallbackError) {
    }

    // Last resort - just send an error response
    return res.status(500).json({
      message: 'Failed to fetch image',
      error: error.message
    });
  }
};
