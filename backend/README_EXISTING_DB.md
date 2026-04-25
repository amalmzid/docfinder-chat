# Heal-U Backend API - Existing Database Structure

This backend is configured to work with your existing database structure.

## Current Database Tables

### Users
- **`adminstrateur`** - Administrator users
  - Fields: `id_admin`, `nom`, `email`, `mot_de_passe`, `role`
- **`docteur`** - Doctor users  
  - Fields: `id_docteur`, `nom`, `email`, `mot_de_passe`, `role`, `specialite`
- **`patient`** - Patient users
  - Fields: `id_patient`, `nom`, `email`, `mot_de_passe`, `role`

### Medical Entities
- **`pharmacie`** - Pharmacy information
  - Fields: `id_pharmacie`, `nom`, `adresse`, `horaireOuverture`
- **`medicament`** - Medicine inventory
  - Fields: `id_medicament`, `nom`, `categorie`, `prix`, `disponibilite`
- **`rendez_vous`** - Appointments
  - Fields: `id_rdv`, `date_rdv`, `heure`, `statut`

### Other Tables
- **`consultation`** - Medical consultations
- **`historique_medical`** - Medical history

## API Endpoints Status

### ✅ Working with Existing Structure
- **Authentication**: `/api/users/login`, `/api/users/register`
- **Users Management**: `/api/users`
- **Doctors**: `/api/doctors` 
- **Pharmacies**: `/api/pharmacies`
- **Medicines**: `/api/medicines` 
- **Appointments**: `/api/appointments`

### ⚠️ Limited Functionality
- **Cabinets**: `/api/cabinets` - Returns empty (table doesn't exist)
- **User Role Updates**: Complex due to separate tables
- **User Updates/Delete**: Limited due to table structure

## Sample Login Credentials

From your existing data:

### Doctors
- **Dr. Jean Martin**: `jean.martin@email.com` / `password456`
- **Dr. Sophie Bernard**: `sophie.bernard@email.com` / `password789`
- **Dr. Pierre Laurent**: `pierre.laurent@email.com` / `password321`

### Patients
- Create new patients through registration or add manually to `patient` table

### Administrators  
- Add manually to `adminstrateur` table

## Frontend Integration Notes

The frontend will work with this structure, but some features are limited:

1. **Cabinet Management** - Not available (no cabinets table)
2. **Advanced User Management** - Limited due to separate user tables
3. **Role Assignment** - Manual database updates required

## Recommendations

To enable full functionality, consider adding:

```sql
-- Add missing fields to existing tables
ALTER TABLE patient ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE patient ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add cabinets table for doctor cabinet management
CREATE TABLE cabinets (
  id_cabinet int(11) NOT NULL AUTO_INCREMENT,
  id_docteur int(11) NOT NULL,
  nom_cabinet varchar(255) NOT NULL,
  adresse text NOT NULL,
  telephone varchar(50) DEFAULT NULL,
  horaire_travail varchar(255) NOT NULL DEFAULT '08:00 - 16:00',
  specialite varchar(255) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cabinet),
  FOREIGN KEY (id_docteur) REFERENCES docteur(id_docteur)
);
```

## Security Notes

- Passwords are currently stored as plain text in your database
- Consider implementing password hashing for production
- JWT tokens are used for authentication
- Role-based access control is implemented
