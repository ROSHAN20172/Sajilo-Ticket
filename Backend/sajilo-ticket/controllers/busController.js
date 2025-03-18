import Bus from '../models/operator/busModel.js';
import Schedule from '../models/operator/busScheduleModel.js';
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

// Get bus seat data for a specific date
export const getBusSeatData = async (req, res) => {
  try {
    const { busId, date } = req.query;

    if (!busId) {
      return res.status(400).json({ success: false, message: 'Bus ID is required' });
    }

    // If no date is provided, use today's date
    const searchDate = date ? new Date(date) : new Date();

    // Format date to YYYY-MM-DD for string comparison
    const searchDateStr = searchDate.toISOString().split('T')[0];

    // Find schedules for this bus on the specified date
    const schedules = await Schedule.find({
      bus: busId,
      scheduleDates: {
        $elemMatch: {
          $gte: new Date(searchDateStr),
          $lt: new Date(new Date(searchDateStr).setDate(new Date(searchDateStr).getDate() + 1))
        }
      }
    }).populate('bus').populate('route');

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No schedule found for this bus on the specified date'
      });
    }

    // Get the most relevant schedule (first one for now)
    const schedule = schedules[0];

    // Get seat data for this date
    let seatData = {
      available: [],
      booked: []
    };

    // First check date-specific seat data
    if (schedule.seats && schedule.seats.dates) {
      const scheduleDateStr = searchDate.toISOString().split('T')[0];

      // MongoDB stores dates as Map, so we need to check if the date exists
      const dateData = schedule.seats.dates.get(scheduleDateStr);

      if (dateData) {
        seatData = dateData;
      }
    }

    // If no date-specific data, fall back to global seat data
    if (seatData.available.length === 0 && seatData.booked.length === 0 &&
      schedule.seats && schedule.seats.global) {
      seatData = schedule.seats.global;
    }

    // Create the seat data structure needed by the frontend
    const busSeatData = [];

    // Define seat IDs based on the existing pattern
    const frontRowIds = ['B1', 'B3', 'B5', 'B7', 'B9', 'B11', 'B13', 'B15', 'B17'];
    const secondRowIds = ['B2', 'B4', 'B6', 'B8', 'B10', 'B12', 'B14', 'B16', 'B18'];
    const thirdRowId = ['19'];
    const fourthRowIds = ['A1', 'A3', 'A5', 'A7', 'A9', 'A11', 'A13', 'A15', 'A17'];
    const fifthRowIds = ['A2', 'A4', 'A6', 'A8', 'A10', 'A12', 'A14', 'A16', 'A18'];

    const allSeatIds = [
      ...frontRowIds,
      ...secondRowIds,
      ...thirdRowId,
      ...fourthRowIds,
      ...fifthRowIds
    ];

    // Get the price from the route
    const price = schedule.route.price || 1600;

    // Build the complete seat data structure
    allSeatIds.forEach(seatId => {
      const seatStatus = seatData.booked.includes(seatId) ? 'booked' : 'available';
      busSeatData.push({
        id: seatId,
        status: seatStatus,
        price: price
      });
    });

    return res.json({
      success: true,
      data: {
        busSeatData,
        schedule: {
          _id: schedule._id,
          fromTime: schedule.fromTime,
          toTime: schedule.toTime,
          date: searchDateStr,
          route: {
            from: schedule.route.from,
            to: schedule.route.to,
            pickupPoints: schedule.route.pickupPoints || [],
            dropPoints: schedule.route.dropPoints || []
          }
        },
        bus: {
          name: schedule.bus.busName,
          busNumber: schedule.bus.busNumber
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching seat data',
      error: error.message
    });
  }
};

export const getRoutePoints = async (req, res) => {
  try {
    const { busId, date } = req.query;

    if (!busId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Bus ID and date are required'
      });
    }

    // Find the schedule for the given bus and date
    const schedule = await Schedule.findOne({
      bus: busId,
      scheduleDates: {
        $elemMatch: {
          $eq: new Date(date)
        }
      }
    }).populate('route');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'No schedule found for the given bus and date'
      });
    }

    // Format pickup points with times
    const pickupPoints = schedule.route.pickupPoints.map((point, index) => ({
      id: `pickup${index + 1}`,
      name: point,
      time: schedule.pickupTimes[index] || ''
    }));

    // Format drop points with times
    const dropPoints = schedule.route.dropPoints.map((point, index) => ({
      id: `drop${index + 1}`,
      name: point,
      time: schedule.dropTimes[index] || ''
    }));

    return res.json({
      success: true,
      data: {
        pickupPoints,
        dropPoints
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching route points',
      error: error.message
    });
  }
};
