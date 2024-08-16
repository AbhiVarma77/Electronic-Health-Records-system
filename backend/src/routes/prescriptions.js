import { z } from 'zod';

import { prisma } from '../db.js';
import { IdParamSchema, authenticateSchema } from '../utils/schema.js';

const prescriptionCoreSchema = {
  quantity: z.number(),
  usage: z.string(),
  quantityUnit: z.string(),

  givenQuantity: z.number().optional().nullable(),
  givenQuantityUnit: z.string().optional().nullable(),
};

const PrescriptionCreateSchema = z.object({
  consultationId: z.number(),
  medicineId: z.number(),
  staffId: z.number(),
  ...prescriptionCoreSchema,
});

const PrescriptionUpdateSchema = z.object(prescriptionCoreSchema).partial();

const prescriptionCheckCoreSchema = {
    quantity: z.number(),  
    givenQuantity: z.number(),
    medId: z.number(),
    id: z.number(),
  };
const prescriptionCheckSchema = z.array(prescriptionCheckCoreSchema);
const PrescriptionSchema = z.object({
  id: z.number(),
  consultationId: z.number(),
  medicineId: z.number(),
  staffId: z.number(),
  ...prescriptionCoreSchema,
});
const prescriptionsSchema = z.array(PrescriptionSchema);
const tags = ['Prescriptions'];

export async function prescriptionRoutes(fastify) {
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('onRoute', authenticateSchema);

  fastify.post(
    '',
    {
      schema: {
        tags,
        summary: 'Create a prescription',
        body: PrescriptionCreateSchema,
        response: {
          201: PrescriptionSchema,
        },
      },
    },
    async (request, reply) => {
      const prescription = await prisma.prescription.create({
        data: request.body,
      });
      reply.status(201).send(prescription);
    },
  );

  fastify.get(
    '',
    {
      schema: {
        tags,
        summary: 'Get all prescriptions',
        response: {
          200: z.array(PrescriptionSchema),
        },
      },
    },
    async (request, reply) => {
      const prescriptions = await prisma.prescription.findMany();
      reply.send(prescriptions);
    },
  );

  fastify.get(
    '/:id',
    {
      schema: {
        tags,
        summary: 'Get a prescription',
        params: IdParamSchema,
        response: {
          200: PrescriptionSchema,
        },
      },
    },
    async (request, reply) => {
      const prescription = await prisma.prescription.findUnique({
        where: { id: Number(request.params.id) },
      });
      reply.send(prescription);
    },
  );
  fastify.get(
    '/byVisit/:id',
    {
      schema: {
        tags,
        summary: 'Get all prescriptions based on visit id',
        params: IdParamSchema,
        response: {
          200: prescriptionsSchema,
        },
      },
    },
    async (request, reply) => {
        const visit = await prisma.visit.findUnique({
            where: { id: Number(request.params.id) },
          });
        const consultations = await prisma.consultation.findMany({
            where:{
                visitId:visit.id,
            },
        });
        const consultIds = consultations.map(con=>con.id);
        const prescriptions = await prisma.prescription.findMany({
            where:{
                consultationId:{
                    in: consultIds,
                },
            },
        });

      reply.send(prescriptions);
    },
  );
  fastify.put(
    '/:id',
    {
      schema: {
        tags,
        summary: 'Update a prescription',
        params: IdParamSchema,
        body: PrescriptionUpdateSchema,
        response: {
          200: PrescriptionSchema,
        },
      },
    },
    async (request, reply) => {
      const prescription = await prisma.prescription.update({
        where: { id: Number(request.params.id) },
        data: request.body,
      });
      reply.send(prescription);
    },
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        tags,
        summary: 'Delete a prescription',
        params: IdParamSchema,
      },
    },
    async (request, reply) => {
      await prisma.prescription.delete({
        where: { id: Number(request.params.id) },
      });
      reply.status(204).send();
    },
  );
  fastify.put(
    '/check/:id',
    {
      schema: {
        tags,
        summary: 'Medicine check update',
        params: IdParamSchema,
        // body: prescriptionCheckSchema,
        // response: {
        //   200: z.string(),

        // },
      },
    },
    async (request, reply) => {
        const medicines = request.body;
        for (const medicine of medicines) {
            console.log(medicine)
            const prescription = await prisma.prescription.update({
                where: { id: medicine.id },
                data: {
                    quantity: medicine.quantity,
                    medicineId: medicine.medId,
                    givenQuantity: medicine.givenQuantity,
                    consultationId:medicine.consultationId|| undefined,
                    quantityUnit:medicine.quantityUnit|| undefined,
                    usage:medicine.usage|| undefined,
                    givenQuantityUnit:medicine.givenQuantityUnit|| undefined,
                    verified:medicine.verified|| undefined,
                    staffId:medicine.staffId || undefined,
                },
            });
        }
        const currentTime = new Date().toISOString();

        const visit = await prisma.visit.update({
            where: { id: Number(request.params.id) },
            data: {medicinesCheckDone:currentTime},
          });
        reply.status(200).send("OK");
    },
  );

}
