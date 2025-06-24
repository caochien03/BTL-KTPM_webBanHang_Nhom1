import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  user: Types.ObjectId;
  book: Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative']
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure one review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });
reviewSchema.index({ book: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
