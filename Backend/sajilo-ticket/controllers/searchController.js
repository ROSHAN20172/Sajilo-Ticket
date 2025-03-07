import Route from '../models/operator/busRouteModel.js';

export const searchRoutes = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "Query parameter is required" });
        }
        // Create a regex for case-insensitive partial match
        const regex = new RegExp(query, 'i');
        const routes = await Route.find({
            $or: [
                { from: regex },
                { to: regex },
                { pickupPoints: regex },
                { dropPoints: regex }
            ]
        });
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
