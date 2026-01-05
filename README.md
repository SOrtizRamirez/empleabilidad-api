# Employability Job Vacancies Platform – Backend API

## Coder
Sharon R. Ortiz Ramírez

## Overview
This project is a RESTful API built with **Node.js and NestJS** as part of an employability technical assessment.  
Its goal is to centralize job vacancies and allow coders to apply autonomously, enforcing authentication, authorization, and strict business rules.

The API is designed following **Clean Code**, **SOLID principles**, and **modular NestJS architecture**.

## Tech Stack
- Node.js
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- API Key protection
- Swagger (OpenAPI)
- Jest (unit testing)

## Architecture & Modules
The application is structured in a modular way using the NestJS CLI:

```bash
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── guards/
├── users/
├── vacancies/
├── applications/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── enums/
├── app.module.ts
└── main.ts
```

## Roles and Access Control
The system supports three roles:

- **Administrator**
  - Full access to all endpoints.

- **Manager**
  - Create, update, activate, and deactivate vacancies.
  - Define and update applicant quotas.
  - View applications.

- **Coder**
  - Register and authenticate.
  - View available vacancies.
  - Apply to vacancies with available quota.

The default role on registration is **coder**.  
The **administrator** and **manager** roles are created and assigned **only via seeders**.

## Authentication & Security
- JWT-based authentication.
- API Key required on protected endpoints.
- Custom Guards for:
  - JWT validation
  - API Key validation
  - Role-based authorization

### Required Headers
```bash
Authorization: Bearer <JWT>
```

## Business Rules
- A coder cannot apply twice to the same vacancy.
- Applications are blocked when the vacancy quota is full.
- A coder cannot apply to more than **three active vacancies**.
- Only authenticated users can apply.
- Coders cannot create, update, or manage vacancies.

## Entities
### User
- id
- name
- email
- password
- role

### Vacancy
- id
- title
- description
- technologies
- seniority
- location
- status
- created by
- salaryMin
- salaryMax
- company
- applications


### Application
- id
- userId
- vacancyId
- appliedAt

## Validation & DTOs
- DTOs implemented using `class-validator` and `class-transformer`.
- Custom Pipes used for validation and transformation.
- Invalid requests return meaningful HTTP errors.

## Global Response Interceptor
All API responses are standardized using a global interceptor:

```bash
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

## API Documentation (Swagger)
Swagger is available at:
```bash
http://localhost:3000/docs
```


## FRONTEND (Basic Client)
A basic frontend was initialized using a CLI tool to consume the backend API and validate the main application flows.

```bash
cd client
npx serve -l 5173
http://localhost:5173/pages/login.html
```


It includes examples for:
- User registration
- Login
- Vacancy creation
- Vacancy application
- Required headers

## Installation & Execution

### Prerequisites
- Node.js v18+
- PostgreSQL
- npm

### Steps
1. Clone the repository
```bash
git clone https://github.com/SOrtizRamirez/empleabilidad-api
cd empleabilidad-api
```

2. Install dependencies
```bash
npm install
```

3. Environment configuration  
Create a `.env` file using `.env.example`.

4. Run seeders (roles)
```bash
npm run seed
```

5. Start the application
```bash
npm run start:dev
```

Application runs at:
```bash
http://localhost:3000
```

## Unit Testing
Unit tests are implemented using **Jest**.

Covered scenarios:
- Vacancy creation logic.
- Vacancy application rules.

Run tests with:
```
npm run test
```

Minimum suggested coverage: **40%**.

## Database Setup (PostgreSQL)

This project uses PostgreSQL + TypeORM migrations.
The database schema is created from scratch using migrations, and initial system users are created using seeders.

## Important:
The application does not use synchronize: true.
All schema changes are managed via migrations to ensure consistency and reproducibility.

## First-time Setup (Clean Database)

If you are running the project for the first time or want a clean database:
1. Reset the schema (development only)
```bash
psql -h localhost -U <DB_USER> -d <DB_NAME> -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```
2. Run migrations
```bash
npm run migration:run
```
3. Run seeders
```bash
npm run seed
```
4. Run the Application
```bash
npm run start:dev
```

### Notes for Evaluators

The database schema is managed entirely via TypeORM migrations

The project is designed to be reproducible:

- Clone repository

- Configure .env

- Run migrations

- Run seeders

No manual database changes are required
## Deliverables Included
- REST API (NestJS)
- PostgreSQL persistence with TypeORM
- JWT + API Key security
- Role-based access control
- Global response interceptor
- Swagger documentation
- Unit tests
- `.env.example`
- Seeders for administrator and manager roles
- Basic frontend (HTML/CSS) consuming the API

## Notes
This project focuses on backend architecture, security, and business rules rather than UI complexity.  
It is intended as a solid foundation for an employability tracking platform.