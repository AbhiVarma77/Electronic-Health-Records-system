import { useMutation } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useNavigate } from 'react-router-dom';
//
import Message from './Message';
import Button from './Button';
import React, { useContext, useState } from 'react';
import { createConsultations, createVisit } from '../utils/api';
import { Specialities } from './Specialities';
import { ActiveMedicalCampContext } from './Layout';

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

const PatientList = ({ patients }) => {
  const navigate = useNavigate();

  const [visit, setVisit] = useState();
  const [message, setMessage] = useState(null);
  const [showVisit, setShowVisit] = useState(false);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const activeMedicalCamp = useContext(ActiveMedicalCampContext);

  // TODO : create patient table - name | phone | age/bookNumber

  const { mutate, isLoading } = useMutation({
    mutationFn: createVisit,
    onSuccess: (data) => {
      setVisit(data);
      setShowVisit(true);
    },
    onError: () => {
      setMessage({
        type: 'fail',
        description: 'Something went wrong in creating a visit.',
      });
    },
  });

  const { mutate: consultationMutate } = useMutation({
    mutationFn: createConsultations,
    onSuccess: () => {
      setMessage({
        type: 'info',
        description: 'Appointments Booked',
      });
    },
    onError: () => {
      setMessage({
        type: 'fail',
        description: 'Something went wrong in creating a consultation',
      });
    },
  });

  const handleVisit = (patient) => {
    const { visits } = patient;
    const currentVisit = visits.find(
      (visit) => visit.medicalCampId === activeMedicalCamp.id,
    );
    if (!currentVisit) {
      mutate({
        ...patient,
        selectedSpecialities,
        medicalCampId: activeMedicalCamp.id,
      });
    } else {
      consultationMutate({
        selectedSpecialities,
        visitId: currentVisit.id,
      });
    }
  };

  const timeFunction = (patient) => {
    const length = patient.visits.length;
    const visit = patient.visits[length - 1];
    return DateTime.fromISO(visit?.updatedAt).toFormat('DD');
  };

  return (
    <div className="container">
      {showVisit ? (
        <div className="mt-4">
          <h3>Patient Name: {visit.name}</h3>
        </div>
      ) : (
        patients.map((patient) => (
          <div key={patient.id} className="d-flex flex-column border p-2 mb-2">
            <div className="">Book Number: {patient.bookNumber}</div>
            <div className="">Name: {patient.name}</div>
            <div className="">Phone Number: {patient.phone}</div>
            <div className="">Age: {calculateAge(patient.dateOfBirth)}</div>
            <div className="">Address: {patient.address}</div>
            <div className="">
              List of attended medical camp IDs:{' '}
              {patient.visits.map((visit) => visit.medicalCampId).join(', ')}
            </div>
            {patient.visits.length > 0 && (
              <div className="">Last Visited time: {timeFunction(patient)}</div>
            )}
            {patient.notes ? (
              <>
                <div className="">Notes:</div>
                <pre>{patient.notes}</pre>
              </>
            ) : undefined}

            <Specialities
              selectedSpecialities={selectedSpecialities}
              setSelectedSpecialities={setSelectedSpecialities}
            />

            {message && (
              <Message type={message.type} message={message.description} />
            )}

            <div className="d-flex justify-content-end align-items-center">
              <Button
                title="Edit Patient"
                containerStyles={{ margin: '0px' }}
                buttonStyles={{
                  padding: '4px 16px',
                  margin: '0px',
                  letterSpacing: '0px',
                  marginRight: '10px',
                }}
                disabled={isLoading}
                onClick={() => navigate(`/patient/${patient.id}`)}
              />
              <Button
                title=" Book appointment"
                containerStyles={{ margin: '0px' }}
                buttonStyles={{
                  padding: '4px 16px',
                  margin: '0',
                  letterSpacing: '0px',
                }}
                disabled={isLoading}
                onClick={() => handleVisit(patient)}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PatientList;
