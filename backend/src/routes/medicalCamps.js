import { z } from 'zod';

import { prisma } from '../db.js';
import {
  IdParamSchema,
  HeadersSchema,
  authenticateSchema,
} from '../utils/schema.js';

const medicalCampCoreSchema = {
  date: z.string().datetime(),
  active: z.boolean(),
};

const MedicalCampSchema = {
  medicalCampPlaceId: z.number(),
  ...medicalCampCoreSchema,
};

const MedicalCampCreateSchema = z.object(MedicalCampSchema);
const MedicalCampUpdateSchema = z.object(medicalCampCoreSchema).partial();
const MedicalCampResponseSchema = z.object({
  id: z.number(),
  ...medicalCampCoreSchema,
  token: z.number(),
  date: z.date(),
  medicalCampPlace: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
});

const tags = ['Medical Camps'];

export async function medicalCampRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create a medical camp',
        tags,
        body: MedicalCampCreateSchema,
        response: { 201: MedicalCampResponseSchema },
      },
    },
    async (request, reply) => {
      const { date, active, medicalCampPlaceId } = request.body;
      const medicalCamp = await prisma.medicalCamp.create({
        data: {
          date,
          active,
          medicalCampPlaceId,
        },
      });
      reply.status(201).send(medicalCamp);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        summary: 'Fetch medical camp',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        response: { 200: MedicalCampResponseSchema },
      },
    },
    async (request, reply) => {
      const medicalCamp = await prisma.medicalCamp.findUnique({
        where: { id: Number(request.params.id) },
      });

      reply.send(medicalCamp);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        summary: 'Fetch all the medical camps',
        tags,
        headers: HeadersSchema,
        response: { 200: z.array(MedicalCampResponseSchema) },
      },
    },
    async (request, reply) => {
      const medicalCamps = await prisma.medicalCamp.findMany({
        include: {
          medicalCampPlace: true,
        },
      });
      reply.send(medicalCamps);
    },
  );

  fastify.put(
    '/:id',
    {
      schema: {
        summary: 'Update a Medical Camp',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        body: MedicalCampUpdateSchema,
      },
    },
    async (request, reply) => {
      const medicalCamp = await prisma.medicalCamp.update({
        where: { id: Number(request.params.id) },
        data: request.body,
      });
      reply.send(medicalCamp);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete a medical camp',
        params: IdParamSchema,
        headers: HeadersSchema,
        tags,
      },
    },
    async (request, reply) => {
      await prisma.medicalCamp.delete({
        where: { id: Number(request.params.id) },
      });
      reply.status(204).send();
    },
  );
}
