import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSpecialities } from '../utils/api';

export const Specialities = ({
  selectedSpecialities,
  setSelectedSpecialities,
}) => {
  const { data: specialities } = useQuery({
    queryKey: ['specialities'],
    queryFn: getSpecialities,
    staleTime: 24 * 60 * 60 * 1000,
    cacheTime: 24 * 60 * 60 * 1000,
  });

  const handleSelect = (e, speciality) => {
    const { checked } = e.target;
    if (checked) {
      setSelectedSpecialities(selectedSpecialities.concat(speciality.id));
    } else {
      const filteredSpecialities = selectedSpecialities.filter(
        (item) => item !== speciality.id,
      );
      setSelectedSpecialities(filteredSpecialities);
    }
  };

  return (
    <>
      <h5 className="my-3 mx-1">Consultations</h5>
      <div className="d-flex flex-column justify-content-start my-2">
        {specialities &&
          specialities
            .map((speciality, index) => (
              <div key={index} className="mb-2 form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selectedSpecialities.includes(speciality.id)}
                  onChange={(e) => handleSelect(e, speciality)}
                />
                <label className="form-check-label">{speciality.name}</label>
              </div>
            ))
            .slice(0, 2)}
      </div>
    </>
  );
};
