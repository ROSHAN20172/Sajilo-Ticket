import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { FaEye, FaTrash, FaEdit, FaTimes, FaPlusCircle, FaImage, FaSearch } from 'react-icons/fa';
import { Modal, Box, Button, IconButton, Input, TextareaAutosize, TextField, InputAdornment } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const ManageBus = () => {
    const { backendUrl, operatorData } = useContext(OperatorAppContext);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBus, setSelectedBus] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [busToDelete, setBusToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBuses = buses.filter((bus) =>
        bus.busName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // formData holds existing field values (including preview URLs)
    const [formData, setFormData] = useState({
        busDescription: '',
        reservationPolicies: [],
        amenities: [],
        images: {
            front: '',
            back: '',
            left: '',
            right: ''
        },
        documents: {
            bluebook: '',
            roadPermit: '',
            insurance: ''
        }
    });

    // These states will store any new file objects selected by the operator
    const [newImages, setNewImages] = useState({});
    const [newDocuments, setNewDocuments] = useState({});

    // Fetch operator's buses
    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/operator/bus/buses`, {
                    headers: { Authorization: `Bearer ${operatorData?.token}` }
                });
                setBuses(res.data);
            } catch (error) {
                toast.error('Failed to fetch buses');
            } finally {
                setLoading(false);
            }
        };
        fetchBuses();
    }, [backendUrl, operatorData]);

    // Delete handlers
    const handleDelete = (bus) => {
        setBusToDelete(bus);
        setConfirmDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${backendUrl}/api/operator/bus/buses/${busToDelete._id}`, {
                headers: { Authorization: `Bearer ${operatorData?.token}` }
            });
            setBuses(prev => prev.filter(bus => bus._id !== busToDelete._id));
            toast.success('Bus deleted successfully');
            setConfirmDeleteModal(false);
            setBusToDelete(null);
        } catch (error) {
            toast.error('Failed to delete bus');
        }
    };

    const cancelDelete = () => {
        setConfirmDeleteModal(false);
        setBusToDelete(null);
    };

    // Open Details Modal and load bus details into form state
    const handleViewDetails = (bus) => {
        setSelectedBus(bus);
        setFormData({
            busDescription: bus.busDescription || '',
            reservationPolicies: bus.reservationPolicies || [],
            amenities: bus.amenities || [],
            images: {
                front: bus.images?.front || '',
                back: bus.images?.back || '',
                left: bus.images?.left || '',
                right: bus.images?.right || ''
            },
            documents: {
                bluebook: bus.documents?.bluebook || '',
                roadPermit: bus.documents?.roadPermit || '',
                insurance: bus.documents?.insurance || ''
            }
        });
        // Clear any previously stored new files
        setNewImages({});
        setNewDocuments({});
        setModalOpen(true);
        setEditMode(false);
    };

    // Generic input change (for text fields such as description)
    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // --- Reservation Policies Handlers ---
    const handlePolicyChange = (e, index) => {
        const newPolicies = [...formData.reservationPolicies];
        newPolicies[index] = e.target.value;
        setFormData(prev => ({ ...prev, reservationPolicies: newPolicies }));
    };

    const addPolicy = () => {
        setFormData(prev => ({ ...prev, reservationPolicies: [...prev.reservationPolicies, ''] }));
    };

    const removePolicy = (index) => {
        const newPolicies = formData.reservationPolicies.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, reservationPolicies: newPolicies }));
    };

    // --- Amenities Handlers ---
    const handleAmenityChange = (e, index) => {
        const newAmenities = [...formData.amenities];
        newAmenities[index] = e.target.value;
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    const addAmenity = () => {
        setFormData(prev => ({ ...prev, amenities: [...prev.amenities, ''] }));
    };

    const removeAmenity = (index) => {
        const newAmenities = formData.amenities.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    // --- Bus Image Upload Handler ---
    const handleImageUpload = (e, position) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file.');
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            toast.error('Image must be less than 1MB.');
            return;
        }
        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);
        // Update the preview in formData for immediate UI feedback
        setFormData(prev => ({
            ...prev,
            images: {
                ...prev.images,
                [position]: previewUrl
            }
        }));
        // Save the file object in newImages to upload later
        setNewImages(prev => ({
            ...prev,
            [position]: file
        }));
    };

    // --- Document Image Upload Handler ---
    const handleDocumentUpload = (e, docKey) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file.');
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            toast.error('Image must be less than 1MB.');
            return;
        }
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [docKey]: previewUrl
            }
        }));
        setNewDocuments(prev => ({
            ...prev,
            [docKey]: file
        }));
    };

    // Save changes handler: uploads any new files to drive then updates bus details.
    const handleSaveChanges = async () => {
        try {
            // Show a loading toast for image uploads.
            const uploadToastId = toast.loading("Uploading image, please wait...");

            // Updated images: if a new file exists for any position, upload it first.
            let updatedImages = { ...formData.images };
            for (const position in newImages) {
                const file = newImages[position];
                const data = new FormData();
                data.append('file', file);
                data.append('type', position);
                // Call your upload endpoint to upload file to drive.
                const res = await axios.post(`${backendUrl}/api/operator/bus/upload-file`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${operatorData?.token}`
                    }
                });
                updatedImages[position] = res.data.driveUrl; // assume driveUrl is returned
            }

            // Updated documents: only if bus is unverified.
            let updatedDocuments = { ...formData.documents };
            if (!selectedBus.verified) {
                for (const docKey in newDocuments) {
                    const file = newDocuments[docKey];
                    const data = new FormData();
                    data.append('file', file);
                    data.append('type', docKey);
                    const res = await axios.post(`${backendUrl}/api/operator/bus/upload-file`, data, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${operatorData?.token}`
                        }
                    });
                    updatedDocuments[docKey] = res.data.driveUrl;
                }
            }

            // Dismiss the loading toast once uploads are finished.
            toast.dismiss(uploadToastId);

            const updatedData = {
                busDescription: formData.busDescription,
                reservationPolicies: formData.reservationPolicies.filter(policy => policy.trim() !== ''),
                amenities: formData.amenities.filter(amenity => amenity.trim() !== ''),
                images: updatedImages,
                ...(selectedBus.verified ? {} : { documents: updatedDocuments })
            };

            const res = await axios.put(
                `${backendUrl}/api/operator/bus/buses/${selectedBus._id}`,
                updatedData,
                { headers: { Authorization: `Bearer ${operatorData?.token}` } }
            );
            setBuses(prev => prev.map(bus => bus._id === selectedBus._id ? res.data.bus : bus));
            toast.success('Bus details updated successfully');
            setEditMode(false);
            setSelectedBus(res.data.bus);
            // Clear the new files state after successful upload.
            setNewImages({});
            setNewDocuments({});
        } catch (error) {
            toast.error('Failed to update bus details');
        }
    };

    // Helper: Open image in a new tab
    const handleOpenImage = (url) => {
        if (url) {
            window.open(url, '_blank');
        } else {
            toast.error('Image not found');
        }
    };

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

    const navigate = useNavigate();

    const handleClose = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="max-w-8xl mx-auto p-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Manage Your Buses</h1>
                        <div className="flex items-center space-x-4">
                            <Link to="/operator/add-bus">
                                <Button variant="contained" color="primary" startIcon={<FaPlusCircle />}>
                                    Add New Bus
                                </Button>
                            </Link>
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
                            label="Search by Bus Name or Bus Number"
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
                        <Button variant="contained" color="primary" onClick={() => { /* Optionally trigger additional search actions */ }}>
                            Search
                        </Button>
                    </div>
                    <hr className="my-8 border-gray-300" />

                    {loading ? (
                        <p>Loading buses...</p>
                    ) : filteredBuses.length === 0 ? (
                        <p>No buses found.</p>
                    ) : (
                        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-2">
                            {filteredBuses.map((bus) => (
                                <div key={bus._id} className="relative border rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow bg-white">
                                    {/* Verified Status Badge */}
                                    <div className="absolute top-6 right-5">
                                        {bus.verified ? (
                                            <div className="px-2 py-1 rounded-xl text-green-700 border border-green-700 bg-green-100 text-xs font-semibold">
                                                Verified
                                            </div>
                                        ) : (
                                            <div className="px-2 py-1 rounded-xl text-red-700 border border-red-700 bg-red-100 text-xs font-semibold">
                                                Unverified
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-semibold mb-1">{bus.busName}</h2>
                                    <p className="text-gray-600">Bus Number: {bus.busNumber}</p>
                                    <div className="mt-24 flex justify-between">
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<FaEye />}
                                            onClick={() => handleViewDetails(bus)}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<FaTrash />}
                                            onClick={() => handleDelete(bus)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    <Modal open={confirmDeleteModal} onClose={cancelDelete}>
                        <Box sx={modalStyle}>
                            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
                            <p>
                                Are you sure you want to delete the bus <strong>{busToDelete?.busName}</strong>?
                            </p>
                            <div className="mt-6 flex justify-end space-x-4">
                                <Button variant="outlined" onClick={cancelDelete}>
                                    Cancel
                                </Button>
                                <Button variant="contained" color="error" onClick={confirmDelete}>
                                    Delete
                                </Button>
                            </div>
                        </Box>
                    </Modal>

                    {/* Bus Details Modal */}
                    {selectedBus && (
                        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                            <Box sx={modalStyle}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">{selectedBus.busName} Details</h2>
                                    <IconButton onClick={() => setModalOpen(false)}>
                                        <FaTimes className="text-red-600" />
                                    </IconButton>
                                </div>
                                {!editMode ? (
                                    <div>
                                        <p>
                                            <strong>Bus Number:</strong> {selectedBus.busNumber}
                                        </p>
                                        <hr className="my-4 border-gray-200" />
                                        <p className="mt-2">
                                            <strong>Description:</strong> {selectedBus.busDescription || 'N/A'}
                                        </p>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-2">
                                            <strong>Reservation Policies:</strong>
                                            {selectedBus.reservationPolicies && selectedBus.reservationPolicies.length > 0 ? (
                                                <ul className="ml-4 list-disc mt-1">
                                                    {selectedBus.reservationPolicies.map((policy, index) => (
                                                        <li key={index}>{policy}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="ml-4">N/A</p>
                                            )}
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-2">
                                            <strong>Amenities:</strong>
                                            {selectedBus.amenities && selectedBus.amenities.length > 0 ? (
                                                <ul className="ml-4 list-disc mt-1">
                                                    {selectedBus.amenities.map((amenity, index) => (
                                                        <li key={index}>{amenity}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="ml-4">N/A</p>
                                            )}
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-2">
                                            <strong>Document Images:</strong>
                                            <div className="mt-1 grid grid-rows-1 gap-3">
                                                {selectedBus.documents ? (
                                                    Object.entries(selectedBus.documents).map(([key, url], idx) => (
                                                        <Button
                                                            key={idx}
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<FaImage />}
                                                            onClick={() => handleOpenImage(url)}
                                                            className="w-fit"
                                                        >
                                                            View {key.charAt(0).toUpperCase() + key.slice(1)}
                                                        </Button>
                                                    ))
                                                ) : (
                                                    <p>N/A</p>
                                                )}
                                            </div>
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-2">
                                            <strong>Bus Images:</strong>
                                            <div className="mt-1 grid grid-rows-1 gap-3">
                                                {selectedBus.images ? (
                                                    Object.entries(selectedBus.images).map(([key, url], idx) => (
                                                        <Button
                                                            key={idx}
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<FaImage />}
                                                            onClick={() => handleOpenImage(url)}
                                                            className="w-fit"
                                                        >
                                                            View {key.charAt(0).toUpperCase() + key.slice(1)}
                                                        </Button>
                                                    ))
                                                ) : (
                                                    <p>N/A</p>
                                                )}
                                            </div>
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-4 flex justify-end">
                                            <Button variant="contained" startIcon={<FaEdit />} onClick={() => setEditMode(true)}>
                                                Edit Details
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // --- Edit Mode Form ---
                                    <div>
                                        {/* Description */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-1">Description</label>
                                            <TextareaAutosize
                                                name="busDescription"
                                                value={formData.busDescription}
                                                onChange={handleInputChange}
                                                minRows={3}
                                                style={{ width: '100%', padding: '8px' }}
                                            />
                                        </div>
                                        <hr className="my-4 border-gray-200" />

                                        {/* Reservation Policies */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-1">Reservation Policies</label>
                                            {formData.reservationPolicies.map((policy, index) => (
                                                <div key={index} className="flex items-center mb-2">
                                                    <Input
                                                        name={`reservationPolicy-${index}`}
                                                        value={policy}
                                                        onChange={(e) => handlePolicyChange(e, index)}
                                                        fullWidth
                                                    />
                                                    <IconButton onClick={() => removePolicy(index)}>
                                                        <FaTimes className="text-red-600" />
                                                    </IconButton>
                                                </div>
                                            ))}
                                            <Button variant="outlined" onClick={addPolicy} startIcon={<FaPlusCircle />} size="small">
                                                Add Policy
                                            </Button>
                                        </div>
                                        <hr className="my-4 border-gray-200" />

                                        {/* Amenities */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-1">Amenities</label>
                                            {formData.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-center mb-2">
                                                    <Input
                                                        name={`amenity-${index}`}
                                                        value={amenity}
                                                        onChange={(e) => handleAmenityChange(e, index)}
                                                        fullWidth
                                                    />
                                                    <IconButton onClick={() => removeAmenity(index)}>
                                                        <FaTimes className="text-red-600" />
                                                    </IconButton>
                                                </div>
                                            ))}
                                            <Button variant="outlined" onClick={addAmenity} startIcon={<FaPlusCircle />} size="small">
                                                Add Amenity
                                            </Button>
                                        </div>
                                        <hr className="my-4 border-gray-200" />

                                        {/* Bus Images */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-1">Bus Images</label>
                                            {['front', 'back', 'left', 'right'].map((position) => (
                                                <div key={position} className="mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<FaImage />}
                                                            onClick={() => handleOpenImage(formData.images[position])}
                                                        >
                                                            View {position.charAt(0).toUpperCase() + position.slice(1)}
                                                        </Button>
                                                        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded">
                                                            Choose Image
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleImageUpload(e, position)}
                                                            />
                                                        </label>
                                                    </div>
                                                    {formData.images[position] && (
                                                        <p className="text-sm text-gray-500 mt-1 break-all">
                                                            {formData.images[position]}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <hr className="my-4 border-gray-200" />

                                        {/* Document Images - only if bus is unverified */}
                                        {!selectedBus.verified && (
                                            <div className="mb-4">
                                                <label className="block font-semibold mb-1">Document Images</label>
                                                {['bluebook', 'roadPermit', 'insurance'].map((docKey) => (
                                                    <div key={docKey} className="mb-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<FaImage />}
                                                                onClick={() => handleOpenImage(formData.documents[docKey])}
                                                            >
                                                                View {docKey.charAt(0).toUpperCase() + docKey.slice(1)}
                                                            </Button>
                                                            <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded">
                                                                Choose {docKey.charAt(0).toUpperCase() + docKey.slice(1)} Image
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={(e) => handleDocumentUpload(e, docKey)}
                                                                />
                                                            </label>
                                                        </div>
                                                        {formData.documents[docKey] && (
                                                            <p className="text-sm text-gray-500 mt-1 break-all">
                                                                {formData.documents[docKey]}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <hr className="my-4 border-gray-200" />

                                        {/* Action Buttons: Cancel then Save Changes */}
                                        <div className="flex justify-end space-x-4 mt-4">
                                            <Button variant="outlined" onClick={() => setEditMode(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveChanges}
                                                sx={{ backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' } }}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Box>
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageBus;
