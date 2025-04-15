const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store active bus tracking sessions
const activeBuses = new Map();

// Add rate limiting configuration for updates
const DEFAULT_UPDATE_INTERVAL = 10000; // Default 10 seconds update interval

// Socket.IO connection
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Operator starts sharing location
    socket.on('operator:start-tracking', (busData) => {
        const { busId, busName, route } = busData;

        if (!busId) {
            socket.emit('error', { message: 'Bus ID is required' });
            return;
        }

        // Save bus data and associate with this socket
        socket.busId = busId;
        activeBuses.set(busId, {
            busId,
            busName,
            route,
            socketId: socket.id,
            lastLocation: null,
            lastUpdated: new Date(),
            isActive: true,
            speed: 0
        });

        console.log(`Operator started tracking bus: ${busId}`);
        socket.emit('tracking:started', { busId });

        // Notify any users who might be tracking this bus
        io.emit('bus:status-update', {
            busId,
            isActive: true
        });
    });

    // Operator updates location
    socket.on('operator:update-location', (locationData) => {
        const { busId, latitude, longitude, speed = 0 } = locationData;

        try {
            if (!busId) {
                console.error('No busId provided in location update');
                socket.emit('error', { message: 'Bus ID is required for location updates' });
                return;
            }

            if (!activeBuses.has(busId)) {
                console.error(`Bus ${busId} not found or tracking not started`);
                socket.emit('error', { message: 'Invalid bus ID or tracking not started' });
                // Attempt to restart tracking if the operator thinks they're tracking
                socket.emit('tracking:request-restart');
                return;
            }

            // Update bus location data
            const busInfo = activeBuses.get(busId);
            busInfo.lastLocation = { latitude, longitude };
            busInfo.lastUpdated = new Date();
            busInfo.speed = speed;
            activeBuses.set(busId, busInfo);

            // Log the update (with a timestamp)
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] Location updated for bus ${busId}: ${latitude}, ${longitude} (${speed} km/h)`);

            // Broadcast to all clients tracking this bus
            io.to(`tracking:${busId}`).emit('bus:location-update', {
                busId,
                latitude,
                longitude,
                speed,
                timestamp: new Date()
            });

            // Confirm receipt to the operator
            socket.emit('location:updated', {
                success: true,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error updating location:', error);
            socket.emit('error', { message: 'Failed to update location' });
        }
    });

    // Operator stops sharing location
    socket.on('operator:stop-tracking', ({ busId }) => {
        console.log(`Request to stop tracking for bus: ${busId}`);

        try {
            if (!busId) {
                console.error('No busId provided in stop-tracking request');
                socket.emit('error', { message: 'No busId provided' });
                return;
            }

            if (!activeBuses.has(busId)) {
                console.log(`Bus ${busId} not found or already stopped tracking`);
                socket.emit('tracking:stopped', { busId, success: true, message: 'Bus was not being tracked' });
                return;
            }

            const busInfo = activeBuses.get(busId);
            busInfo.isActive = false;
            activeBuses.set(busId, busInfo);

            // Notify all clients tracking this bus
            io.to(`tracking:${busId}`).emit('bus:tracking-stopped', { busId });
            io.emit('bus:status-update', {
                busId,
                isActive: false
            });

            console.log(`Operator stopped tracking bus: ${busId}`);
            socket.emit('tracking:stopped', { busId, success: true });
        } catch (error) {
            console.error('Error stopping tracking:', error);
            socket.emit('error', { message: 'Failed to stop tracking' });
        }
    });

    // User subscribes to a bus location
    socket.on('user:subscribe', ({ busId }) => {
        if (!busId) {
            socket.emit('error', { message: 'Bus ID is required' });
            return;
        }

        // Join the room for this bus
        socket.join(`tracking:${busId}`);
        console.log(`User subscribed to bus: ${busId}`);

        // Send current status to the user
        const busInfo = activeBuses.get(busId);
        if (busInfo) {
            socket.emit('bus:status', {
                busId,
                isActive: busInfo.isActive,
                lastLocation: busInfo.lastLocation,
                lastUpdated: busInfo.lastUpdated,
                speed: busInfo.speed
            });
        } else {
            socket.emit('bus:status', {
                busId,
                isActive: false,
                lastLocation: null,
                lastUpdated: null,
                speed: 0
            });
        }
    });

    // User requests a refresh of location data
    socket.on('user:refresh-location', ({ busId }) => {
        if (!busId) {
            socket.emit('error', { message: 'Bus ID is required' });
            return;
        }

        console.log(`User requested location refresh for bus: ${busId}`);

        // Get current bus info
        const busInfo = activeBuses.get(busId);
        if (busInfo && busInfo.isActive && busInfo.lastLocation) {
            // Send the latest location data to this specific client
            socket.emit('bus:location-update', {
                busId,
                latitude: busInfo.lastLocation.latitude,
                longitude: busInfo.lastLocation.longitude,
                speed: busInfo.speed || 0,
                timestamp: busInfo.lastUpdated,
                updateInterval: DEFAULT_UPDATE_INTERVAL / 1000 // Send update interval in seconds
            });
        }
    });

    // User requests the current bus status
    socket.on('user:request-status', ({ busId }) => {
        if (!busId) {
            socket.emit('error', { message: 'Bus ID is required' });
            return;
        }

        console.log(`User requested status for bus: ${busId}`);

        // Get current bus info
        const busInfo = activeBuses.get(busId);
        if (busInfo) {
            socket.emit('bus:status', {
                busId,
                isActive: busInfo.isActive,
                lastLocation: busInfo.lastLocation,
                lastUpdated: busInfo.lastUpdated,
                speed: busInfo.speed || 0
            });
        } else {
            socket.emit('bus:status', {
                busId,
                isActive: false,
                lastLocation: null,
                lastUpdated: null,
                speed: 0
            });
        }
    });

    // User unsubscribes from a bus location
    socket.on('user:unsubscribe', ({ busId }) => {
        if (busId) {
            socket.leave(`tracking:${busId}`);
            console.log(`User unsubscribed from bus: ${busId}`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        try {
            // If this was an operator tracking a bus, update bus status
            if (socket.busId && activeBuses.has(socket.busId)) {
                const busInfo = activeBuses.get(socket.busId);
                if (busInfo.socketId === socket.id) {
                    busInfo.isActive = false;
                    activeBuses.set(socket.busId, busInfo);

                    // Notify all clients tracking this bus
                    io.to(`tracking:${socket.busId}`).emit('bus:tracking-stopped', {
                        busId: socket.busId
                    });
                    io.emit('bus:status-update', {
                        busId: socket.busId,
                        isActive: false
                    });

                    console.log(`Operator disconnected, tracking stopped for bus: ${socket.busId}`);
                }
            }
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });

    // Add a new event to check tracking status
    socket.on('tracking:status-check', ({ busId }) => {
        if (!busId) {
            socket.emit('tracking:status', { active: false, message: 'No bus ID provided' });
            return;
        }

        const isTracking = activeBuses.has(busId) && activeBuses.get(busId).isActive;
        socket.emit('tracking:status', {
            active: isTracking,
            busId,
            lastUpdated: isTracking ? activeBuses.get(busId).lastUpdated : null
        });
    });
});

// Status endpoint to check server health
app.get('/status', (req, res) => {
    res.status(200).json({
        status: 'OK',
        activeBuses: Array.from(activeBuses.keys())
    });
});

// Start server
const PORT = process.env.TRACKING_PORT || 8000;
server.listen(PORT, () => {
    console.log(`Tracking server is running on port ${PORT}`);
}); 