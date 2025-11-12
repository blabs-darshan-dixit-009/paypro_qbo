// src/lib/db/models/Employee.ts

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Employee Interface
 * Extended with department, jobTitle, and paymentMethod fields
 */
export interface IEmployee extends Document {
  userId: string;
  qbEmployeeId?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email?: string;
  phone?: string;
  hourlyRate: number;
  filingStatus: 'single' | 'married' | 'head_of_household';
  allowances: number;
  additionalWithholding: number;
  isActive: boolean;
  hiredDate?: Date;
  releasedDate?: Date;
  // New fields for comprehensive employee data
  department?: string;
  jobTitle?: string;
  paymentMethod?: 'direct_deposit' | 'check';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Employee Schema
 * MongoDB schema for employee data with comprehensive fields
 */
const EmployeeSchema = new Schema<IEmployee>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    qbEmployeeId: {
      type: String,
      index: true,
      sparse: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    filingStatus: {
      type: String,
      enum: ['single', 'married', 'head_of_household'],
      required: true,
      default: 'single',
    },
    allowances: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    additionalWithholding: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    hiredDate: {
      type: Date,
    },
    releasedDate: {
      type: Date,
    },
    department: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['direct_deposit', 'check'],
      default: 'check',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
EmployeeSchema.index({ userId: 1, isActive: 1 });
EmployeeSchema.index({ userId: 1, displayName: 1 });

// Prevent model recompilation in Next.js hot reload
const Employee = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;