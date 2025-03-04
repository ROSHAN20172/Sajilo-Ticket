import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Modal,
  IconButton,
  TextField,
  MenuItem,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaTimes,
  FaSearch
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { useNavigate } from 'react-router-dom';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: '4px'
};

const ManageSchedule = () => {
  const { backendUrl, operatorData } = useContext(OperatorAppContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busList, setBusList] = useState([]);
  const [routes, setRoutes] = useState([]); // all routes for operator
  const [filteredRoutes, setFilteredRoutes] = useState([]); // routes for selected bus in form
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false); // false = add new, true = edit existing
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deleteConfirmSchedule, setDeleteConfirmSchedule] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, upcoming, previous
  const [dateFilter, setDateFilter] = useState(''); // today, this week, this month, this year, manual
  const [searchQuery, setSearchQuery] = useState('');

  // State for manual date range filter
  const [manualFromDate, setManualFromDate] = useState('');
  const [manualToDate, setManualToDate] = useState('');

  const navigate = useNavigate();
  const handleClosePage = () => navigate(-1);

  // Form state for schedule  
  // fromTime = departure time at route.from, toTime = arrival time at route.to.
  const [formData, setFormData] = useState({
    bus: '',
    route: '',
    scheduleDates: [], // array of date strings (YYYY-MM-DD)
    fromTime: '',
    toTime: '',
    pickupTimes: [],   // times for each pickup location
    dropTimes: []      // times for each drop location
  });

  // Helper: Check if schedule is upcoming (if any schedule date is today or later)
  const isUpcoming = (scheduleDates) => {
    const now = new Date();
    return scheduleDates.some(d => new Date(d) >= new Date(now.toDateString()));
  };

  // Fetch schedules (using filterType)
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/schedules?filter=${filterType}`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      setSchedules(res.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  // Fetch verified buses for operator
  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/bus/buses`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      setBusList(res.data.filter(bus => bus.verified));
    } catch (error) {
      toast.error('Failed to fetch buses');
    }
  };

  // Fetch all routes for operator
  const fetchRoutesForOperator = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/routes`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      setRoutes(res.data);
    } catch (error) {
      toast.error('Failed to fetch routes');
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchBuses();
    fetchRoutesForOperator();
  }, [backendUrl, operatorData, filterType]);

  // Filter schedules based on searchQuery and dateFilter.
  const filteredSchedules = schedules.filter(schedule => {
    const query = searchQuery.toLowerCase();
    const busName = schedule.bus?.busName?.toLowerCase() || '';
    const dateSearchMatch = schedule.scheduleDates.some(d =>
      new Date(d).toLocaleDateString().toLowerCase().includes(query)
    );
    const searchMatch = busName.includes(query) || dateSearchMatch;

    let overallDateMatch = true;
    if (dateFilter) {
      overallDateMatch = schedule.scheduleDates.some(d => {
        const dt = new Date(d);
        const now = new Date();
        if (dateFilter === 'today') {
          return dt.toDateString() === now.toDateString();
        }
        if (dateFilter === 'this week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return dt >= startOfWeek && dt <= endOfWeek;
        }
        if (dateFilter === 'this month') {
          return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'this year') {
          return dt.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'manual') {
          if (manualFromDate && manualToDate) {
            const from = new Date(manualFromDate);
            const to = new Date(manualToDate);
            return dt >= from && dt <= to;
          }
          return false;
        }
        return true;
      });
    }
    return searchMatch && overallDateMatch;
  });

  // Compute buses that have at least one route
  const busesWithRoutes = busList.filter(bus =>
    routes.some(route => route.bus && route.bus._id.toString() === bus._id.toString())
  );

  // When a bus is selected, filter routes for that bus.
  useEffect(() => {
    if (formData.bus) {
      const filtered = routes.filter(r => r.bus && r.bus._id.toString() === formData.bus.toString());
      setFilteredRoutes(filtered);
      if (filtered.length === 0) {
        toast.error('No route found for this bus. First add a route to create schedule.');
      }
    } else {
      setFilteredRoutes([]);
    }
  }, [formData.bus, routes]);

  const openModalForAdd = () => {
    setFormData({
      bus: '',
      route: '',
      scheduleDates: [],
      fromTime: '',
      toTime: '',
      pickupTimes: [],
      dropTimes: []
    });
    setEditMode(false);
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  const openModalForEdit = (schedule) => {
    if (!isUpcoming(schedule.scheduleDates)) {
      toast.error('Cannot edit past schedule.');
      return;
    }
    setFormData({
      bus: schedule.bus?._id || '',
      route: schedule.route?._id || '',
      scheduleDates: schedule.scheduleDates.map(d => new Date(d).toISOString().split('T')[0]),
      fromTime: schedule.fromTime,
      toTime: schedule.toTime,
      pickupTimes: schedule.pickupTimes || [],
      dropTimes: schedule.dropTimes || []
    });
    setSelectedSchedule(schedule);
    setEditMode(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addDate = (selectedDate) => {
    if (!selectedDate) {
      toast.error('Please select a date.');
      return;
    }
    if (!formData.scheduleDates.includes(selectedDate)) {
      setFormData(prev => ({ ...prev, scheduleDates: [...prev.scheduleDates, selectedDate] }));
    } else {
      toast.error('This date is already added.');
    }
  };

  const removeDate = (dateToRemove) => {
    setFormData(prev => ({
      ...prev,
      scheduleDates: prev.scheduleDates.filter(date => date !== dateToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.bus.trim() ||
      !formData.route.trim() ||
      formData.scheduleDates.length === 0 ||
      !formData.fromTime.trim() ||
      !formData.toTime.trim()
    ) {
      toast.error('Please fill in Bus, Route, Schedule Dates, Departure Time, and Arrival Time.');
      return;
    }
    // Validate pickup times
    const selRoute = filteredRoutes.find(r => r._id === formData.route);
    if (selRoute && selRoute.pickupPoints && selRoute.pickupPoints.length > 0) {
      for (let i = 0; i < selRoute.pickupPoints.length; i++) {
        if (!formData.pickupTimes[i] || !formData.pickupTimes[i].trim()) {
          toast.error(`Please fill in the pickup time for ${selRoute.pickupPoints[i]}.`);
          return;
        }
      }
    }
    // Validate drop times
    if (selRoute && selRoute.dropPoints && selRoute.dropPoints.length > 0) {
      for (let i = 0; i < selRoute.dropPoints.length; i++) {
        if (!formData.dropTimes[i] || !formData.dropTimes[i].trim()) {
          toast.error(`Please fill in the drop time for ${selRoute.dropPoints[i]}.`);
          return;
        }
      }
    }
    try {
      if (editMode && selectedSchedule) {
        await axios.put(`${backendUrl}/api/operator/schedules/${selectedSchedule._id}`, formData, {
          headers: { Authorization: `Bearer ${operatorData?.token}` }
        });
        toast.success('Schedule updated successfully');
      } else {
        await axios.post(`${backendUrl}/api/operator/schedules`, formData, {
          headers: { Authorization: `Bearer ${operatorData?.token}` }
        });
        toast.success('Schedule added successfully');
      }
      closeModal();
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to save schedule');
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      await axios.delete(`${backendUrl}/api/operator/schedules/${deleteConfirmSchedule._id}`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      toast.success('Schedule deleted successfully');
      setDeleteConfirmSchedule(null);
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-screen-2xl mx-auto p-8">
        {/* Header */}
        <Box className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h3" className="font-bold">Manage Bus Schedules</Typography>
            <div className="flex items-center space-x-4">
              <Button variant="contained" color="primary" onClick={openModalForAdd} startIcon={<FaPlusCircle />}>
                Add New Schedule
              </Button>
              <button
                onClick={handleClosePage}
                className="p-2 text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>
          <hr className="my-14 border-gray-300" />

          {/* Filters arranged in one line */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <TextField
              label="Search by Bus Name"
              variant="outlined"
              size="small"
              className="min-w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" className='w-[635px]'>
                    <FaSearch />
                  </InputAdornment>
                )
              }}
            />
            <Button variant="contained" color="primary">
              Search
            </Button>
            <FormControl variant="outlined" size="small" className="w-[150px]">
              <InputLabel>Date Filter</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Date Filter"
              >
                <MenuItem value="">All Dates</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="this week">This Week</MenuItem>
                <MenuItem value="this month">This Month</MenuItem>
                <MenuItem value="this year">This Year</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" className="w-[200px]">
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter Type"
              >
                <MenuItem value="all">All Schedules</MenuItem>
                <MenuItem value="upcoming">Upcoming Schedules</MenuItem>
                <MenuItem value="previous">Previous Schedules</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Manual Date Range Fields */}
          {dateFilter === 'manual' && (
            <div className="flex items-center gap-2 mb-8">
              <TextField
                label="From Date"
                type="date"
                size="small"
                value={manualFromDate}
                onChange={(e) => setManualFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                className="min-w-[150px]"
              />
              <TextField
                label="To Date"
                type="date"
                size="small"
                value={manualToDate}
                onChange={(e) => setManualToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                className="min-w-[150px]"
              />
            </div>
          )}
          <hr className="my-8 border-gray-300" />

          {loading ? (
            <p>Loading schedules...</p>
          ) : schedules.length === 0 || filteredSchedules.length === 0 ? (
            <Typography variant="body1">No schedule data found.</Typography>
          ) : (
            <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-2">
              {filteredSchedules.map(schedule => (
                <div
                  key={schedule._id}
                  className="relative border rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow bg-white min-h-[300px] w-full max-w-[700px] mx-auto"
                >
                  <Typography variant="body1" className="mb-2">
                    <strong>Bus:</strong> {schedule.bus?.busName || 'N/A'}
                  </Typography>
                  <Typography variant="body1" className="mb-2">
                    <strong>Route:</strong> {schedule.route?.from || 'N/A'} to {schedule.route?.to || 'N/A'}
                  </Typography>
                  <Box className="mb-2">
                    <Typography variant="body1"><strong>Schedule Dates:</strong></Typography>
                    <Box ml={2}>
                      <ul className="list-disc">
                        {schedule.scheduleDates.map((d, idx) => (
                          <li key={idx}>{new Date(d).toLocaleDateString()}</li>
                        ))}
                      </ul>
                    </Box>
                  </Box>
                  <Typography variant="body1" className="mb-2">
                    <strong>Departure at {schedule.route?.from || 'N/A'}:</strong> {schedule.fromTime}
                  </Typography>
                  <Typography variant="body1" className="mb-2">
                    <strong>Arrival at {schedule.route?.to || 'N/A'}:</strong> {schedule.toTime}
                  </Typography>
                  <Box className="mb-2">
                    <Typography variant="body2"><strong>Pickup Times:</strong></Typography>
                    <Box ml={2}>
                      <ul className="list-disc">
                        {schedule.pickupTimes && schedule.pickupTimes.map((time, idx) => (
                          <li key={idx}>
                            {schedule.route?.pickupPoints && schedule.route.pickupPoints[idx]
                              ? `${schedule.route.pickupPoints[idx]}: ${time}`
                              : time}
                          </li>
                        ))}
                      </ul>
                    </Box>
                  </Box>
                  <Box className="mb-2">
                    <Typography variant="body2"><strong>Drop Times:</strong></Typography>
                    <Box ml={2}>
                      <ul className="list-disc">
                        {schedule.dropTimes && schedule.dropTimes.map((time, idx) => (
                          <li key={idx}>
                            {schedule.route?.dropPoints && schedule.route.dropPoints[idx]
                              ? `${schedule.route.dropPoints[idx]}: ${time}`
                              : time}
                          </li>
                        ))}
                      </ul>
                    </Box>
                  </Box>
                  <div className="mt-8 flex space-x-4">
                    {isUpcoming(schedule.scheduleDates) && (
                      <>
                        <Button variant="outlined" startIcon={<FaEdit />} onClick={() => openModalForEdit(schedule)}>
                          Edit
                        </Button>
                        <Button variant="contained" color="error" startIcon={<FaTrash />} onClick={() => setDeleteConfirmSchedule(schedule)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Box>

        {/* Modal for Add/Edit Schedule */}
        <Modal open={modalOpen} onClose={closeModal}>
          <Box sx={modalStyle}>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h4">{editMode ? 'Edit Schedule' : 'Add New Schedule'}</Typography>
              <IconButton onClick={closeModal}>
                <FaTimes className="text-red-600" />
              </IconButton>
            </div>
            <Typography variant="caption" color="textSecondary" className="block mb-4">
              Note: Only buses with at least one route are listed in the dropdown. If no bus appears, add a route for that bus first.
            </Typography>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <TextField
                select
                label="Select Bus"
                name="bus"
                value={formData.bus}
                onChange={handleInputChange}
                fullWidth
              >
                {busesWithRoutes.length > 0 ? (
                  busesWithRoutes.map(bus => (
                    <MenuItem key={bus._id} value={bus._id}>
                      {bus.busName} ({bus.busNumber})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No bus found</MenuItem>
                )}
              </TextField>
              <TextField
                select
                label="Select Route"
                name="route"
                value={formData.route}
                onChange={handleInputChange}
                fullWidth
              >
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map(route => (
                    <MenuItem key={route._id} value={route._id}>
                      {route.from} to {route.to}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No route found for this bus</MenuItem>
                )}
              </TextField>
              <Box className="flex items-center gap-2">
                <TextField
                  label="Select Date"
                  type="date"
                  value={formData.selectedDate || ''}
                  onChange={(e) => {
                    // Directly add the date to the scheduleDates array
                    addDate(e.target.value);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              {formData.scheduleDates.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" className="mb-1">Schedule Dates:</Typography>
                  <ul className="list-disc ml-4">
                    {formData.scheduleDates.map((date, idx) => (
                      <li key={idx} className="flex items-center">
                        <span>{date}</span>
                        <IconButton size="small" onClick={() => removeDate(date)} className="ml-2">
                          <FaTrash className="text-red-600" />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
              {formData.route && (() => {
                const selRoute = filteredRoutes.find(r => r._id === formData.route);
                if (selRoute) {
                  return (
                    <>
                      <Typography variant="subtitle1" className="mt-2">
                        <strong>Departure at {selRoute.from}:</strong>
                      </Typography>
                      <TextField
                        type="time"
                        name="fromTime"
                        value={formData.fromTime}
                        onChange={handleInputChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                      <Typography variant="subtitle1" className="mt-2">
                        <strong>Arrival at {selRoute.to}:</strong>
                      </Typography>
                      <TextField
                        type="time"
                        name="toTime"
                        value={formData.toTime}
                        onChange={handleInputChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                      <Box>
                        <Typography variant="subtitle1" className="mb-1">Pickup Times</Typography>
                        {selRoute.pickupPoints && selRoute.pickupPoints.length > 0 ? (
                          selRoute.pickupPoints.map((point, index) => (
                            <TextField
                              key={index}
                              label={`Pickup at ${point}`}
                              type="time"
                              value={formData.pickupTimes[index] || ''}
                              onChange={(e) => {
                                const newTimes = [...formData.pickupTimes];
                                newTimes[index] = e.target.value;
                                setFormData(prev => ({ ...prev, pickupTimes: newTimes }));
                              }}
                              fullWidth
                              margin="dense"
                              InputLabelProps={{ shrink: true }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2">No pickup locations defined for this route.</Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" className="mb-1">Drop Times</Typography>
                        {selRoute.dropPoints && selRoute.dropPoints.length > 0 ? (
                          selRoute.dropPoints.map((point, index) => (
                            <TextField
                              key={index}
                              label={`Drop at ${point}`}
                              type="time"
                              value={formData.dropTimes[index] || ''}
                              onChange={(e) => {
                                const newTimes = [...formData.dropTimes];
                                newTimes[index] = e.target.value;
                                setFormData(prev => ({ ...prev, dropTimes: newTimes }));
                              }}
                              fullWidth
                              margin="dense"
                              InputLabelProps={{ shrink: true }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2">No drop locations defined for this route.</Typography>
                        )}
                      </Box>
                    </>
                  );
                }
                return <Typography variant="body2">Select a route to see location details.</Typography>;
              })()}
              <Box className="flex justify-end gap-4">
                <Button variant="outlined" onClick={closeModal}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" type="submit">
                  {editMode ? 'Update Schedule' : 'Add Schedule'}
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal open={Boolean(deleteConfirmSchedule)} onClose={() => setDeleteConfirmSchedule(null)}>
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
            <Box className="mb-4">
              <Typography variant="body1">
                Are you sure you want to delete the schedule for bus <strong>{deleteConfirmSchedule?.bus?.busName}</strong> on:
              </Typography>
              <Box ml={2}>
                <ul className="list-disc">
                  {deleteConfirmSchedule?.scheduleDates.map((date, idx) => (
                    <li key={idx}>{new Date(date).toLocaleDateString()}</li>
                  ))}
                </ul>
              </Box>
            </Box>
            <Box className="flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setDeleteConfirmSchedule(null)}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleDeleteSchedule}>
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ManageSchedule;
