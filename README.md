# Electronics eCommerce Shop Documentation

## Project Overview

This is a Next.js-based eCommerce application for electronics products with an integrated admin dashboard. The application follows a modern architecture with client-side rendering for dynamic user interactions and server-side functionality for data management.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, DaisyUI
- **State Management**: Zustand
- **Backend**: Node.js
- **Database**: Prisma ORM
- **Authentication**: NextAuth
- **UI Components**: Custom components, react-slick for carousels
- **Notifications**: react-hot-toast

## Project Structure

- app: Main application code using Next.js App Router
  - (dashboard): Admin dashboard routes
  - checkout: Checkout functionality
  - cart: Shopping cart page
  - login: User authentication
- components: Reusable React components
- server: Backend API controllers and logic
- lib: Utility functions and shared code

## Key Features

### Customer Features

1. **Product Browsing**: Browse and search for electronic products
2. **Shopping Cart**: Add items to cart managed with Zustand
3. **Checkout Process**: Complete order with shipping and payment information
4. **User Authentication**: Login/registration system
5. **Order Management**: View order history and status

### Admin Features

1. **Product Management**: Add, edit, delete products
2. **Order Management**: View, update order status (processing, delivered, canceled)
3. **User Management**: Add, edit, delete users with different roles
4. **Dashboard**: Analytics and statistics

## Data Models

### Products

- Basic information (id, title, slug, price)
- Stock availability
- Categories
- Images
- Description

### Orders

- Customer information (name, contact details)
- Shipping address
- Order status (processing, delivered, canceled)
- Order notes
- Total amount
- Many-to-many relationship with products (quantity per product)

### Users

- Authentication credentials
- Role (user, admin)
- Profile information

## API Endpoints

The application uses RESTful endpoints for data operations:

- `/api/users`: User management
- `/api/orders`: Order processing
- `/api/order-product`: Many-to-many relationship management
- `/api/products`: Product catalog management

## Authentication

- Uses NextAuth.js for authentication
- Supports credential-based authentication
- Role-based authorization for admin features

## Form Validation

The application implements robust form validation for:

- User registration/login
- Checkout process
- Credit card information
- Address details

## Utilities

- `utils.js`: Contains validation functions for:
  - Email format
  - Name/lastname format
  - Credit card validation
  - CVV/CVC validation
  - Expiration date validation

## Styling

- Tailwind CSS for utility-first styling
- Custom CSS variables for theming
- Responsive design for mobile and desktop views
- DaisyUI components for rapid development

## Build and Deployment

- Project uses TypeScript for type safety
- Next.js build process for optimization
- Configuration for production deployment

## Notes

- The application is set up with hot module reloading for development
- Environment variables should be configured for production deployment
- The `next.config.js` contains project configuration settings

This eCommerce platform provides a complete solution for selling electronics online with both customer-facing features and administrative tools for managing the store.

## Authentication System

The authentication system in this Electronics eCommerce application uses:

## Technologies

- **NextAuth.js**: The primary authentication framework
- **Prisma ORM**: For user data storage and retrieval
- **bcrypt**: For password hashing and verification
- **JWT (JSON Web Tokens)**: For maintaining authenticated sessions

## Implementation Details

1. **Credential-based Authentication**:

   - Users can log in with email and password
   - Password hashing is handled with bcrypt
   - Form validation for authentication inputs

2. **Session Management**:

   - JWT tokens for maintaining authenticated state
   - Server-side session validation for protected routes
   - Configurable session expiration times

3. **Role-based Authorization**:

   - User roles (customer, admin)
   - Protected routes for admin functionality
   - Access control middleware

4. **Authentication Flow**:

   - Login form at login
   - Authentication API endpoints for verification
   - Redirect handling for protected resources

5. **User Registration**:
   - New user creation with validation
   - Password strength requirements
   - Email format verification

The authentication is integrated with the NextAuth configuration in `/app/api/auth/[...nextauth]/route.js` which handles the authentication providers, callbacks, and session management logic.
