import { z } from 'zod';

import { prisma } from '../db.js';
import { IdParamSchema, authenticateSchema } from '../utils/schema.js';

const medicineSchema = {
  name: z.string(),
  description: z.string().optional(),
};

const MedicineCreateSchema = z.object(medicineSchema);

const MedicineResponseSchema = z.object({
  id: z.number(),
  ...medicineSchema,
});

const MedicineUpdateSchema = z.object(medicineSchema).partial();

const tags = ['Medicine'];

export async function medicineRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create medicine',
        tags,
        body: MedicineCreateSchema,
        response: {
          201: MedicineResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const medicine = await prisma.medicine.create({
        data: request.body,
      });
      reply.status(201).send(medicine);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        summary: ' Get all medicines',
        tags,
        response: {
          200: z.array(MedicineResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const medicines = await prisma.medicine.findMany();
      reply.send(medicines);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        summary: ' Get a medicine',
        params: IdParamSchema,
        tags,
        response: {
          200: MedicineResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const medicine = await prisma.medicine.findUnique({
        where: { id: Number(request.params.id) },
      });
      reply.send(medicine);
    },
  );

  fastify.put(
    '/:id',
    {
      schema: {
        summary: 'Update a medicine',
        params: IdParamSchema,
        tags,
        body: MedicineUpdateSchema,
        response: {
          200: MedicineResponseSchema,
        },
      },
    },
    async (request, _reply) => {
      const medicine = await prisma.medicine.update({
        where: { id: Number(request.params.id) },
        data: request.body,
      });
      return medicine;
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete a medicine',
        params: IdParamSchema,
        tags,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      await prisma.medicine.delete({
        where: { id: Number(id) },
      });
      reply.status(204).send();
    },
  );
}
