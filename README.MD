--Project Name: Vehicle Rental System

--Live Deployment Link: https://vehicle-rental-system-h93h.onrender.com/

--Project Overview:
        A comprehensive backend API for managing a vehicle rental business. The system handles vehicle inventory, customer management, booking reservations, and secure role-based access control.

-Features:
        i. Authentication & Authorization
        ii. User registration and login with JWT tokens
        iii. Role-based access control (Admin/Customer)
        iv. Password hashing with bcrypt
        v. Secure endpoints with token validation

-Vehicle Management:
        i. Add, view, update, and delete vehicles
        ii. Vehicle availability tracking
        iii. Vehicle categorization (Car, Bike, Van, SUV)
        iv. Daily rental price management

-User Management:
        i. Customer profile management
        ii. Admin user management
        iii. Role assignment and updates
        iv. User deletion with booking constraints

-Booking System:
        i. Create vehicle reservations
        ii. Automatic price calculation (daily rate × duration)
        iii. Booking status management (Active, Cancelled, Returned)
        iv. Vehicle availability auto-updates
        v. Overdue booking auto-return system

-Business Logic:
        i. Prevents double-booking of vehicles
        ii. Validates booking dates
        iii. Prevents deletion of users/vehicles with active bookings
        iv. Role-specific permissions enforcement

-Technology Stack:
    Backend:
        i. Runtime: Node.js
        ii. Language: TypeScript
        iii. Framework: Express.js
        iv. Database: PostgreSQL
        v. Database Management Tool: pgAdmin4

-Security:
        i. Authentication: JWT (JSON Web Tokens)
        ii. Password Hashing: bcrypt
        iii. CORS: Enabled for cross-origin requests
        iv. Input Validation: Custom middleware

-Development Tools:
        i. Package Manager: npm
        ii. Development Server: ts-node-dev
        iii. Type Checking: TypeScript