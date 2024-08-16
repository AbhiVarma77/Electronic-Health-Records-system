import { z } from 'zod';

import { prisma } from '../db.js';
import { IdParamSchema, authenticateSchema } from '../utils/schema.js';

const specialityCoreSchema = {
  name: z.string().min(3).max(255),
};

const SpecialityCreateSchema = z.object(specialityCoreSchema);

const SpecialityResponseSchema = z.object({
  id: z.number(),
  ...specialityCoreSchema,
});

const SpecialityUpdateSchema = z.object(specialityCoreSchema).partial();

const tags = ['Specialities'];

export async function specialityRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create a speciality',
        tags,
        body: SpecialityCreateSchema,
        response: {
          201: SpecialityResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const speciality = await prisma.speciality.create({
        data: request.body,
      });
      reply.status(201).send(speciality);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        summary: 'Get all specialities',
        tags,
        response: {
          200: z.array(SpecialityResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const specialities = await prisma.speciality.findMany({
        orderBy: {
          id: 'asc',
        },
      });
      reply.send(specialities);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        summary: 'Get a speciality',
        params: IdParamSchema,
        tags,
        response: {
          200: SpecialityResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const speciality = await prisma.speciality.findUnique({
        where: { id: Number(request.params.id) },
      });
      reply.send(speciality);
    },
  );

  fastify.put(
    '/:id',
    {
      schema: {
        summary: 'Update a speciality',
        params: IdParamSchema,
        tags,
        body: SpecialityUpdateSchema,
      },
    },
    async (request, reply) => {
      const speciality = await prisma.speciality.update({
        where: { id: Number(request.params.id) },
        data: request.body,
      });
      reply.send(speciality);
    },
  );
  fastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete a speciality',
        params: IdParamSchema,
        tags,
      },
    },
    async (request, reply) => {
      await prisma.speciality.delete({
        where: { id: Number(request.params.id) },
      });
      reply.status(204).send();
    },
  );
}
