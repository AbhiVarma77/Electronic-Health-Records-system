import fs from 'node:fs';
import { DateTime } from 'luxon';
import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import _ from 'lodash';

const firstSundays = [
  '06-03-2022',
  '03-04-2022',
  '01-05-2022',
  '05-06-2022',
  '03-07-2022',
  '07-08-2022',
  '04-09-2022',
  '02-10-2022',
  '06-11-2022',
  '04-12-2022',
  '01-01-2023',
  '05-02-2023',
  '05-03-2023',
  '02-04-2023',
  '07-05-2023',
  '04-06-2023',
  '02-07-2023',
  '06-08-2023',
  '03-09-2023',
  '01-10-2023',
  '05-11-2023',
  '03-12-2023',
  '07-01-2024',
  '04-02-2024',
  '03-03-2024',
  '07-04-2024',
  '05-05-2024',
  '02-06-2024',
  '07-07-2024',
  '04-08-2024',
  '01-09-2024',
  '06-10-2024',
  '03-11-2024',
  '01-12-2024'
].map((d) => DateTime.fromFormat(d, 'dd-MM-yyyy').toJSDate());

const options = {
  file: {
    type: 'string',
    short: 'f',
  },
};

const csvInputFile = process.argv[2]
const flat_data_input_flag = process.argv[3]
console.log(csvInputFile);

const BOOK_NUMBER = 'Id no';
const CONTACT = 'Contact no.';
const DEFAULT_PHONE = '1111111111';
const CAMP = 'Camp';
// Default year of Birth is set to 1800
const DEFAULT_DOB = DateTime.now().startOf('year').minus({ year: 223 }).toISO();

function getCorrectedData(data) {
  return data.map((d, i) => {
    // For people who have not been assigned a book number, assign a random one
    if (d[BOOK_NUMBER] === '' || Number.isNaN(Number(d[BOOK_NUMBER]))) {
      d[BOOK_NUMBER] = (900000 + i).toString();
    }
    return d;
  })
  .map((d) => {
    // For people who have not provided a contact number, assign a default one
    const contact = d[CONTACT];
    d.notes = null;
    if (contact === '') {
      d[CONTACT] = DEFAULT_PHONE;
    } else if (contact.includes(',')) {
      const contacts = contact.split(',').map((c) => c.trim());
      d[CONTACT] = contacts[0];
      d.notes = 'Alternative Phone Numbers:\n' + contacts.slice(1).join(', ');
    } else if (contact.trim().match(/^\d{10}$/)) {
      d[CONTACT] = contact.trim();
    } else {
      d.notes = contact;
      d[CONTACT] = DEFAULT_PHONE;
    }

    return d;
  })
  .map((d) => {
    // Split attended camps into an array of camp ids
    if (d[CAMP] === '') {
      d[CAMP] = [];
      d.notes = (d.notes || '') + ('\n' + 'Camp details not available');
    } else {
      const camps = d[CAMP].split(',').map((c) => Number(c.trim()));
      d[CAMP] = camps;
    }

    return d;
  })
  .map((d) => {
    // If address is not available, set it to 'Unknown' 
    if (d.Address === '' || d.Address == null) {
      d.Address = 'Unknown';
      d.notes = (d.notes || '') + ('\n' + 'Address details not available');
    }

    return d;
  })
  .map((d) => {
    //  Normalize genders
    if (d.Gender.toUpperCase().includes('F')) {
      d.Gender = 'Female';
    } else if (d.Gender.toUpperCase().includes('M')) {
      d.Gender = 'Male';
    } else {
      d.Gender = 'Unknown';
      d.notes = (d.notes || '') + ('\n' + 'Gender not available');
    }

    return d;
  })
  .map((d) => {
    //  Normalize dates of birth from age provided. If age is not available, add a note
    //  add a default date of birth
    if (Number.isNaN(Number(d.Age))) {
      d.notes =
        (d.notes || '') +
        ('\n' + 'Age not available or incorrect format ' + d.Age);
      d.dateOfBirth = DEFAULT_DOB;
    } else {
      d.dateOfBirth = DateTime.now()
        .minus({ year: Number(d.Age) })
        .startOf('year')
        .toISO();
    }

    return d;
  });
}

function normalizeBookNumbers(data) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // check for duplicate book numbers
  const bookNumbers = {};
  for (let d of data) {
    if (!bookNumbers[d[BOOK_NUMBER]]) {
      bookNumbers[d[BOOK_NUMBER]] = [];
    }
    bookNumbers[d[BOOK_NUMBER]].push(d);
  }

  // Merge May 2023 camp data if the book number and contact numbers are the same
  Object.keys(bookNumbers)
    .filter((k) => bookNumbers[k].length > 1)
    .map((k) => bookNumbers[k])
    .filter(
      (k) =>
        k.some((p) => p.Camp.includes(15)) &&
        k.every((p) => p[CONTACT] === k[0][CONTACT]),
    )
    .forEach((k) => {
      const firstElement = k[0];
      for (let p of k.slice(1)) {
        firstElement.Camp.push(p.Camp[0]);
      }
      const lastElement = k[k.length - 1];
      firstElement.Age = lastElement.Age;
      firstElement.dateOfBirth = lastElement.dateOfBirth;
      k.splice(1);
    });

  // If there are multiple people with the same book number, append a letter to the book number
  Object.keys(bookNumbers)
    .filter((k) => bookNumbers[k].length > 1)
    .map((k) => bookNumbers[k])
    .forEach((k) => {
      let index = 0;
      for (const patient of k) {
        patient[BOOK_NUMBER] = patient[BOOK_NUMBER] + letters[index];
        index++;
      }
    });

  const newData = Object.values(bookNumbers).reduce(
    (acc, val) => acc.concat(val),
    [],
  );

  // Check for duplicate patients with same name and age. For these patients append '[NAD]' as 
  // prefix and book number as suffix
  for (let [key, patients] of Object.entries(
    _.pickBy(
      _.groupBy(correctedData, (d) => d.Name + ' ' + d.Age),
      (d) => d.length > 1,
    ),
  )) {
    for (let patient of patients) {
      patient.Name = '[NAD] ' + patient.Name + ' ' + patient[BOOK_NUMBER];
    }
  }

  // Check for duplicate patients with same name and contact. For these patients append '[NCD]' as 
  // prefix and book number as suffix
  for (let [key, patients] of Object.entries(
    _.pickBy(
      _.groupBy(correctedData, (d) => d.Name + ' ' + d[CONTACT]),
      (d) => d.length > 1,
    ),
  )) {
    for (let patient of patients) {
      patient.Name = '[NCD] ' + patient.Name + ' ' + patient[BOOK_NUMBER];
    }
  }

  return newData;
}

async function writeToDatabase(data) {
  const prisma = new PrismaClient();

  //create default medicalCampPlace id 1 data
  //todo : ideal approach is to make sure we insert this required data before running this script
  const camp_data = await prisma.medicalCampPlace.create({
    data: {
      name: "Swecha Main Office",
      address: "Swecha Office Gachibowli Hyderabad",
      shortName: "Swecha Main Office"
    }
  });

  //create default Staff id 1 data
  //todo : ideal approach is to make sure we insert this required data before running this script
  const staff_data = await prisma.staff.create({
    data: {
      name: "Swecha Main Office Staff", 
      email: "swecha@gmail.com",
      phone: "1234567890",
      address: "Swecha Office, Gachibowli, Hyderabad",
      hashedPassword: "test",
      salt: "test"
    }
  });

  await prisma.medicalCamp.createMany({
    data: firstSundays.map((date) => ({
      medicalCampPlaceId: camp_data.id,
      date,
    })),
  });

  let index = 4000000;

  let chunkIndex = 0;
  let chunkSize = 5000;

  for (let patients of _.chunk(data, chunkSize)) {
    console.log('chunk', chunkIndex);
    console.time(`chunk ${chunkIndex}`);
    await prisma.patient.createMany({
      data: patients.map((patient) => ({
        name: patient.Name,
        phone: patient[CONTACT],
        dateOfBirth: patient.dateOfBirth,
        address: patient.Address,
        gender: patient.Gender,
        notes: patient.notes,
        bookNumber: patient[BOOK_NUMBER],
      })),
    });

    let patientIndex = 0;
    for (let patient of patients) {
      patient.id = chunkIndex * chunkSize + patientIndex + 1;
      patientIndex++;
    }

    let i = 0;
    let visits = [];
    let campSet = new Set();
    for (let patient of patients) {
      for (let campId of patient[CAMP]) {
        visits.push({
          patientId: patient.id,
          medicalCampId: campId,
          staffId: staff_data.id,
          token: index + i,
        });
        i++;
        campSet.add(campId);
      }
    }

    await prisma.visit.createMany({
      data: visits,
    });
    console.timeEnd(`chunk ${chunkIndex}`);

    index += i;
    chunkIndex++;
  }
}

function flatten_data(data) {
  // Extract Campus Id Number from Campus No. Get 'X' from format 'Campus X'
  const camp_parsed_data = _.map(data, obj => {
    const campNumber = parseInt(obj['Camp No'].split(' ')[1]);
    return { ...obj, "CampNum": campNumber }; 
  });

  // Group By Book Number / Id and Contact No and flatten data 
  const book_mobile_group_data = _.chain(camp_parsed_data)
  .filter(item => !(_.isEmpty(item[BOOK_NUMBER]) &&  _.isEmpty(item[CONTACT])))
  .groupBy(item => `${item[BOOK_NUMBER]}-${item[CONTACT]}`)
  .map(group => {
    // use latest camp data when available
    group.sort((a,b) => a.CampNum - b.CampNum);
    const mergedObject = group[0];
    group.forEach(obj => {
      for (const key in obj) {
          if(!_.isEmpty(obj[key]))
            mergedObject[key] = obj[key];  
      }
    });
    mergedObject[CAMP] = _.uniq(group.map(item => item['CampNum'])).join(',');
    return mergedObject;
  })
  .value();

  // Group By Book Number / Id and Name
  return _.chain(book_mobile_group_data)
  .groupBy(item => (`${item['Name']}-${item[BOOK_NUMBER]}`).toLowerCase())
  .map(group => {
    group.sort((a,b) => a.CampNum - b.CampNum);
    const mergedObject = group[0];
    group.forEach(obj => {
      for (const key in obj) {
          if(!_.isEmpty(obj[key]))
            mergedObject[key] = obj[key];  
      }
    });
    return mergedObject;
  })
  .value();
}

let jsonData = [];
let correctedData = [];

fs.createReadStream(csvInputFile)
  .pipe(csv())
  .on('data', (row) => {
    // Push each row of the CSV as an object to the JSON array
    jsonData.push(row);
  })
  .on('end', () => {
    let flattened_data = jsonData;
    if(!(flat_data_input_flag === '-flat_data_input'))
      flattened_data = flatten_data(jsonData);
    correctedData = getCorrectedData(flattened_data);
    writeToDatabase(normalizeBookNumbers(correctedData));
  });