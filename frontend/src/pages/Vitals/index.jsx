import React, { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
//
import Button from '../../components/Button';
import Message from '../../components/Message';
import TextInput from '../../components/TextInput';
import { ActiveMedicalCampContext } from '../../components/Layout';
//
import { getPatients, getVisits } from '../../utils/api';

export const Vitals = () => {
  const navigate = useNavigate();
  const activeMedicalCamp = useContext(ActiveMedicalCampContext);
  const [searchText, setSearchText] = useState('');

  const { data: patients, error: patientsError } = useQuery({
    queryKey: ['patients', searchText],
    queryFn: () => getPatients(searchText),
    enabled: searchText !== '',
  });

  const { data: visits, isLoading: vitalsLoading } = useQuery({
    queryKey: ['visit', patients?.length > 0 && patients[0].id],
    queryFn: () =>
      getVisits({
        patientId: patients[0].id,
        medicalCampId: activeMedicalCamp.id,
      }),
    enabled: patients?.length !== 0,
  });

  return (
    <div className="container">
      <h1 className="text-center">Search Patient Book Number</h1>
      <div className="flex align-items-center justify-content-center mt-4 mb-4">
        <TextInput
          keyboardType="numeric"
          // type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Enter book number"
        />
        
      </div>

      {patients?.length === 0 && (
        <Message
          type="info"
          message="Patient with this Book Number is not found"
        />
      )}
      {patientsError && (
        <Message
          type="fail"
          message={'Something went wrong in fetching the patient details.'}
        />
      )}
      <div className="mx-4">
        {patients?.map((patient) => (
          <div
            key={patient.id}
            className="d-flex flex-column border rounded p-2 mb-2"
          >
            <div className="">Book Number: {patient.bookNumber}</div>
            <div className="">Name: {patient.name}</div>
            <div className="">Phone Number: {patient.phone}</div>
            <div className="">
              Address: <span>{patient.address}</span>
            </div>
            <div className="d-flex justify-content-end">
              {visits?.length > 0 ? (
                <Button
                  onClick={() => navigate(`/vitals/${visits[0].id}`)}
                  containerStyles={{ margin: '0px' }}
                  buttonStyles={{
                    padding: '4px 16px',
                    margin: '0',
                    letterSpacing: '0px',
                  }}
                  disabled={vitalsLoading}
                  title="Add vitals"
                />
              ) : (
                <div>No visits found</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
