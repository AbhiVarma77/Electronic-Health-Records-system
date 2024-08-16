import axios from 'axios';
import { DateTime } from 'luxon';

const baseURL = import.meta.env.VITE_API_URL;

export const axiosClient = axios.create({
  baseURL: baseURL,
});

axiosClient.interceptors.request.use(function (config) {
  const token = JSON.parse(localStorage.getItem('authToken'));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const staffLogin = async (data) => {
  const { data: response } = await axiosClient.post('/staff/login', data);
  return response;
};

export const staffSignup = async (data) => {
  const { data: response } = await axiosClient.post('/staff/signUp', data);
  return response.data;
};

export const createPatient = async (data) => {
  const date = DateTime.local()
    .minus({ years: data.age })
    .startOf('year')
    .setZone('utc')
    .toISO();
  const createVisit = data.createVisit;
  const staff = JSON.parse(localStorage.getItem('user'));

  const specialities = data.selectedSpecialities;

  delete data.createVisit;
  delete data.selectedSpecialities;

  const transformedData = {
    ...data,
    dateOfBirth: date,
  };

  const { data: patient } = await axiosClient.post(
    '/patients',
    transformedData,
  );

  let visit;
  if (createVisit) {
    const { data: visitData } = await axiosClient.post('/visits', {
      staffId: staff.id,
      patientId: patient.id,
      medicalCampId: data.medicalCampId,
      specialities,
    });
    visit = visitData;
  }

  return {
    ...patient,
    ...visit,
  };
};

export const getPatients = async (text) => {
  const searchParams = `${new URLSearchParams({ q: text, visits: 'true' })}`;
  const { data: response } = await axiosClient.get(`/patients?${searchParams}`);
  return response;
};

export const getPatient = async (patientId) => {
  const { data: patient } = await axiosClient.get(`/patients/${patientId}`);
  return patient;
};

export const getPatientByQrId = async (qrId, { signal }) => {
  const { data: patient } = await axiosClient.get(`/patients/qr/${qrId}`, {
    signal
  });
  return patient;
}

export const setQrToPatient = async ({ qrId, patientId }) => {
  await axiosClient.patch(`/patients/${patientId}/qr-id`, {
    qrId,
  });
}

export const getPatientByBookNumber = async (bookNumber, { signal }) => {
  const { data: patient } = await axiosClient.get(`/patients/book/${bookNumber}`, {
    signal
  });
  return patient;
}

export const updatePatient = async (data) => {
  const patientId = data.patientId;

  delete data.patientId;

  const date = DateTime.local()
    .minus({ years: data.age })
    .startOf('year')
    .setZone('utc')
    .toISO();

  const transformedData = {
    ...data,
    dateOfBirth: date,
  };

  const { data: response } = await axiosClient.put(
    `/patients/${patientId}`,
    transformedData,
  );
  return response;
};

export const createVisit = async (data) => {
    console.log(".........",data,data.id);
  const staff = JSON.parse(localStorage.getItem('user'));
  const { data: visitData } = await axiosClient.post('/visits', {
    staffId: staff.id,
    patientId: data.id,
    medicalCampId: data.medicalCampId,
    specialities: data.selectedSpecialities,
  });
  return { ...data, ...visitData };
};

export const getVisits = async (data) => {
  const params = {
    medicalCampId: data.medicalCampId,
    patientId: data.patientId,
  };

  const truthyParams = Object.fromEntries(
    // eslint-disable-next-line no-unused-vars
    Object.entries(params).filter(([key, value]) => value),
  );

  const searchParams = `${new URLSearchParams(truthyParams)}`;

  const { data: visit } = await axiosClient.get(`/visits?${searchParams}`);

  return visit;
};

export const getVisit = async (data) => {
  const { visitId } = data;
  const { data: visit } = await axiosClient.get(`/visits/${visitId}`);

  return visit;
};

export const updateVitals = async (data) => {
    const currentTime = new Date().toISOString();
    console.log(currentTime);
  const transformedData = {
    ...data,
    heartRate: data.heartRate || undefined,
    bloodPressure: data.bloodPressure || undefined,
    temperature: data.temperature || undefined,
    weight: data.weight || undefined,
    height: data.height || undefined,
    vitalsDone: currentTime
  };

  const { data: visit } = await axiosClient.put(
    `/visits/${data.visitId}`,
    transformedData,
  );

  return visit;
};

export const getSpecialities = async () => {
  const { data: specialities } = await axiosClient.get(`/specialities`);

  return specialities;
};

export const getActiveMedicalCamp = async () => {
  const { data: medicalCamps } = await axiosClient.get(`/medicalCamps`);
  const activeMedicalCamps = medicalCamps.filter((camp) => camp.active);
  return activeMedicalCamps;
};

export const createConsultations = async (data) => {
  const { visitId, selectedSpecialities } = data;
  const consultationPromises = selectedSpecialities.map((specialityId) => {
    return axiosClient.post(`/consultations`, {
      visitId,
      specialityId,
    });
  });

  const consultationResponses = await Promise.all(consultationPromises);
  return consultationResponses;
};

export const getGenderAnalytics = async () => {
    const { data: genderAnalytics } = await axiosClient.get(`/analytics/gender`);
    return genderAnalytics;
};
export const getStatusAnalytics = async () => {
    const { data: statusAnalytics } = await axiosClient.get(`/analytics/status`);
    return statusAnalytics;
};

export const getDoctors = async () => {
    const { data: doctorsList } = await axiosClient.get(`/doctors`);
    const transformedData = doctorsList.map(item => ({
        label: item.name,
        value: item.id +"_"+item.name
    }));
    return transformedData;
};
export const getSpecality = async () => {
    const { data: specalityList } = await axiosClient.get(`/specialities`);
    const transformedData = specalityList.map(item => ({
        label: item.name,
        value: item.id +"_"+item.name
    }));
    return transformedData;
};
export const getMedicines = async () => {
    const { data: specalityList } = await axiosClient.get(`/medicines`);
    const transformedData = specalityList.map(item => ({
        label: item.name,
        value: item.id +"_"+item.name
    }));
    return transformedData;
};
export const getTests = async () => {
    const { data: specalityList } = await axiosClient.get(`/tests`);
    const transformedData = specalityList.map(item => ({
        label: item.name,
        value: item.id +"_"+item.name
    }));
    return transformedData;
};
export const updateConsultation = async (data) => {
    const { visitId, specialityId ,symptoms,observations,doctorId,medicines,tests} = data;
    const { data:CData }= await axiosClient.post(`/consultations`, {
        visitId, specialityId,symptoms,observations,doctorId
      });
    return {cid: CData.id,medicines,tests};
  };


export const addPrescriptions = async (data) => {
    const { cid, medicines } = data;
    const staff = JSON.parse(localStorage.getItem('user'));

      for (const medicine of medicines) {
            try {
                // Extract medicine details
                const { id, quantity, usage } = medicine;
                // Make API call for the current medicine
                    const response = await axiosClient.post(`/prescriptions`, {
                        medicineId:id,quantity,usage,staffId:staff.id,quantityUnit:"TABLET",consultationId:cid
                    });
        
            } catch (error) {
                // Handle errors for individual medicine API calls
                console.error(`Error making API call for medicine ${medicine}:`, error);
                return error;
            }
        }
      
    return data;
  };
  export const addTestPrescriptions = async (data) => {
    const { cid, tests } = data;
    const staff = JSON.parse(localStorage.getItem('user'));

      for (const test of tests) {
            try {
                // Extract test details
                const { testName } = test;
                const [id, name] = testName.split('_');
                // Make API call for the current test
                    const response = await axiosClient.post(`/testPrescriptions`, {
                        testId:parseInt(id),sampleStatus:false,reportStatus:false,staffId:staff.id,consultationId:cid
                    });
        
            } catch (error) {
                // Handle errors for individual medicine API calls
                console.error(`Error making API call for test ${test.id}:`, error);
                return error;
            }
        }
      
    return "sucesss";
  };

  export const getVistByPatient = async (data) => {
    const patientId=data;
    const { data: patient } = await axiosClient.get(`/visits/byPatient/${patientId}`);
    return patient;
  };

  export const createVisit1 = async (data) => {
  const staff = JSON.parse(localStorage.getItem('user'));
  try {
    const { data: visitData } = await axiosClient.post('/visits', {
        staffId: staff.id,
        patientId: data.id,
        medicalCampId: data.medicalCampId,
        specialities: data.selectedSpecialities,
      });
      window.location.reload()
      return { ...data, ...visitData };

  } catch(err){
    console.log(err);
  }
  return "err";
};

export const getPrescriptionByVisit = async (data) =>{
    const visitId = data;
    const {data:medicines} = await axiosClient.get(`/prescriptions/byVisit/${visitId}`);
    return medicines;
}

export const deletePrescription = async (data) =>{
    const prescriptionId = data;
    try {
        const {data:medicines} = await axiosClient.delete(`/prescriptions/${prescriptionId}`);

          window.location.reload()
          return medicines;
    
      } catch(err){
        console.log(err);
      }
      return "err";
}

export const markRefreshmentsApi = async (data) => {
    const currentTime = new Date().toISOString();
    const id = parseInt(data)
  const transformedData = {
    refreshmentsDone: currentTime
  };
  try {
    const { data: visit } = await axiosClient.put(
        `/visits/${id}`,
        transformedData,
      );
      window.location.reload()

      return visit;
  } catch(err){
    console.log(err);
  }
  return "err";

};

export const markPatientCouncellingApi = async (data) => {
    const currentTime = new Date().toISOString();
    const id = parseInt(data)
  const transformedData = {
    patientCouncellingDone: currentTime
  };
  try {
    const { data: visit } = await axiosClient.put(
        `/visits/${id}`,
        transformedData,
      );
      window.location.reload()

      return visit;
  } catch(err){
    console.log(err);
  }
  return "err";

};

export const checkMedications = async (data) => {
    const { visitId,medicines} = data;
    console.log(visitId,medicines);
    const { data:rData }= await axiosClient.put(`/prescriptions/check/${visitId}`, medicines
      );
    return rData;
  };