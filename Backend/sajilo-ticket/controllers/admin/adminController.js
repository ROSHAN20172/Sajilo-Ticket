import Admin from "../../models/admin/adminModel.js"; 

export const getAdminData = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password');

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        res.status(200).json({
            success: true,
            adminData: {
                name: admin.name,
                isAccountVerified: admin.isAccountVerified,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error. Try again later.' });
    }
};
