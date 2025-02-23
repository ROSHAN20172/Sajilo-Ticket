import mongoose from 'mongoose';

const operatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  panNo: { type: String, required: true },
  panImage: { type: String, default: '' }, // Will store the Google Drive URL
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },
}, { timestamps: true });

const Operator = mongoose.model('Operator', operatorSchema);
export default Operator;