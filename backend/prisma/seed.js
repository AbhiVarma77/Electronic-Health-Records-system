// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

function generatePhoneNumber() {
  let phoneNumber = '';
  for (let i = 0; i < 10; i++) {
    phoneNumber += faker.datatype.number({ min: 0, max: 9 }).toString();
  }
  return phoneNumber;
}

async function main() {
  // Generate fake data and seed the database here
  // Example: seeding 10 patients
  const patients = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.patient.create({
        data: {
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          phone: generatePhoneNumber(),
          address: faker.address.streetAddress(),
          dateOfBirth: faker.date.past(),
          gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
          bookNumber: faker.datatype.uuid(),
        },
      });
    }),
  );

  console.log(`Created ${patients.length} patients.`);

  // seed specalities
  const specialityNames = [
    'Cardiology',
    'Dermatology',
    'Gastroenterology',
    'Neurology',
    'Ophthalmology',
    'Orthopedics',
    'General Medicine',
  ];

  // Seed Specialities
  const specialities = await Promise.all(
    specialityNames.map(async (name) => {
      return prisma.speciality.create({
        data: {
          name,
        },
      });
    }),
  );

  console.log(`Created ${specialities.length} specialities.`);

  // Seed Doctors
  const doctors = await Promise.all(
    Array.from({ length: 10 }, async (_, index) => {
      return prisma.doctor.create({
        data: {
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          phone: faker.phone.number(),
          address: faker.address.streetAddress(),
          hospital: faker.company.name(),
          specialityId: specialities[index % specialities.length].id,
        },
      });
    }),
  );

  console.log(`Created ${doctors.length} doctors.`);

  // Seed MedicalCampPlaces
  const medicalCampPlaces = await Promise.all(
    Array.from({ length: 5 }, async () => {
      return prisma.medicalCampPlace.create({
        data: {
          name: `${faker.address.city()} Health Center`,
          address: faker.address.streetAddress(),
          shortName: faker.random.alphaNumeric(6),
        },
      });
    }),
  );

  console.log(`Created ${medicalCampPlaces.length} medical camp places.`);

  // Seed MedicalCamps
  const medicalCamps = await Promise.all(
    medicalCampPlaces.map(async (medicalCampPlace) => {
      return prisma.medicalCamp.create({
        data: {
          date: faker.date.future(),
          medicalCampPlaceId: medicalCampPlace.id,
        },
      });
    }),
  );

  console.log(`Created ${medicalCamps.length} medical camps.`);

  const staffs = await Promise.all(
    Array.from({ length: 5 }, async () => {
      return prisma.staff.create({
        data: {
          name: `${faker.name.firstName()} ${faker.name.lastName()}`,
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: faker.address.streetAddress(),
          hashedPassword: faker.random.alphaNumeric(10),
          salt: faker.random.alphaNumeric(5),
        },
      });
    }),
  );

  console.log(`Created ${staffs.length} staffs.`);

  // Seed Visits
  const visits = await Promise.all(
    patients.map(async (patient) => {
      return prisma.visit.create({
        data: {
          staffId: faker.helpers.arrayElement(staffs).id,
          patientId: patient.id,
          medicalCampId: faker.helpers.arrayElement(medicalCamps).id,
          heartRate: faker.datatype.number({ min: 60, max: 100 }),
          bloodPressure: `${faker.datatype.number({
            min: 80,
            max: 120,
          })}/${faker.datatype.number({ min: 60, max: 80 })}`,
          temperature: faker.datatype.float({ min: 97, max: 99 }),
          weight: faker.datatype.float({ min: 50, max: 100 }),
          height: faker.datatype.number({ min: 150, max: 200 }),
          token: Math.ceil(Date.now() / 1000),
        },
      });
    }),
  );

  console.log(`Created ${visits.length} visits.`);

  // Seed Consultations
  const consultations = await Promise.all(
    visits.map(async (visit) => {
      const doctor = faker.helpers.arrayElement(doctors);
      return prisma.consultation.create({
        data: {
          visitId: visit.id,
          doctorId: faker.helpers.arrayElement(doctors).id,
          specialityId: doctor.specialityId, // Assign the specialityId from the chosen doctor
          observations: faker.lorem.sentence(),
          symptoms: faker.lorem.sentence(),
        },
      });
    }),
  );

  console.log(`Created ${consultations.length} consultations.`);

  // Seed Medicines
  const medicines = await Promise.all(
    Array.from({ length: 20 }, async () => {
      return prisma.medicine.create({
        data: {
          name: `Medicine ${faker.random.alphaNumeric(5)}`,
          description: faker.lorem.sentence(),
        },
      });
    }),
  );

  console.log(`Created ${medicines.length} medicines.`);

  // Seed Prescriptions
  const prescriptions = await Promise.all(
    consultations.map(async (consultation) => {
      return prisma.prescription.create({
        data: {
          consultationId: consultation.id,
          medicineId: faker.helpers.arrayElement(medicines).id,
          usage: faker.lorem.words(3),
          quantity: faker.datatype.number({ min: 1, max: 10 }),
          quantityUnit: 'TABLET',
          givenQuantity: faker.datatype.number({ min: 1, max: 10 }),
          givenQuantityUnit: 'TABLET',
          staffId: faker.helpers.arrayElement(staffs).id,
        },
      });
    }),
  );

  console.log(`Created ${prescriptions.length} prescriptions.`);

  const tests = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.test.create({
        data: {
          name: `Test ${faker.random.alphaNumeric(5)}`,
          description: faker.lorem.sentence(),
        },
      });
    }),
  );

  console.log(`Created ${tests.length} tests.`);

  // Seed TestPrescriptions
  const testPrescriptions = await Promise.all(
    consultations.map(async (consultation) => {
      return prisma.testPrescription.create({
        data: {
          consultationId: consultation.id,
          testId: faker.helpers.arrayElement(tests).id,
          sampleStatus: faker.datatype.boolean(),
          reportStatus: faker.datatype.boolean(),
        },
      });
    }),
  );

  console.log(`Created ${testPrescriptions.length} test prescriptions.`);

  // Seed Attachments
  const attachments = await Promise.all(
    testPrescriptions.map(async (testPrescription) => {
      return prisma.attachment.create({
        data: {
          consultationId: testPrescription.consultationId,
          url: faker.internet.url(),
          type: faker.system.mimeType(),
          name: `Attachment ${faker.random.alphaNumeric(5)}`,
          testPrescriptionId: testPrescription.id,
        },
      });
    }),
  );

  console.log(`Created ${attachments.length} attachments.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
