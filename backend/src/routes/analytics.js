import { z } from 'zod';

import { prisma } from '../db.js';
import { authenticateSchema } from '../utils/schema.js';

const GenderAnalyticsResponseSchema = z.object({
    Male: z.number().optional(),
    Female: z.number().optional(),
    Other: z.number().optional(),
  });
  const StatusAnalyticsResponseSchema = z.object({
    registrationDone: z.number().optional(),
    vitalsDone: z.number().optional(),
    tiragingDone: z.number().optional(),

    consultationDocumentingDone: z.number().optional(),
    medicinesCheckDone: z.number().optional(),
    medicinesDispatchDone: z.number().optional(),
    patientCouncellingDone: z.number().optional(),
    sampleCollectionDone: z.number().optional(),
    refreshmentsDone: z.number().optional(),
  });
const tags = ['Analytics'];

export async function analyticsRoutes(fastify) {
    fastify.addHook('preHandler', fastify.authenticate);
    fastify.addHook('onRoute', authenticateSchema);

    fastify.get(
        '/gender',
        {
          schema: {
            summary: 'Get split of visits in this medical camp per gender',
            tags,
            response: {
              200: z.array(GenderAnalyticsResponseSchema),
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
          const visits = await prisma.visit.findMany({
            where: {
                medicalCampId: activeId, // Filter active medical camps
              },
          });
           const patientIds = visits.map(visit => visit.patientId);

           const patients = await prisma.patient.findMany({
            where: {
              id: {
                in: patientIds, // Filter patients by the provided array of IDs
              },
            },
          });
          
        let counts = { Male: 0, Female: 0, Other: 0 };
        const genderCounts = patients.reduce((acc, patient) => {
          acc[patient.gender] = (acc[patient.gender] || 0) + 1;
          return acc;
        }, counts);
        
          const r = [
            genderCounts
          ];
          reply.send(r);
        },
      );
      fastify.get(
        '/status',
        {
          schema: {
            summary: 'Get statusCount of all visits in this medical camp',
            tags,
            response: {
              200: z.array(StatusAnalyticsResponseSchema),
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
          const visits = await prisma.visit.findMany({
            where: {
                medicalCampId: activeId, // Filter active medical camps
              },
          });
          console.log(visits);
          const statusCounts = visits.reduce((counts, visit) => {
            Object.keys(visit).forEach((field) => {
              counts[field] = (counts[field] || 0) + (visit[field] !== null ? 1 : 0);
            });
            return counts;
          }, {});
          
          const r = [
            statusCounts
          ];
          reply.send(r);
        },
      );
}  