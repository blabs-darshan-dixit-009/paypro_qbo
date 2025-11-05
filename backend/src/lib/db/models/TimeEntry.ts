// src/lib/db/models/TimeEntry.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITimeEntry extends Document {
  employeeId: mongoose.Types.ObjectId;
  payPeriodId: mongoose.Types.ObjectId;
  qbEmployeeId?: string;
  date: Date;
  hours: number;
  type: 'regular' | 'overtime' | 'pto' | 'sick';
  source: 'quickbooks_online' | 'quickbooks_time' | 'manual';
  qbTimeActivityId?: string;
  createdAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    payPeriodId: {
      type: Schema.Types.ObjectId,
      ref: 'PayPeriod',
      required: true,
    },
    qbEmployeeId: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['regular', 'overtime', 'pto', 'sick'],
      default: 'regular',
    },
    source: {
      type: String,
      enum: ['quickbooks_online', 'quickbooks_time', 'manual'],
      default: 'quickbooks_online',
    },
    qbTimeActivityId: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
TimeEntrySchema.index({ employeeId: 1, date: -1 });
TimeEntrySchema.index({ payPeriodId: 1 });
TimeEntrySchema.index({ qbEmployeeId: 1, date: 1 });

const TimeEntry: Model<ITimeEntry> =
  mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);

export default TimeEntry;