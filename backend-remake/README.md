# Bookstore Backend API

A comprehensive backend API for an online bookstore application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with user and admin roles
- **Book Management**: CRUD operations for books with search, filtering, and pagination
- **Shopping Cart**: Add, update, remove items with persistent cart storage
- **Order Management**: Complete order processing with status tracking
- **Reviews & Ratings**: User reviews with rating system and verification
- **File Upload**: Image upload for book covers with validation
- **Admin Dashboard**: Administrative endpoints for managing books, orders, and reviews

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookstore-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bookstore
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify-token` - Verify JWT token

### Books
- `GET /api/books` - Get all books (with filters and pagination)
- `GET /api/books/featured` - Get featured books
- `GET /api/books/search` - Search books
- `GET /api/books/category/:category` - Get books by category
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:bookId` - Update cart item quantity
- `DELETE /api/cart/remove/:bookId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart
- `GET /api/cart/count` - Get cart item count

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/admin/all` - Get all orders (Admin only)
- `PUT /api/orders/admin/:id/status` - Update order status (Admin only)
- `GET /api/orders/admin/stats` - Get order statistics (Admin only)

### Reviews
- `GET /api/reviews/book/:bookId` - Get reviews for a book
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/reviews/admin/all` - Get all reviews (Admin only)
- `PUT /api/reviews/admin/:id/approve` - Approve/reject review (Admin only)

### File Upload
- `POST /api/upload/single` - Upload single image (Admin only)
- `POST /api/upload/multiple` - Upload multiple images (Admin only)

### Health Check
- `GET /api/health` - API health check

## Data Models

### User
- Personal information (name, email, phone)
- Authentication credentials
- Address information
- Role-based access (user/admin)

### Book
- Book details (title, author, description, ISBN)
- Pricing and inventory
- Images and metadata
- Categories and tags
- Rating system

### Cart
- User-specific cart items
- Quantity and pricing
- Automatic total calculation

### Order
- Order items and quantities
- Shipping address
- Payment method and status
- Order tracking

### Review
- User reviews and ratings
- Verification for purchased items
- Admin approval system

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration
- Input validation and sanitization
- File upload restrictions
- Role-based authorization

## Development

### Project Structure
```
src/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # MongoDB models
├── routes/         # API routes
├── utils/          # Utility functions
└── server.ts       # Main server file
```

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run test` - Run tests (if configured)

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Async/await for asynchronous operations
- Error handling middleware
- Consistent API response format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
