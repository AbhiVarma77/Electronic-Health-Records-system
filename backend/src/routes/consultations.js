import { z } from 'zod';

import { prisma } from '../db.js';
import { IdParamSchema, authenticateSchema } from '../utils/schema.js';

const consultationCoreSchema = {
  observations: z.string().optional().nullable(),
  symptoms: z.string().optional().nullable(),
};

const ConsultationCreateSchema = z.object({
  specialityId: z.number(),
  visitId: z.number(),
  doctorId: z.number().optional().nullable(),
  ...consultationCoreSchema,
});

const ConsultationUpdateSchema = z.object(consultationCoreSchema);

const ConsultationSchema = z.object({
  id: z.number(),
  doctorId: z.number().optional().nullable(),
  visitId: z.number(),
  ...consultationCoreSchema,
});

const tags = ['Consultations'];

export async function consultationRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        tags,
        summary: 'Create a consultation',
        body: ConsultationCreateSchema,
        response: {
          201: ConsultationSchema,
        },
      },
    },
    async (request, reply) => {
      const consultation = await prisma.consultation.upsert({
        where: {
          visitId_specialityId: {
            visitId: request.body.visitId,
            specialityId: request.body.specialityId,
          },
        }, // Specify the unique identifier for the consultation (e.g., id)
        update: request.body, // Update the consultation data if it already exists
        create: request.body, // Create a new consultation if it doesn't exist
      });
      const currentTime = new Date().toISOString();

      const vist = await prisma.visit.update({
        where :{id:request.body.visitId},
        data:{consultationDocumentingDone:currentTime}
      });
      reply.status(201).send(consultation);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        tags,
        summary: 'Get all consultations',
        response: {
          200: z.array(ConsultationSchema),
        },
      },
    },
    async (request, reply) => {
      const consultations = await prisma.consultation.findMany();
      reply.send(consultations);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        tags,
        summary: 'Get a consultation',
        params: IdParamSchema,
        response: {
          200: ConsultationSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const consultation = await prisma.consultation.findUnique({
        where: { id: Number(id) },
      });
      reply.send(consultation);
    },
  );

  fastify.put(
    '/:id',
    {
      schema: {
        tags,
        summary: 'Update a consultation',
        params: IdParamSchema,
        body: ConsultationUpdateSchema,
        response: {
          200: ConsultationSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const consultation = await prisma.consultation.update({
        where: { id: Number(id) },
        data: request.body,
      });
      reply.send(consultation);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        tags,
        summary: 'Delete a consultation',
        params: IdParamSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      await prisma.consultation.delete({
        where: { id: Number(id) },
      });
      reply.status(204).send();
    },
  );
}
