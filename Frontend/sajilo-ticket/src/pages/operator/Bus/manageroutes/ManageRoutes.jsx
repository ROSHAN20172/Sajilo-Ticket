import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Modal, IconButton, TextField, MenuItem, Typography, InputAdornment } from '@mui/material';
import { FaEdit, FaTrash, FaPlusCircle, FaTimes, FaSearch } from 'react-icons/fa';
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
  const [editMode, setEditMode] = useState(false); // false = add new, true = edit existing
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [deleteConfirmRoute, setDeleteConfirmRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for adding/editing a route
  const [formData, setFormData] = useState({
    bus: '',
    from: '',
    to: '',
    pickupPoints: [''],
    dropPoints: ['']
  });

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
      const verifiedBuses = res.data.filter(bus => bus.verified);
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
  const filteredRoutes = routes.filter(route => {
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

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Pickup points handlers
  const handlePickupChange = (e, index) => {
    const newPickups = [...formData.pickupPoints];
    newPickups[index] = e.target.value;
    setFormData(prev => ({ ...prev, pickupPoints: newPickups }));
  };

  const addPickup = () => {
    setFormData(prev => ({ ...prev, pickupPoints: [...prev.pickupPoints, ''] }));
  };

  const removePickup = (index) => {
    const newPickups = formData.pickupPoints.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, pickupPoints: newPickups }));
  };

  // Drop points handlers
  const handleDropChange = (e, index) => {
    const newDrops = [...formData.dropPoints];
    newDrops[index] = e.target.value;
    setFormData(prev => ({ ...prev, dropPoints: newDrops }));
  };

  const addDrop = () => {
    setFormData(prev => ({ ...prev, dropPoints: [...prev.dropPoints, ''] }));
  };

  const removeDrop = (index) => {
    const newDrops = formData.dropPoints.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, dropPoints: newDrops }));
  };

  // Handle form submission for adding or updating a route with field validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.bus.trim() || !formData.from.trim() || !formData.to.trim()) {
      toast.error('Please fill in Bus, From, and To fields.');
      return;
    }

    // Validate each pickup and drop point
    if (formData.pickupPoints.some(point => !point.trim())) {
      toast.error('Please fill in all Pickup Points.');
      return;
    }
    if (formData.dropPoints.some(point => !point.trim())) {
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

  // Handle deletion of a route
  const handleDeleteRoute = async () => {
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
  };

  return (
    <div className="p-6">
      <div className="max-w-8xl mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Your Routes</h1>
            <div className="flex items-center space-x-4">
              <Button variant="contained" color="primary" onClick={openModalForAdd} startIcon={<FaPlusCircle />}>
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

          {/* Search Input with Icon and Button */}
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
            <Button variant="contained" color="primary" onClick={() => { /* Optionally trigger search */ }}>
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
              {filteredRoutes.map(route => (
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
                  <div className="mt-8 flex space-x-4">
                    <Button variant="outlined" startIcon={<FaEdit />} onClick={() => openModalForEdit(route)}>
                      Edit
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
              <Typography variant="h4">{editMode ? 'Edit Route' : 'Add New Route'}</Typography>
              <IconButton onClick={closeModal}>
                <FaTimes className="text-red-600" />
              </IconButton>
            </div>
            {/* Note Message (only in add/edit modal) */}
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
                {buses.map(bus => (
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
              {/* Pickup Points */}
              <Box>
                <Typography variant="subtitle1" className="mb-1 pb-2">Pickup Points</Typography>
                {formData.pickupPoints.map((point, index) => (
                  <Box key={index} className="flex items-center gap-2 mb-4">
                    <TextField
                      label={`Pickup Point ${index + 1}`}
                      value={point}
                      onChange={(e) => handlePickupChange(e, index)}
                      fullWidth
                    />
                    <IconButton onClick={() => removePickup(index)} disabled={formData.pickupPoints.length === 1}>
                      <FaTimes className="text-red-600" />
                    </IconButton>
                  </Box>
                ))}
                <Button variant="outlined" startIcon={<FaPlusCircle />} onClick={addPickup}>
                  Add Pickup Point
                </Button>
              </Box>
              {/* Drop Points */}
              <Box>
                <Typography variant="subtitle1" className="mb-1 pb-2">Drop Points</Typography>
                {formData.dropPoints.map((point, index) => (
                  <Box key={index} className="flex items-center gap-2 mb-4">
                    <TextField
                      label={`Drop Point ${index + 1}`}
                      value={point}
                      onChange={(e) => handleDropChange(e, index)}
                      fullWidth
                    />
                    <IconButton onClick={() => removeDrop(index)} disabled={formData.dropPoints.length === 1}>
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
            <Typography variant="h5" className="mb-2">Warning</Typography>
            <Typography variant="body1" className="mb-4">
              Are you sure you want to delete the route from <strong>{deleteConfirmRoute?.from}</strong> to <strong>{deleteConfirmRoute?.to}</strong>?
            </Typography>
            <Box className="flex justify-end gap-2">
              <Button variant="outlined" onClick={closeDeleteConfirmation}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleDeleteRoute}>
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
