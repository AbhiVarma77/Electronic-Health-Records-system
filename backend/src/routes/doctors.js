import { z } from 'zod';

import { prisma } from '../db.js';
import { IdParamSchema, authenticateSchema } from '../utils/schema.js';

const doctorCoreSchema = {
  name: z.string().min(3).max(255),
  phone: z.string(),//.min(10).max(10),
  address: z.string().min(3).max(500),
  hospital: z.string().min(3).max(255),
  specialityId: z.number(),
};

const DoctorCreateSchema = z.object(doctorCoreSchema);

const DoctorResponseSchema = z.object({
  id: z.number(),
  ...doctorCoreSchema,
});

const DoctorUpdateSchema = z.object(doctorCoreSchema).partial();

const tags = ['Doctors'];

export async function doctorRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create a doctor',
        tags,
        body: DoctorCreateSchema,
        response: {
          201: DoctorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const doctor = await prisma.doctor.create({
        data: request.body,
      });
      reply.status(201).send(doctor);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        summary: 'Get all doctors',
        tags,
        response: {
          200: z.array(DoctorResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const doctors = await prisma.doctor.findMany();
      reply.send(doctors);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        summary: 'Get a doctor',
        params: IdParamSchema,
        tags,
        response: {
          200: DoctorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const doctor = await prisma.doctor.findUnique({
        where: { id: Number(request.params.id) },
      });
      reply.send(doctor);
    },
  );

  fastify.put(
    '/:id',
    {
      schema: {
        summary: 'Update a doctor',
        params: IdParamSchema,
        tags,
        body: DoctorUpdateSchema,
      },
    },
    async (request, reply) => {
      const doctor = await prisma.doctor.update({
        where: { id: Number(request.params.id) },
        data: request.body,
      });
      reply.send(doctor);
    },
  );
  fastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete a doctor',
        params: IdParamSchema,
        tags,
      },
    },
    async (request, reply) => {
      await prisma.doctor.delete({
        where: { id: Number(request.params.id) },
      });
      reply.status(204).send();
    },
  );
}
