import { z } from 'zod';

import { prisma } from '../db.js';
import { IdParamSchema, authenticateSchema } from '../utils/schema.js';
import { VisitResponseSchema } from './visits.js';

const patientCoreSchema = {
  name: z.string().min(3).max(255),
  phone: z.string().min(10).max(10),
  address: z.string().min(3).max(500),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['Female', 'Male', 'Others', 'Unknown','Other']),
  notes: z.string().optional().nullable(),
};

const PatientCreateSchema = z.object({
  ...patientCoreSchema,
  bookNumber: z.string(),
  qrId: z.string().optional(),
});

const PatientResponseSchema = z.object({
  id: z.number(),
  ...patientCoreSchema,
  bookNumber: z.string(),
  dateOfBirth: z.date(),
  visits: z.array(VisitResponseSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const PatientUpdateSchema = z.object(patientCoreSchema).partial();

const tags = ['Patients'];

export async function patientRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        summary: 'Create a patient',
        tags,
        body: PatientCreateSchema,
        response: {
          201: PatientResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // TODO: bookNumber should be inferred from medical camp place

      const { bookNumber, phone, name } = request.body;

      const bnUnique = await prisma.patient.findUnique({
        where: {
          bookNumber: bookNumber,
        },
      });

      const npUnique = await prisma.patient.findUnique({
        where: {
          name_phone: {
            phone,
            name,
          },
        },
      });

      if (bnUnique) {
        reply.status(500).send({
          message: 'Patient is already registered with this Book Number',
        });
        return;
      }

      if (npUnique) {
        reply.status(500).send({
          message:
            'Patient is already registered with this Name & Phone Number',
        });
        return;
      }

      // TODO request body needs medical camp place id as well
      const patient = await prisma.patient.create({
        data: request.body,
      });
      reply.status(201).send(patient);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        summary: 'Get all patients',
        tags,
        querystring: z.object({
          q: z.string().optional(),
          visits: z.string().optional(),
        }),
        response: {
          200: z.array(PatientResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const { q, visits } = request.query;

      let where = {};
      if (q?.length === 10) {
        where = { phone: q };
      } else {
        where = { bookNumber: q };
      }

      const patients = await prisma.patient.findMany({
        where,
        include: visits ? { Visit: true } : undefined,
      });

      const processedPatients = patients.map((patient) => {
        const visits = patient.Visit;
        delete patient.Visit;
        return {
          ...patient,
          visits: visits,
        };
      });

      reply.send(processedPatients);
    },
  );

  fastify.get(
    '/qr/:id',
    {
      schema: {
        summary: 'Get a patient by QR id',
        tags,
        params: z.object({
          id: z.string(),
        })
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      const patient = await prisma.patient.findUnique({
        where: {
          qrId: id,
        }
      })
      reply.send(patient)
    }
  )

  fastify.patch('/:id/qr-id', {
    schema: {
      summary: 'Set QR Id for an existing patient',
      tags,
      params: IdParamSchema,
      body: z.object({
        qrId: z.string(),
      })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const patient = await prisma.patient.findUnique({
      where: { id: Number(id) }
    });

    if (patient.qrId) {
      reply.status(500).send({
        message: "User is assigned a QR code already"
      });
      return;
    }

    await prisma.patient.update({
      data: {
        qrId: request.body.qrId,
      },
      where: {
        id: Number(id),
      }
    })
    reply.send({
      ok: true,
    });
  });

  fastify.get('/book/:id',
    {
      schema: {
        summary: 'Get a patient by book number',
        tags,
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: PatientResponseSchema,
        }
      }
    }, async (request, reply) => {
      const { id } = request.params;
      const patient = await prisma.patient.findUnique({
        where: {
          bookNumber: id,
        }
      })

      if (!patient) {
        reply.status(404).send({
          message: "Patient not found"
        })
        return;
      }
      reply.send(patient);
    }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        summary: 'Get a patient',
        tags,
        params: IdParamSchema,
        response: {
          200: PatientResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const patient = await prisma.patient.findUnique({
        where: { id: Number(id) },
      });
      reply.send(patient);
    },
  );

  fastify.put(
    '/:id',
    {
      schema: {
        summary: 'Update a patient',
        tags,
        params: IdParamSchema,
        body: PatientUpdateSchema,
        response: {
          200: PatientResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const patient = await prisma.patient.update({
        where: { id: Number(id) },
        data: request.body,
      });
      reply.send(patient);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        summary: 'Delete a patient',
        tags,
        params: IdParamSchema,
        response: {
          200: PatientResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const patient = await prisma.patient.delete({
        where: { id: Number(id) },
      });
      reply.send(patient);
    },
  );
}
