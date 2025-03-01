import mongoose from 'mongoose';

const routeSchema = mongoose.Schema(
  {
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', required: true },
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    pickupPoints: [{ type: String }],
    dropPoints: [{ type: String }],
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);
export default Route;
