// src/lib/db/models/PayPeriod.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayPeriod extends Document {
  userId: string;
  startDate: Date;
  endDate: Date;
  processDate: Date;
  status: 'draft' | 'processing' | 'processed' | 'synced' | 'paid';
  employeeCount?: number;
  totalGrossPay?: number;
  totalNetPay?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PayPeriodSchema = new Schema<IPayPeriod>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    processDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'processed', 'synced', 'paid'],
      default: 'draft',
    },
    employeeCount: {
      type: Number,
      min: 0,
    },
    totalGrossPay: {
      type: Number,
      min: 0,
    },
    totalNetPay: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PayPeriodSchema.index({ userId: 1, startDate: -1 });
PayPeriodSchema.index({ status: 1 });

const PayPeriod: Model<IPayPeriod> =
  mongoose.models.PayPeriod || mongoose.model<IPayPeriod>('PayPeriod', PayPeriodSchema);

export default PayPeriod;