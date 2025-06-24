<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Bookstore Backend API - Copilot Instructions

This is a Node.js Express backend API for an online bookstore application built with TypeScript and MongoDB.

## Project Context

This backend serves a complete bookstore e-commerce platform with the following key features:
- User authentication and authorization (JWT-based)
- Book catalog management with search and filtering
- Shopping cart functionality
- Order processing and management
- Review and rating system
- File upload for book images
- Admin dashboard functionality

## Code Style & Patterns

### TypeScript Best Practices
- Use strict type checking
- Define interfaces for all data models
- Use async/await instead of callbacks
- Implement proper error handling with try-catch blocks

### API Design Patterns
- Follow RESTful API conventions
- Use consistent response format via ResponseHandler utility
- Implement proper HTTP status codes
- Use validation middleware for input validation
- Apply authentication/authorization middleware where needed

### Database Patterns
- Use Mongoose for MongoDB operations
- Implement proper schema validation
- Use population for related data
- Add appropriate indexes for performance
- Use aggregation for complex queries

### Error Handling
- Use asyncHandler wrapper for async route handlers
- Implement global error handling middleware
- Provide meaningful error messages
- Log errors appropriately

### Security Considerations
- Validate all inputs using express-validator
- Implement rate limiting
- Use CORS properly
- Hash passwords with bcrypt
- Sanitize user inputs
- Check authorization for admin routes

## File Structure Conventions

```
src/
├── controllers/    # Business logic for each route
├── middleware/     # Authentication, validation, error handling
├── models/        # MongoDB schemas and models
├── routes/        # Route definitions and middleware
├── utils/         # Helper functions and utilities
└── server.ts      # Main application entry point
```

## Common Patterns to Follow

### Controller Pattern
```typescript
export class ExampleController {
  static methodName = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHandler.validationError(res, 'Validation failed', errors.array());
    }

    // Business logic
    const result = await SomeModel.findById(req.params.id);
    
    // Response
    ResponseHandler.success(res, 'Success message', result);
  });
}
```

### Model Pattern
```typescript
export interface IModel extends Document {
  field: string;
  // ... other fields
}

const modelSchema = new Schema<IModel>({
  field: { type: String, required: true }
}, { timestamps: true });

export const Model = mongoose.model<IModel>('Model', modelSchema);
```

### Route Pattern
```typescript
import { Router } from 'express';
import { Controller } from '../controllers/controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', Controller.getAll);
router.post('/', authenticate, Controller.create);
router.put('/:id', authenticate, authorize('admin'), Controller.update);

export default router;
```

## Environment Variables
- Always use environment variables for configuration
- Provide sensible defaults
- Document required variables in .env.example

## Testing Considerations
- Write unit tests for utility functions
- Test API endpoints with proper mocking
- Test error scenarios and edge cases
- Validate authentication and authorization

## Performance Considerations
- Use pagination for large datasets
- Implement proper database indexes
- Use aggregation for complex queries
- Cache frequently accessed data when appropriate

When generating code for this project, please follow these patterns and conventions to maintain consistency with the existing codebase.
