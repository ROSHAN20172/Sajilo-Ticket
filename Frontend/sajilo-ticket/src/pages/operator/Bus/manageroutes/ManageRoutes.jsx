import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Modal,
  IconButton,
  TextField,
  MenuItem,
  Typography,
  InputAdornment
} from '@mui/material';
import { FaEdit, FaTrash, FaPlusCircle, FaTimes, FaSearch } from 'react-icons/fa';
import { BiCustomize } from "react-icons/bi";
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { useNavigate } from 'react-router-dom';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: '4px'
};

const ManageRoutes = () => {
  const { backendUrl, operatorData } = useContext(OperatorAppContext);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [deleteConfirmRoute, setDeleteConfirmRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for adding/editing a route
  const [formData, setFormData] = useState({
    bus: '',
    from: '',
    to: '',
    price: '',
    pickupPoints: [''],
    dropPoints: ['']
  });

  // State for customizing prices (array of { origin, drop, price })
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customPriceData, setCustomPriceData] = useState([]);

  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };

  // Fetch routes for the logged-in operator
  const fetchRoutes = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/routes`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      setRoutes(res.data);
    } catch (error) {
      toast.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch verified buses for the logged-in operator
  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/bus/buses`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      const verifiedBuses = res.data.filter((bus) => bus.verified);
      setBuses(verifiedBuses);
    } catch (error) {
      toast.error('Failed to fetch buses');
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchBuses();
  }, [backendUrl, operatorData]);

  // Filter routes by bus name, from and to
  const filteredRoutes = routes.filter((route) => {
    const query = searchQuery.toLowerCase();
    const busName = route.bus?.busName?.toLowerCase() || '';
    const from = route.from?.toLowerCase() || '';
    const to = route.to?.toLowerCase() || '';
    return busName.includes(query) || from.includes(query) || to.includes(query);
  });

  // Open modal for adding a new route
  const openModalForAdd = () => {
    setFormData({
      bus: '',
      from: '',
      to: '',
      price: '',
      pickupPoints: [''],
      dropPoints: ['']
    });
    setEditMode(false);
    setSelectedRoute(null);
    setModalOpen(true);
  };

  // Open modal for editing a route
  const openModalForEdit = (route) => {
    setFormData({
      bus: route.bus?._id || '',
      from: route.from,
      to: route.to,
      price: route.price,
      pickupPoints: route.pickupPoints && route.pickupPoints.length > 0 ? route.pickupPoints : [''],
      dropPoints: route.dropPoints && route.dropPoints.length > 0 ? route.dropPoints : ['']
    });
    setSelectedRoute(route);
    setEditMode(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRoute(null);
  };

  // Open delete confirmation modal for a route
  const openDeleteConfirmation = (route) => {
    setDeleteConfirmRoute(route);
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmRoute(null);
  };

  // Handle form input changes for add/edit
  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Pickup points handlers
  const handlePickupChange = (e, index) => {
    const newPickups = [...formData.pickupPoints];
    newPickups[index] = e.target.value;
    setFormData((prev) => ({ ...prev, pickupPoints: newPickups }));
  };

  const addPickup = () => {
    setFormData((prev) => ({ ...prev, pickupPoints: [...prev.pickupPoints, ''] }));
  };

  const removePickup = (index) => {
    const newPickups = formData.pickupPoints.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, pickupPoints: newPickups }));
  };

  // Drop points handlers
  const handleDropChange = (e, index) => {
    const newDrops = [...formData.dropPoints];
    newDrops[index] = e.target.value;
    setFormData((prev) => ({ ...prev, dropPoints: newDrops }));
  };

  const addDrop = () => {
    setFormData((prev) => ({ ...prev, dropPoints: [...prev.dropPoints, ''] }));
  };

  const removeDrop = (index) => {
    const newDrops = formData.dropPoints.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, dropPoints: newDrops }));
  };

  // Handle form submission for adding/updating a route
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.bus.trim() ||
      !formData.from.trim() ||
      !formData.to.trim() ||
      formData.price === ''
    ) {
      toast.error('Please fill in Bus, From, To, and Price fields.');
      return;
    }
    if (formData.pickupPoints.some((point) => !point.trim())) {
      toast.error('Please fill in all Pickup Points.');
      return;
    }
    if (formData.dropPoints.some((point) => !point.trim())) {
      toast.error('Please fill in all Drop Points.');
      return;
    }

    try {
      if (editMode && selectedRoute) {
        await axios.put(`${backendUrl}/api/operator/routes/${selectedRoute._id}`, formData, {
          headers: { Authorization: `Bearer ${operatorData?.token}` }
        });
        toast.success('Route updated successfully');
      } else {
        await axios.post(`${backendUrl}/api/operator/routes`, formData, {
          headers: { Authorization: `Bearer ${operatorData?.token}` }
        });
        toast.success('Route added successfully');
      }
      closeModal();
      fetchRoutes();
    } catch (error) {
      toast.error('Failed to save route');
    }
  };

  // ---------- CUSTOMIZE PRICE FUNCTIONS ----------

  // Open customize price modal for a given route
  const openCustomizePriceModal = (route) => {
    let data = [];
    // Section 1: "From" location group (using route.from as origin)
    route.dropPoints.forEach((drop) => {
      const existing = route.customPrices?.find(
        (item) => item.origin === route.from && item.drop === drop
      );
      data.push({ origin: route.from, drop, price: existing ? existing.price : '' });
    });
    // Section 2: For each pickup, include dropPoints and an extra row for the "to" location.
    route.pickupPoints.forEach((pickup) => {
      route.dropPoints.forEach((drop) => {
        const existing = route.customPrices?.find(
          (item) => item.origin === pickup && item.drop === drop
        );
        data.push({ origin: pickup, drop, price: existing ? existing.price : '' });
      });
      // Extra row for "to" location for this pickup
      const existingTo = route.customPrices?.find(
        (item) => item.origin === pickup && item.drop === route.to
      );
      data.push({ origin: pickup, drop: route.to, price: existingTo ? existingTo.price : '' });
    });
    setCustomPriceData(data);
    setSelectedRoute(route);
    setCustomModalOpen(true);
  };

  // Handle price change in customize modal
  const handleCustomPriceChange = (index, value) => {
    const updated = [...customPriceData];
    updated[index].price = value;
    setCustomPriceData(updated);
  };

  // Apply same price for all rows in a given group (by origin)
  const applySameForOrigin = (origin, value) => {
    const updated = customPriceData.map((item) =>
      item.origin === origin ? { ...item, price: value } : item
    );
    setCustomPriceData(updated);
  };

  // Submit customized prices to backend
  const handleCustomPriceSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${backendUrl}/api/operator/routes/customize/${selectedRoute._id}`,
        { customPrices: customPriceData },
        { headers: { Authorization: `Bearer ${operatorData?.token}` } }
      );
      toast.success('Customized prices updated successfully');
      setCustomModalOpen(false);
      fetchRoutes();
    } catch (error) {
      toast.error('Failed to update customized prices');
    }
  };

  const closeCustomModal = () => {
    setCustomModalOpen(false);
    setSelectedRoute(null);
  };

  // -------------------------------------------------

  return (
    <div className="p-6">
      <div className="max-w-8xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Your Routes</h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="contained"
                color="primary"
                onClick={openModalForAdd}
                startIcon={<FaPlusCircle />}
              >
                Add New Route
              </Button>
              <button
                onClick={handleClose}
                className="p-2 text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>
          <hr className="my-14 border-gray-300" />

          {/* Search Input */}
          <div className="mb-8 flex gap-2">
            <TextField
              label="Search routes by Bus Name, From or To"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaSearch />
                  </InputAdornment>
                )
              }}
            />
            <Button variant="contained" color="primary" onClick={() => { }}>
              Search
            </Button>
          </div>
          <hr className="my-8 border-gray-300" />

          {loading ? (
            <p>Loading routes...</p>
          ) : filteredRoutes.length === 0 ? (
            <p>No routes found.</p>
          ) : (
            <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-2">
              {filteredRoutes.map((route) => (
                <div
                  key={route._id}
                  className="relative border rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow bg-white min-w-[600px] w-full mx-auto"
                >
                  <Typography variant="body1" className="mb-2">
                    <strong>Bus:</strong> {route.bus?.busName || 'N/A'}
                  </Typography>
                  <hr className="my-4 border-gray-300" />
                  <Typography variant="body1" className="mb-2">
                    <strong>From:</strong> {route.from}
                  </Typography>
                  <hr className="my-2 border-gray-300" />
                  <Typography variant="body1" className="mb-2">
                    <strong>To:</strong> {route.to}
                  </Typography>
                  <hr className="my-2 border-gray-300" />
                  <Typography variant="body1" className="mb-2">
                    <strong>Price NPR:</strong>
                  </Typography>
                  <Typography variant="body1" className="mb-2">
                    Rs. {route.price}
                  </Typography>
                  <hr className="my-2 border-gray-300" />
                  <Typography variant="body2" className="mb-2">
                    <strong>Pickup Points:</strong>
                    <ul className="ml-4 list-disc">
                      {route.pickupPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </Typography>
                  <hr className="my-2 border-gray-300" />
                  <Typography variant="body2" className="mb-2">
                    <strong>Drop Points:</strong>
                    <ul className="ml-4 list-disc">
                      {route.dropPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </Typography>
                  {/* New Section: Custom Price Data */}
                  {route.customPrices && route.customPrices.length > 0 && (
                    <>
                      <hr className="my-2 border-gray-300" />
                      <Typography variant="body2" className="mb-2">
                        <strong>Custom Prices:</strong>
                      </Typography>
                      <ul className="ml-4 list-disc">
                        {route.customPrices.map((item, idx) => (
                          <li key={idx}>
                            {item.origin} → {item.drop}: Rs. {item.price}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="mt-8 flex space-x-4">
                    <Button variant="outlined" startIcon={<FaEdit />} onClick={() => openModalForEdit(route)}>
                      Edit
                    </Button>
                    <Button variant="outlined" startIcon={<BiCustomize />} onClick={() => openCustomizePriceModal(route)}>
                      Customize Price
                    </Button>
                    <Button variant="contained" color="error" startIcon={<FaTrash />} onClick={() => openDeleteConfirmation(route)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Add/Edit Route */}
        <Modal open={modalOpen} onClose={closeModal}>
          <Box sx={modalStyle}>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h4">
                {editMode ? 'Edit Route' : 'Add New Route'}
              </Typography>
              <IconButton onClick={closeModal}>
                <FaTimes className="text-red-600" />
              </IconButton>
            </div>
            <div className="mt-1 text-sm bg-amber-50 border border-amber-200 rounded p-2 mb-3">
              <p className="flex items-center text-amber-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Note: Only verified buses will show in the Select Bus dropdown.
              </p>
            </div>
            <Typography variant="caption" color="textSecondary" className="block mb-4 pb-3">
              Note: Only verified buses will show in the Select Bus dropdown.
            </Typography>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                select
                label="Select Bus"
                name="bus"
                value={formData.bus}
                onChange={handleInputChange}
                fullWidth
              >
                {buses.map((bus) => (
                  <MenuItem key={bus._id} value={bus._id}>
                    {bus.busName} ({bus.busNumber})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="From"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="To"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
                }}
              />
              <Box>
                <Typography variant="subtitle1" className="mb-1 pb-2">
                  Pickup Points
                </Typography>
                {formData.pickupPoints.map((point, index) => (
                  <Box key={index} className="flex items-center gap-2 mb-4">
                    <TextField
                      label={`Pickup Point ${index + 1}`}
                      value={point}
                      onChange={(e) => handlePickupChange(e, index)}
                      fullWidth
                    />
                    <IconButton
                      onClick={() => removePickup(index)}
                      disabled={formData.pickupPoints.length === 1}
                    >
                      <FaTimes className="text-red-600" />
                    </IconButton>
                  </Box>
                ))}
                <Button variant="outlined" startIcon={<FaPlusCircle />} onClick={addPickup}>
                  Add Pickup Point
                </Button>
              </Box>
              <Box>
                <Typography variant="subtitle1" className="mb-1 pb-2">
                  Drop Points
                </Typography>
                {formData.dropPoints.map((point, index) => (
                  <Box key={index} className="flex items-center gap-2 mb-4">
                    <TextField
                      label={`Drop Point ${index + 1}`}
                      value={point}
                      onChange={(e) => handleDropChange(e, index)}
                      fullWidth
                    />
                    <IconButton
                      onClick={() => removeDrop(index)}
                      disabled={formData.dropPoints.length === 1}
                    >
                      <FaTimes className="text-red-600" />
                    </IconButton>
                  </Box>
                ))}
                <Button variant="outlined" startIcon={<FaPlusCircle />} onClick={addDrop}>
                  Add Drop Point
                </Button>
              </Box>
              <Box className="flex justify-end gap-4">
                <Button variant="outlined" onClick={closeModal}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" type="submit">
                  {editMode ? 'Update Route' : 'Add Route'}
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Modal for Customize Price */}
        <Modal open={customModalOpen} onClose={closeCustomModal}>
          <Box sx={modalStyle}>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h4">Customize Prices</Typography>
              <IconButton onClick={closeCustomModal}>
                <FaTimes className="text-red-600" />
              </IconButton>
            </div>
            {selectedRoute && (
              <>
                <Typography variant="subtitle1" className="mb-2">
                  Route: {selectedRoute.from} - {selectedRoute.to}
                </Typography>
                {/* Section 1: From Location to All Drop Locations */}
                <Box className="mb-4 border p-2 rounded">
                  <Typography variant="h6" className="mb-1">
                    From: {selectedRoute.from} - All Drop Locations
                  </Typography>
                  <Box className="mb-2 pt-3">
                    <TextField
                      label="Apply same price for all drop locations"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
                      }}
                      onChange={(e) => applySameForOrigin(selectedRoute.from, e.target.value)}
                    />
                  </Box>
                  {customPriceData
                    .filter((item) => item.origin === selectedRoute.from)
                    .map((item, idx) => (
                      <Box key={`from-${item.drop}`} className="flex items-center gap-2 mb-3">
                        <Typography className="w-2/3">
                          {selectedRoute.from} - {item.drop}
                        </Typography>
                        <TextField
                          label="Price"
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const index = customPriceData.findIndex(
                              (i) => i.origin === selectedRoute.from && i.drop === item.drop
                            );
                            if (index !== -1) handleCustomPriceChange(index, e.target.value);
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
                          }}
                        />
                      </Box>
                    ))}
                </Box>
                {/* Section 2: For each Pickup Location (including an extra row for the 'to' location) */}
                {selectedRoute.pickupPoints.map((pickup) => {
                  const group = customPriceData.filter((item) => item.origin === pickup);
                  return (
                    <Box key={pickup} className="mb-4 border p-2 rounded">
                      <Typography variant="h6" className="mb-1">
                        Pickup: {pickup} - All Drop Locations
                      </Typography>
                      <Box className="mb-2 pt-3">
                        <TextField
                          label="Apply same price for all drop locations"
                          type="number"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
                          }}
                          onChange={(e) => applySameForOrigin(pickup, e.target.value)}
                        />
                      </Box>
                      {group.map((item) => (
                        <Box key={`${pickup}-${item.drop}`} className="flex items-center gap-2 mb-3">
                          <Typography className="w-2/3">
                            {pickup} - {item.drop}
                          </Typography>
                          <TextField
                            label="Price"
                            type="number"
                            value={item.price}
                            onChange={(e) => {
                              const index = customPriceData.findIndex(
                                (i) => i.origin === pickup && i.drop === item.drop
                              );
                              if (index !== -1) handleCustomPriceChange(index, e.target.value);
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  );
                })}
                <Box className="flex justify-end gap-4">
                  <Button variant="outlined" onClick={closeCustomModal}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleCustomPriceSubmit}>
                    Save Customized Prices
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal open={Boolean(deleteConfirmRoute)} onClose={closeDeleteConfirmation}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: '4px'
            }}
          >
            <Typography variant="h5" className="mb-2">
              Warning
            </Typography>
            <Typography variant="body1" className="mb-4">
              Are you sure you want to delete the route from{' '}
              <strong>{deleteConfirmRoute?.from}</strong> to{' '}
              <strong>{deleteConfirmRoute?.to}</strong>?
            </Typography>
            <Box className="flex justify-end gap-2">
              <Button variant="outlined" onClick={closeDeleteConfirmation}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={async () => {
                  try {
                    await axios.delete(`${backendUrl}/api/operator/routes/${deleteConfirmRoute._id}`, {
                      headers: { Authorization: `Bearer ${operatorData?.token}` }
                    });
                    toast.success('Route deleted successfully');
                    closeDeleteConfirmation();
                    fetchRoutes();
                  } catch (error) {
                    toast.error('Failed to delete route');
                  }
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ManageRoutes;