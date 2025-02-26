import Bus from '../../models/operator/busModel.js';
import { google } from 'googleapis';
import { Readable } from 'stream';

// Helper function: uploads a file (from memory) to Google Drive and returns the public URL.
const uploadFileToDrive = async (file, folderId, operatorEmail) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const driveService = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            name: file.originalname,
            parents: [folderId || ''],
        };

        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);

        const media = {
            mimeType: file.mimetype,
            body: bufferStream,
        };

        const response = await driveService.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
        });

        const fileId = response.data.id;
        if (!fileId) {
            return null;
        }

        // Use the operator's email passed from the request
        if (!operatorEmail) {
            return null;
        }
        await driveService.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'user',
                emailAddress: operatorEmail,
            },
        });

        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    } catch (error) {
        return null;
    }
};

export const addBus = async (req, res) => {
    try {
        // Extract fields from req.body
        const { busName, busNumber, busDescription, reservationPolicies, amenities } = req.body;

        // Validate required text fields
        if (!busName || !busNumber) {
            return res.status(400).json({
                success: false,
                message: "Bus Name and Bus Number are required."
            });
        }

        // Parse JSON-stringified arrays for checkboxes
        const parsedReservationPolicies = reservationPolicies ? JSON.parse(reservationPolicies) : [];
        const parsedAmenities = amenities ? JSON.parse(amenities) : [];

        // Validate that at least one reservation policy and one amenity are selected
        if (!parsedReservationPolicies.length) {
            return res.status(400).json({
                success: false,
                message: "At least one reservation policy must be selected."
            });
        }
        if (!parsedAmenities.length) {
            return res.status(400).json({
                success: false,
                message: "At least one amenity must be selected."
            });
        }

        // Validate bus images (if provided)
        const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
        const imageFields = ['busImageFront', 'busImageBack', 'busImageLeft', 'busImageRight'];
        for (let field of imageFields) {
            if (req.files[field] && req.files[field][0]) {
                const file = req.files[field][0];
                if (!file.mimetype.startsWith('image/')) {
                    return res.status(400).json({
                        success: false,
                        message: `${field} must be an image file.`
                    });
                }
                if (file.size > MAX_IMAGE_SIZE) {
                    return res.status(400).json({
                        success: false,
                        message: `${field} must be less than 1MB.`
                    });
                }
            }
        }

        // Folder ID for bus-related files (documents and images)
        const folderId = process.env.GOOGLE_DRIVE_BUS_FOLDER_ID || '';

        // Upload files if provided
        let bluebookUrl = '';
        let roadPermitUrl = '';
        let insuranceUrl = '';
        let frontImageUrl = '';
        let backImageUrl = '';
        let leftImageUrl = '';
        let rightImageUrl = '';

        if (req.files) {
            if (req.files.bluebook && req.files.bluebook[0]) {
                bluebookUrl = await uploadFileToDrive(req.files.bluebook[0], folderId, req.operator.email);
            }
            if (req.files.roadPermit && req.files.roadPermit[0]) {
                roadPermitUrl = await uploadFileToDrive(req.files.roadPermit[0], folderId, req.operator.email);
            }
            if (req.files.insurance && req.files.insurance[0]) {
                insuranceUrl = await uploadFileToDrive(req.files.insurance[0], folderId, req.operator.email);
            }
            if (req.files.busImageFront && req.files.busImageFront[0]) {
                frontImageUrl = await uploadFileToDrive(req.files.busImageFront[0], folderId, req.operator.email);
            }
            if (req.files.busImageBack && req.files.busImageBack[0]) {
                backImageUrl = await uploadFileToDrive(req.files.busImageBack[0], folderId, req.operator.email);
            }
            if (req.files.busImageLeft && req.files.busImageLeft[0]) {
                leftImageUrl = await uploadFileToDrive(req.files.busImageLeft[0], folderId, req.operator.email);
            }
            if (req.files.busImageRight && req.files.busImageRight[0]) {
                rightImageUrl = await uploadFileToDrive(req.files.busImageRight[0], folderId, req.operator.email);
            }
        }

        // Create a new Bus document with the authenticated operator's id
        const newBus = new Bus({
            busName,
            busNumber,
            busDescription,
            documents: {
                bluebook: bluebookUrl,
                roadPermit: roadPermitUrl,
                insurance: insuranceUrl,
            },
            reservationPolicies: parsedReservationPolicies,
            amenities: parsedAmenities,
            images: {
                front: frontImageUrl,
                back: backImageUrl,
                left: leftImageUrl,
                right: rightImageUrl,
            },
            createdBy: req.operator.id,  // using operator id from token payload
            verified: false,
        });

        await newBus.save();
        return res.status(201).json({ success: true, message: 'Bus added successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error. Try again later.' });
    }
};
