// import jwt from 'jsonwebtoken';

// const adminAuth = async (req, res, next) => {
//     const { adminToken } = req.cookies;

//     if (!adminToken) {
//         return res.json({ success: false, message: 'Not Authorized. Admin login required' });
//     }

//     try {
//         const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        
//         if (decoded.id) {
//             req.body.adminId = decoded.id;
//         } else {
//             return res.json({ success: false, message: 'Not Authorized. Admin login required' });
//         }

//         next();
//     } catch (error) {
//         return res.json({ success: false, message: 'Not Authorized. Invalid token' });
//     }
// };

// export default adminAuth;
