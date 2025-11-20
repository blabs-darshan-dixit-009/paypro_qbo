// src/lib/db/models/TimeEntry.ts

import mongoose, { Document, Schema } from 'mongoose';

/**
 * TimeEntry Interface
 * Represents time worked by an employee
 */
export interface ITimeEntry extends Document {
  userId: string;
  employeeId: mongoose.Types.ObjectId;
  qbEmployeeId?: string;
  qbTimeActivityId?: string;
  payPeriodId?: mongoose.Types.ObjectId;
  date: Date;
  hours: number;
  minutes?: number;
  type: 'regular' | 'overtime' | 'pto' | 'sick';
  source: 'quickbooks' | 'quickbooks_online' | 'manual';
  description?: string;
  hourlyRate?: number;
  billable?: boolean;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TimeEntry Schema
 * MongoDB schema for time entry data
 */
const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    qbEmployeeId: {
      type: String,
      index: true,
      sparse: true,
    },
    qbTimeActivityId: {
      type: String,
      index: true,
      sparse: true,
      unique: true,
    },
    payPeriodId: {
      type: Schema.Types.ObjectId,
      ref: 'PayPeriod',
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    minutes: {
      type: Number,
      default: 0,
      min: 0,
      max: 59,
    },
    type: {
      type: String,
      enum: ['regular', 'overtime', 'pto', 'sick'],
      required: true,
      default: 'regular',
    },
    source: {
      type: String,
      enum: ['quickbooks', 'quickbooks_online', 'manual'], 
      required: true,
      default: 'quickbooks',
    },
    description: {
      type: String,
      trim: true,
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
    billable: {
      type: Boolean,
      default: false,
    },
    customerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
TimeEntrySchema.index({ userId: 1, employeeId: 1, date: 1 });
TimeEntrySchema.index({ userId: 1, payPeriodId: 1 });
TimeEntrySchema.index({ employeeId: 1, date: 1 });

// Prevent model recompilation in Next.js hot reload
const TimeEntry = mongoose.models.TimeEntry || mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);

export default TimeEntry;