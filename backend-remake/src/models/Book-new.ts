import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  _id: string;
  mainText: string; // Frontend expects mainText instead of title
  author: string;
  description?: string;
  isbn?: string;
  category: string;
  price: number;
  sold?: number;
  quantity: number; // Frontend expects quantity instead of stock
  thumbnail?: string; // Main image
  slider?: string[]; // Array of images
  publisher?: string;
  publishedDate?: Date;
  language?: string;
  pages?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  rating?: {
    average: number;
    count: number;
  };
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>({
  mainText: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows multiple documents with null/undefined ISBN
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  sold: {
    type: Number,
    min: [0, 'Sold quantity cannot be negative'],
    default: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  thumbnail: {
    type: String,
    trim: true
  },
  slider: [{
    type: String,
    trim: true
  }],
  publisher: {
    type: String,
    trim: true
  },
  publishedDate: {
    type: Date
  },
  language: {
    type: String,
    trim: true,
    default: 'Vietnamese'
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    }
  },
  rating: {
    average: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    count: {
      type: Number,
      min: [0, 'Rating count cannot be negative'],
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Create indexes for better performance
bookSchema.index({ mainText: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ isFeatured: 1, isActive: 1 });
bookSchema.index({ createdAt: -1 });

// Virtual for slug (URL-friendly version of mainText)
bookSchema.virtual('slug').get(function() {
  return this.mainText
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
});

// Methods
bookSchema.methods.toJSON = function() {
  const bookObject = this.toObject({ virtuals: true });
  return bookObject;
};

// Static methods
bookSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true });
};

bookSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true });
};

export const Book = mongoose.model<IBook>('Book', bookSchema);
