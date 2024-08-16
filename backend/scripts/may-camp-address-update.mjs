import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { PrismaClient } from '@prisma/client';

// Define command line options.
const options = {
  file: {
    type: 'string',
    short: 'f',
  },
};

// Read the command line options' values.
const { values } = parseArgs({ args: process.argv.slice(2), options });

// Read the input JSON file using the filename from file option value.
const data = JSON.parse(fs.readFileSync(values.file, 'utf8').trim());

/*
funtion to update address of may camp patients by using their book number,
if their current addresss in database is 'Unknown'.
*/
async function updatePatientsAddressUsingBookNumber(data) {
  const prisma = new PrismaClient();

  let chunkIndex = 0;

  for (let patient of data) {
    console.log('chunk', chunkIndex);
    console.time(`chunk ${chunkIndex}`);

    /*
    Update address of a patient when the book number matches
    with the provided value and the current address is 'Unknown'.
    */
    await prisma.patient.updateMany({
      where: {
        // Key name for book number in the input JSON file should be BookNumber.
        bookNumber: patient.BookNumber,
        address: 'Unknown',
      },
      data: {
        // Key name for book number in the input JSON file should be Address.
        address: patient.Address,
      },
    });

    console.timeEnd(`chunk ${chunkIndex}`);

    chunkIndex++;
  }
}

// Update the patients data.
updatePatientsAddressUsingBookNumber(data);
