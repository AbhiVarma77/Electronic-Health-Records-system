import { z } from 'zod';

import { prisma } from '../db.js';
import { IdParamSchema, authenticateSchema } from '../utils/schema.js';

const vitalsSchema = {
  heartRate: z.number().int().optional().nullable(),
  bloodPressure: z
    .string()
    .regex(/^\d+\/\d+$/)
    .optional()
    .nullable(),
  temperature: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
};

const statusSchema = {
    registrationDone: z.date().optional().nullable(),
    vitalsDone: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      }, z.date()).optional().nullable(),
      tiragingDone: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      }, z.date()).optional().nullable(),
      consultationDocumentingDone: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      }, z.date()).optional().nullable(),
      medicinesCheckDone: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      }, z.date()).optional().nullable(),
      medicinesDispatchDone: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      }, z.date()).optional().nullable(),
      patientCouncellingDone: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      }, z.date()).optional().nullable(),
      sampleCollectionDone: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      }, z.date()).optional().nullable(),
      refreshmentsDone: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      }, z.date()).optional().nullable(),
    // vitalsDone: z.date().optional().nullable(),
    // tiragingDone: z.date().optional().nullable(),
    // consultationDocumentingDone: z.date().optional().nullable(),
    // medicinesCheckDone: z.date().optional().nullable(),
    // medicinesDispatchDone: z.date().optional().nullable(),
    // patientCouncellingDone: z.date().optional().nullable(),
    // sampleCollectionDone: z.date().optional().nullable(),
    // refreshmentsDone : z.date().optional().nullable(),
  };
  
const visitSchema = {
  staffId: z.number().int(),
  patientId: z.number().int(),
  medicalCampId: z.number().int(),
  specialities: z.array(z.number()).optional(),
  ...vitalsSchema,
  ...statusSchema,
};

const VisitCreateSchema = z.object(visitSchema);

export const VisitResponseSchema = z.object({
  id: z.number(),
  ...visitSchema,
  token: z.number(),
  patient: z
    .object({
      id: z.number(),
      name: z.string().min(3).max(255),
      phone: z.string().min(10).max(10),
      address: z.string().min(3).max(500),
      gender: z.enum(['Female', 'Male', 'Others', 'Unknown','Other']),
      notes: z.string().optional().nullable(),
      bookNumber: z.string(),
      dateOfBirth: z.date(),
      createdAt: z.date(),
    })
    .optional(),
  consultations: z
    .array(
      z.object({
        id: z.number(),
        specialityId: z.number(),
        visitId: z.number(),
      }),
    )
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
const updateSchema = {
    ...vitalsSchema,
    ...statusSchema,
  };
const VisitUpdateSchema = z.object(updateSchema).partial();

const tags = ['Visits'];

export async function visitRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create visit',
        tags,
        body: VisitCreateSchema,
        response: {
          201: VisitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const medicalCamp = await prisma.medicalCamp.findUnique({
        where: { id: request.body.medicalCampId },
      });

      const specialities = request.body.specialities;

      delete request.body.specialities;

      const [visit] = await prisma.$transaction([
        prisma.visit.create({
          data: {
            token: medicalCamp.token + 1,
            ...request.body,
          },
        }),
        prisma.medicalCamp.update({
          where: { id: request.body.medicalCampId },
          data: { token: medicalCamp.token + 1 },
        }),
      ]);

      if (specialities.length > 0) {
        const specalitiesData = specialities.map((speciality) => {
          return {
            specialityId: speciality,
            visitId: visit.id,
          };
        });

        await prisma.consultation.createMany({
          data: specalitiesData,
        });
      }

      reply.status(201).send(visit);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        summary: 'Get all visits',
        querystring: z.object({
          patientId: z.coerce.number().int().optional(),
          medicalCampId: z.coerce.number().int().optional(),
          token: z.coerce.number().int().optional(),
        }),
        tags,
        response: {
          200: z.array(VisitResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const { medicalCampId } = request.query;
      let visits = await prisma.visit.findMany({
        where: request.query,
        include: medicalCampId
          ? { patient: true, Consultation: true }
          : undefined,
      });

      visits = visits.map((visit) => {
        if (visit.Consultation) {
          const { Consultation, ...rest } = visit;
          return { ...rest, consultations: Consultation };
        }
        return visit;
      });

      reply.send(visits);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        summary: ' Get a visit',
        params: IdParamSchema,
        tags,
        response: {
          200: VisitResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const visit = await prisma.visit.findUnique({
        where: { id: Number(request.params.id) },
      });
      reply.send(visit);
    },
  );

  fastify.put(
    '/:id',
    {
      schema: {
        summary: 'Update a visit',
        params: IdParamSchema,
        tags,
        body: VisitUpdateSchema,
        response: {
          200: VisitResponseSchema,
        },
      },
    },
    async (request, _reply) => {
      const visit = await prisma.visit.update({
        where: { id: Number(request.params.id) },
        data: {...request.body},
      });
      return visit;
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete a visit',
        params: IdParamSchema,
        tags,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      await prisma.visit.delete({
        where: { id: Number(id) },
      });
      reply.status(204).send();
    },
  );
  fastify.get(
    '/byPatient/:id',
    {
      schema: {
        summary: ' Get a visit',
        params: IdParamSchema,
        tags,
        response: {
          200: VisitResponseSchema,
        },
      },
    },
    async (request, reply) => {
        const medicalCamps = await prisma.medicalCamp.findMany({
            where: {
                active: true, // Filter active medical camps
              },
            include: {
              medicalCampPlace: true,
            },
          });
          const activeId = medicalCamps[0].id;
      const visit = await prisma.visit.findMany({
        where: { patientId: Number(request.params.id), medicalCampId:activeId  },
      });
      console.log(visit);
      reply.send(visit[0]);
    },
  );
}
