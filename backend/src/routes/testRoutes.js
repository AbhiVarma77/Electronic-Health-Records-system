import { z } from 'zod';

import { prisma } from '../db.js';
import {
  HeadersSchema,
  IdParamSchema,
  authenticateSchema,
} from '../utils/schema.js';

const testCoreSchema = {
  name: z.string().min(3).max(100),
  description: z.string().max(800).optional(),
};

const TestCreateSchema = z.object(testCoreSchema);

const TestResponseSchema = z.object({
  id: z.number(),
  ...testCoreSchema,
});

const TestUpdateSchema = z.object(testCoreSchema).partial();

const tags = ['Tests'];

export async function testRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create a test',
        tags,
        headers: HeadersSchema,
        body: TestCreateSchema,
        response: {
          201: TestResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // TODO  : add testPrescription Id
      const test = await prisma.test.create({ data: request.body });
      reply.status(201).send(test);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        summary: 'Get all tests',
        tags,
        headers: HeadersSchema,
        response: {
          200: z.array(TestResponseSchema),
        },
      },
    },
    async (_req, reply) => {
      const tests = await prisma.test.findMany();
      reply.status(200).send(tests);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        summary: 'Get a test',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        response: {
          200: TestResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const test = await prisma.test.findUnique({ where: { id: Number(id) } });
      reply.status(200).send(test);
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
        body: TestUpdateSchema,
        response: {
          200: TestResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const test = await prisma.test.update({
        where: { id: Number(id) },
        data: req.body,
      });
      reply.status(200).send(test);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete a test',
        tags,
        params: IdParamSchema,
        headers: HeadersSchema,
        response: {
          200: TestResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      const test = await prisma.test.delete({
        where: { id: Number(id) },
      });
      reply.status(200).send(test);
    },
  );
}
