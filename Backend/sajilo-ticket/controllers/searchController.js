import Route from '../models/operator/busRouteModel.js';
import Schedule from '../models/operator/busScheduleModel.js';

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

export const getBusData = async (req, res) => {
    try {
      const skip = parseInt(req.query.skip) || 0;
      const limit = parseInt(req.query.limit) || 10;
  
      // Fetch schedules with pagination
      const schedules = await Schedule.find({})
        .populate('bus')
        .populate('route')
        .skip(skip)
        .limit(limit);
  
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  export const searchBus = async (req, res) => {
    try {
      const { from, to, date } = req.query;
      if (!from || !to || !date) {
        return res.status(400).json({ message: "Please provide 'from', 'to', and 'date'" });
      }
  
      const searchDate = new Date(date);
      // Find schedules that have the given date in scheduleDates
      let schedules = await Schedule.find({
        scheduleDates: { $elemMatch: { $eq: searchDate } }
      }).populate('route').populate('bus');
  
      const fromRegex = new RegExp(from, 'i');
      const toRegex = new RegExp(to, 'i');
  
      // Filter schedules based on route information
      schedules = schedules.filter(schedule => {
        const route = schedule.route;
        if (!route) return false;
        const fromMatch = fromRegex.test(route.from) ||
          (Array.isArray(route.pickupPoints) && route.pickupPoints.some(point => fromRegex.test(point)));
        const toMatch = toRegex.test(route.to) ||
          (Array.isArray(route.dropPoints) && route.dropPoints.some(point => toRegex.test(point)));
        return fromMatch && toMatch;
      });
  
      if (schedules.length === 0) {
        return res.status(404).json({ message: "No buses found" });
      }
  
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };