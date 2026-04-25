# Heal-U Backend API

A comprehensive PHP backend API for the Heal-U healthcare management system supporting 4 user roles: Administrator, Doctor, Pharmacist, and Patient.

## Features

- **User Authentication & Authorization** with JWT tokens
- **Role-based Access Control** for all endpoints
- **CRUD Operations** for all entities
- **RESTful API** design
- **MySQL Database** integration
- **CORS Support** for frontend integration

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration

### Users Management (Administrator only)
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PUT /api/users/{id}/role` - Update user role

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors?id={id}` - Get doctor by ID
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors?id={id}` - Update doctor
- `DELETE /api/doctors?id={id}` - Delete doctor

### Pharmacies
- `GET /api/pharmacies` - Get all pharmacies
- `GET /api/pharmacies?id={id}` - Get pharmacy by ID
- `POST /api/pharmacies` - Create pharmacy
- `PUT /api/pharmacies?id={id}` - Update pharmacy
- `DELETE /api/pharmacies?id={id}` - Delete pharmacy

### Cabinets (Doctor Management)
- `GET /api/cabinets` - Get all cabinets
- `GET /api/cabinets?id={id}` - Get cabinet by ID
- `GET /api/cabinets?doctor={id}` - Get cabinets by doctor
- `POST /api/cabinets` - Create cabinet
- `PUT /api/cabinets?id={id}` - Update cabinet
- `DELETE /api/cabinets?id={id}` - Delete cabinet

### Medicines (Pharmacist Management)
- `GET /api/medicines` - Get all medicines
- `GET /api/medicines?id={id}` - Get medicine by ID
- `GET /api/medicines?pharmacy={id}` - Get medicines by pharmacy
- `GET /api/medicines?search={term}` - Search medicines
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines?id={id}` - Update medicine
- `DELETE /api/medicines?id={id}` - Delete medicine

### Appointments
- `GET /api/appointments` - Get all appointments (filtered by user role)
- `GET /api/appointments?id={id}` - Get appointment by ID
- `GET /api/appointments?patient={id}` - Get appointments by patient
- `GET /api/appointments?doctor={id}` - Get appointments by doctor
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments?id={id}` - Update appointment
- `DELETE /api/appointments?id={id}` - Delete appointment

## Database Setup

1. Create MySQL database named `heal-u`
2. Import the schema from `database/schema.sql`
3. Update database credentials in `config/database.php`

## User Roles & Permissions

### Administrator
- Manage all users (CRUD operations)
- Assign user roles
- View all system data

### Doctor
- Manage medical cabinets
- Set schedules and addresses
- View and manage appointments
- Create consultations

### Pharmacist
- Manage pharmacies
- Add/edit medicines and inventory
- Update stock levels
- Set operating hours

### Patient
- Search doctors and pharmacies
- Book appointments
- View medication availability
- Access consultations

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {jwt_token}
```

## Sample Data

The database schema includes sample data for testing:
- 1 Administrator account
- 3 Doctors with different specialties
- 2 Pharmacists
- 3 Patients
- 3 Pharmacies
- 5 Medicines
- 3 Medical Cabinets

Default password for all sample accounts: `password`

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

With appropriate HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 405: Method Not Allowed
- 500: Internal Server Error

## Security Features

- Password hashing with PHP's `password_hash()`
- JWT token authentication
- Role-based access control
- SQL injection prevention with prepared statements
- CORS configuration
- Input validation and sanitization

## Development Setup

1. Ensure PHP 7.4+ and MySQL 5.7+ are installed
2. Configure Apache/Nginx to point to the backend directory
3. Set up the database with the provided schema
4. Update database credentials in `config/database.php`
5. Ensure the `uploads` directory is writable (for file uploads if needed)

## Testing

Use tools like Postman or curl to test the API endpoints. The frontend React application is configured to work with these endpoints out of the box.
