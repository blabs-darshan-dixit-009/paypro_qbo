// src/lib/db/models/QuickBooksConnection.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuickBooksConnection extends Document {
  userId: mongoose.Types.ObjectId;
  realmId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  companyName?: string;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuickBooksConnectionSchema = new Schema<IQuickBooksConnection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    realmId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    refreshExpiresAt: {
      type: Date,
      required: true,
    },
    companyName: {
      type: String,
    },
    lastSyncAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
QuickBooksConnectionSchema.index({ userId: 1 });
QuickBooksConnectionSchema.index({ realmId: 1 });

const QuickBooksConnection: Model<IQuickBooksConnection> =
  mongoose.models.QuickBooksConnection ||
  mongoose.model<IQuickBooksConnection>('QuickBooksConnection', QuickBooksConnectionSchema);

export default QuickBooksConnection;