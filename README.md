# E-commerce Backend API

This is a full-featured, production-ready backend for an e-commerce platform, built with Node.js, Express, and MongoDB. It includes a complete, automated workflow from user authentication to payment processing and shipment booking.

## Features

- **Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for products.
- **Secure User Authentication:** User registration and login system using JSON Web Tokens (JWT) for secure, session-based authentication. Passwords are encrypted using `bcryptjs`.
- **Role-Based Access Control:** Distinction between regular users and administrators, with protected routes for admin-only functionality.
- **Shopping Cart:** Users can add, view, and remove items from their personal shopping cart.
- **Payment Integration:** Integrated with **Razorpay** for secure payment processing in India.
- **Automated Shipping:** Integrated with **Shiprocket** to automatically book shipments and generate tracking information upon successful payment.

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **Payment Gateway:** Razorpay
- **Shipping Aggregator:** Shiprocket
- **API Testing:** Postman

## Project Setup

To get this project running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd ecommerce-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a `.env` file in the root of the project and add the following environment variables.

    ```env
    # Server Port
    PORT=5001

    # MongoDB
    MONGO_URI=your_mongodb_connection_string

    # JSON Web Token
    JWT_SECRET=your_super_secret_jwt_key

    # Razorpay API Keys (Test Mode)
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret

    # Shiprocket API Credentials
    SHIPROCKET_EMAIL=your_shiprocket_api_email
    SHIPROCKET_PASSWORD=your_shiprocket_api_password
    SHIPROCKET_PICKUP_LOCATION=YourShiprocketPickupNickname
    ```

4.  **Run the server:**
    ```bash
    npm run dev
    ```
    The server will start on the port specified in your `.env` file (e.g., `http://localhost:5001`).

## API Endpoints

All endpoints are prefixed with `/api`.

### Products

- `GET /products`: Get a list of all products.
- `GET /products/:id`: Get a single product by its ID.
- `POST /products`: Create a new product (Admin only).

### Users & Authentication

- `POST /users`: Register a new user.
- `POST /users/login`: Log in a user and get a JWT.

### Shopping Cart (Protected)

- `GET /cart`: Get the items in the logged-in user's cart.
- `POST /cart`: Add an item to the cart.
- `DELETE /cart/:productId`: Remove an item from the cart.

### Orders & Payments (Protected)

- `POST /orders`: Create a new order from the user's cart and generate a Razorpay order.
- `POST /orders/verify-payment`: Verify a successful Razorpay payment and automatically trigger shipment booking with Shiprocket.
