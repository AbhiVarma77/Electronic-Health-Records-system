import { z } from 'zod';

import { prisma } from '../db.js';
import {
  IdParamSchema,
  HeadersSchema,
  authenticateSchema,
} from '../utils/schema.js';

const medicalCampPlaceCoreSchema = {
  name: z.string().min(3).max(50),
  address: z.string().min(10).max(50),
  shortName: z.string().min(4).max(4),
};

const MedicalCampPlaceCreateSchema = z.object(medicalCampPlaceCoreSchema);
const MedicalCampPlaceUpdateSchema = z
  .object(medicalCampPlaceCoreSchema)
  .partial();

const MedicalCampPlaceResponseSchema = z.object({
  id: z.number(),
  ...medicalCampPlaceCoreSchema,
});

const tags = ['Medical Camp Place'];

export async function medicalCampPlaceRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create a new medical camp place',
        tags,
        headers: HeadersSchema,
        body: MedicalCampPlaceCreateSchema,
        response: { 201: MedicalCampPlaceResponseSchema },
      },
    },
    async (request, reply) => {
      const { name, address, shortName } = request.body;
      const medicalCampPlace = await prisma.medicalCampPlace.create({
        data: {
          name,
          address,
          shortName,
        },
      });
      reply.status(201);
      reply.send(medicalCampPlace);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        summary: 'Fetch medical camp places',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        response: { 200: MedicalCampPlaceResponseSchema },
      },
    },
    async (request, reply) => {
      const medicalCampPlace = await prisma.medicalCampPlace.findUnique({
        where: { id: Number(request.params.id) },
      });

      reply.send(medicalCampPlace);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        summary: 'Fetch all the medical camp places',
        tags,
        headers: HeadersSchema,
        response: { 200: z.array(MedicalCampPlaceResponseSchema) },
      },
    },
    async (request, reply) => {
      const medicalCampPlaces = await prisma.medicalCampPlace.findMany();
      reply.send(medicalCampPlaces);
    },
  );

  fastify.put(
    '/:id',
    {
      schema: {
        summary: 'Update a Medical Camp place',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        body: MedicalCampPlaceUpdateSchema,
      },
    },
    async (request, reply) => {
      const medicalCampPlace = await prisma.medicalCampPlace.update({
        where: { id: Number(request.params.id) },
        data: request.body,
      });
      reply.send(medicalCampPlace);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete a medical camp place',
        params: IdParamSchema,
        headers: HeadersSchema,
        tags,
      },
    },
    async (request, reply) => {
      await prisma.medicalCampPlace.delete({
        where: { id: Number(request.params.id) },
      });
      reply.status(204).send();
    },
  );
}
