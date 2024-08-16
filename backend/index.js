import fs from 'node:fs';

import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import fastifyJwt from '@fastify/jwt';

import { staffRoutes } from './src/routes/staff.js';
import { specialityRoutes } from './src/routes/speciality.js';
import { medicalCampPlaceRoutes } from './src/routes/medicalCampPlace.js';
import { medicalCampRoutes } from './src/routes/medicalCamps.js';
import { doctorRoutes } from './src/routes/doctors.js';
import { patientRoutes } from './src/routes/patient.js';
import { medicineRoutes } from './src/routes/medicines.js';
import { testPrescriptionRoutes } from './src/routes/testPrescriptions.js';
import { testRoutes } from './src/routes/testRoutes.js';
import { visitRoutes } from './src/routes/visits.js';
import { consultationRoutes } from './src/routes/consultations.js';
import { prescriptionRoutes } from './src/routes/prescriptions.js';
import {analyticsRoutes} from './src/routes/analytics.js';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
    },
  },
});

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET });

fastify.register(cors, {});

fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send(err);
  }
});

fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'EHRS API',
      description: 'EHRS API Documentation',
      version: '0.1.0',
    },
  },
  transform: jsonSchemaTransform,
});

fastify.register(fastifySwaggerUI, {
  routePrefix: '/docs',
});

fastify.get('/docs/api', (req, reply) => {
  const file = fs.createReadStream('./docs.html');
  reply.send(file);
});

fastify.after(() => {
  fastify.register(staffRoutes, { prefix: '/staff' });
  fastify.register(medicalCampPlaceRoutes, { prefix: '/medicalCampPlaces' });
  fastify.register(medicalCampRoutes, { prefix: '/medicalCamps' });
  fastify.register(doctorRoutes, { prefix: '/doctors' });
  fastify.register(patientRoutes, { prefix: '/patients' });
  fastify.register(medicineRoutes, { prefix: '/medicines' });
  fastify.register(testPrescriptionRoutes, { prefix: '/testPrescriptions' });
  fastify.register(testRoutes, { prefix: '/tests' });
  fastify.register(visitRoutes, { prefix: '/visits' });
  fastify.register(consultationRoutes, { prefix: '/consultations' });
  fastify.register(prescriptionRoutes, { prefix: '/prescriptions' });
  fastify.register(specialityRoutes, { prefix: '/specialities' });
  fastify.register(analyticsRoutes, { prefix: '/analytics' });
});

fastify.listen(
  { port: process.env.PORT || 3000, host: process.env.HOST || '0.0.0.0' },
  function (err, address) {
    if (err) {
      console.log(address);
      fastify.log.error(err);
      process.exit(1);
    }
    // Server is now listening on ${address}
  },
);
