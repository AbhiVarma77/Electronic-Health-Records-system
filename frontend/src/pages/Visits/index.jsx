import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';
import { ActiveMedicalCampContext } from '../../components/Layout';
import Button from '../../components/Button';
import { getVisits } from '../../utils/api';
import { DateTime } from 'luxon';
import { useNavigate } from 'react-router-dom';

function isToday(_date) {
  const date = DateTime.fromISO(_date);
  const today = DateTime.local();

  return (
    date.day === today.day &&
    date.month === today.month &&
    date.year === today.year
  );
}

export const Visits = () => {
  const activeMedicalCamp = useContext(ActiveMedicalCampContext);
  const navigate = useNavigate();

  const {
    data: visits,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['visits', activeMedicalCamp && activeMedicalCamp.id],
    queryFn: () =>
      getVisits({
        medicalCampId: activeMedicalCamp.id,
      }),
  });

  if (isLoading) <div>loading...</div>;
  if (error) <div>{error.message}</div>;

  const oldPatients = visits?.filter(
    (visit) => !isToday(visit.patient.createdAt),
  )?.length;

  const newPatients = visits ? visits.length - oldPatients : 0;

  const showConsultations = (consultations) => {
    if (consultations == null || consultations.length === 0) {
      return 'Not recorded';
    }
    const isGeneralMedicine = consultations.find((c) => c.specialityId === 1);
    const isEyes = consultations.find((c) => c.specialityId === 2);

    if (isGeneralMedicine && isEyes) {
      return 'M / E';
    }
    if (isGeneralMedicine) {
      return 'M';
    }
    if (isEyes) {
      return 'E';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-around m-4 ml-0 fs-4">
        <span>
          <b>Total Visits: </b> {visits?.length}
        </span>
        <span>
          Women:{' '}
          {visits?.filter((visit) => visit.patient.gender === 'Female')?.length}
        </span>
        <span>
          Men:{' '}
          {visits?.filter((visit) => visit.patient.gender === 'Male')?.length}
        </span>
      </div>
      <div className="d-flex justify-content-around m-4 ml-0 fs-4">
        <span>Old Patients: {oldPatients}</span>
        <span>New Patients: {newPatients}</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Book Number</th>
            <th scope="col">Name</th>
            <th scope="col">Gender</th>
            <th scope="col">Phone Number</th>
            <th scope="col">Address</th>
            <th scope="col">Old / New</th>
            <th scope="col">Notes</th>
            <th scope="col">M / E</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {visits &&
            visits.map((visit) => (
              <tr key={visit.id} className="mb-3">
                <td>{visit.token}</td>
                <td>{visit.patient.bookNumber}</td>
                <td>{visit.patient.name}</td>
                <td>{visit.patient.gender}</td>
                <td>{visit.patient.phone}</td>
                <td>{visit.patient.address}</td>
                <td>{isToday(visit.patient.createdAt) ? 'N' : 'O'}</td>
                <td>{visit.patient.notes}</td>
                <td>{showConsultations(visit.consultations)}</td>
                <td>
                  <Button
                    title="Edit"
                    containerStyles={{ margin: '0px' }}
                    buttonStyles={{
                      padding: '4px 16px',
                      margin: '0px',
                      letterSpacing: '0px',
                      marginRight: '10px',
                    }}
                    disabled={isLoading}
                    onClick={() => navigate(`/patient/${visit.patient.id}`)}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
