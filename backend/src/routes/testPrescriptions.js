import { z } from 'zod';

import { prisma } from '../db.js';
import {
  HeadersSchema,
  IdParamSchema,
  authenticateSchema,
} from '../utils/schema.js';

const testPrescriptionCoreSchema = {
  sampleStatus: z.boolean(),
  reportStatus: z.boolean(),
};

const TestPrescriptionCreateSchema = z.object({
  consultationId: z.number(),
  testId: z.number(),
  ...testPrescriptionCoreSchema,
});

const TestPrescriptionResponseSchema = z.object({
  id: z.number().int(),
  ...testPrescriptionCoreSchema,
});

const TestPrescriptionUpdateSchema = z
  .object(testPrescriptionCoreSchema)
  .partial();

const tags = ['Test Prescriptions'];

export async function testPrescriptionRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create a test prescription',
        tags,
        headers: HeadersSchema,
        body: TestPrescriptionCreateSchema,
        response: {
          201: TestPrescriptionResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // TODO  : add other Ids
      const testPrescription = await prisma.testPrescription.create({
        data: request.body,
      });
      reply.status(201).send(testPrescription);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        summary: 'Get all test prescriptions',
        tags,
        headers: HeadersSchema,
        response: {
          200: z.array(TestPrescriptionResponseSchema),
        },
      },
    },
    async (_req, reply) => {
      const testPrescriptions = await prisma.testPrescription.findMany();
      reply.status(200).send(testPrescriptions);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        summary: 'Get a test prescription',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        response: {
          200: TestPrescriptionResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const testPrescription = await prisma.testPrescription.findUnique({
        where: { id: Number(id) },
      });
      reply.status(200).send(testPrescription);
    },
  );

  fastify.put(
    '/:id',
    {
      schema: {
        summary: 'Update a test',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        body: TestPrescriptionUpdateSchema,
        response: {
          200: TestPrescriptionResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const testPrescription = await prisma.testPrescription.findUnique({
        where: { id: Number(id) },
      });
      reply.status(200).send(testPrescription);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete a test prescription',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        response: {
          200: TestPrescriptionResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const testPrescription = await prisma.testPrescription.delete({
        where: { id: Number(id) },
      });
      reply.status(200).send(testPrescription);
    },
  );
}
