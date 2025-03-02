// import mongoose from 'mongoose';

// const scheduleSchema = mongoose.Schema({
//   operator: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', required: true },
//   bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
//   route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
//   scheduleDates: [{ type: Date, required: true }],
//   fromTime: { type: String, required: true },   // e.g. "08:00"
//   toTime: { type: String, required: true },     // e.g. "12:00"
//   pickupTimes: [{ type: String, required: true }],  // should match route.pickupPoints length
//   dropTimes: [{ type: String, required: true }]     // should match route.dropPoints length
// }, { timestamps: true });

// const Schedule = mongoose.model('Schedule', scheduleSchema);
// export default Schedule;
