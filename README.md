# FSMI Electronic Health Record System

EHRS project is an Swecha initiative to simplify the processes of the medical camps Swecha conducts throughout the year. We will be using/extending [Bahmni](https://github.com/Bahmni/) as part of this project.

The problems we aim to solve through this project

- Observe patient health over time
- Solve book keeping problem for the patient
- Solve token management
- Track missing visits & follow ups
- Map people & locality
- Send alerts for follow up visits
- Attach test results pdf to patient's health record
- Record patient feedback
- Add checks in system to reduce data mismatch between patients
- Medicine Inventory Management

## Technology

We are using JavaScript as the programming language for this project and PostgreSQL is the database.

### Frontend

- React
- Tailwind
- Vite

### Backend

- Node.js
- Fastify
- Prisma

### Database

PostgreSQL. Prisma manages all migrations

```
cd existing_repo
git remote add origin https://code.swecha.org/healthcare/EHRS.git
git branch -M main
git push -uf origin main
```

### Deployment

Run `./deploy.sh`. It will start a pm2 process
