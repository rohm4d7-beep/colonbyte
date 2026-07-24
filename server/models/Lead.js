import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    address: { type: String, default: '' },
    country: { type: String, default: '' },
    keyword: { type: String, required: true },
    status: { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' },
  },
  { timestamps: true }
);

leadSchema.index({ businessName: 1, keyword: 1 }, { unique: true });

export default mongoose.model('Lead', leadSchema);
