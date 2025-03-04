import Route from '../../models/operator/busRouteModel.js';

// GET all routes for the logged-in operator
export const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ operator: req.operator.id }).populate('bus');
    res.json(routes);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

// GET details for a single route
export const getRouteById = async (req, res) => {
  try {
    const route = await Route.findOne({ _id: req.params.id, operator: req.operator.id }).populate('bus');
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

// ADD a new route
export const addRoute = async (req, res) => {
  try {
    const { bus, from, to, pickupPoints, dropPoints } = req.body;
    if (!bus || !from || !to) {
      return res.status(400).json({ success: false, message: 'Bus, from and to are required.' });
    }
    const newRoute = new Route({
      operator: req.operator.id,
      bus,
      from,
      to,
      pickupPoints: Array.isArray(pickupPoints) ? pickupPoints : [],
      dropPoints: Array.isArray(dropPoints) ? dropPoints : []
    });
    await newRoute.save();
    res.status(201).json({ success: true, message: 'Route added successfully', route: newRoute });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

// UPDATE route details
export const updateRoute = async (req, res) => {
  try {
    const route = await Route.findOne({ _id: req.params.id, operator: req.operator.id });
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    const { bus, from, to, pickupPoints, dropPoints } = req.body;
    if (bus !== undefined) route.bus = bus;
    if (from !== undefined) route.from = from;
    if (to !== undefined) route.to = to;
    if (pickupPoints !== undefined) route.pickupPoints = Array.isArray(pickupPoints) ? pickupPoints : [];
    if (dropPoints !== undefined) route.dropPoints = Array.isArray(dropPoints) ? dropPoints : [];
    const updatedRoute = await route.save();
    res.json({ success: true, message: 'Route updated successfully', route: updatedRoute });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};

// DELETE a route
export const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findOneAndDelete({ _id: req.params.id, operator: req.operator.id });
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    res.json({ success: true, message: 'Route deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};