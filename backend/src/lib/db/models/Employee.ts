// src/lib/db/models/Employee.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

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
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    qbEmployeeId: {
      type: String,
      sparse: true, // Allows multiple null values
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
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
      default: 'single',
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0,
    },
    additionalWithholding: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hiredDate: {
      type: Date,
    },
    releasedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique QB employee per user
EmployeeSchema.index({ userId: 1, qbEmployeeId: 1 }, { unique: true, sparse: true });
EmployeeSchema.index({ userId: 1, isActive: 1 });
EmployeeSchema.index({ displayName: 1 });

const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;