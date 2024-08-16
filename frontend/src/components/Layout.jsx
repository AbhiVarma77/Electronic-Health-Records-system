import React, { createContext } from 'react';
import { useQuery } from '@tanstack/react-query';
//
import { Navbar } from './Navbar';
import { getActiveMedicalCamp } from '../utils/api';
import Message from './Message';
import { DateTime } from 'luxon';

export const ActiveMedicalCampContext = createContext();

export const Layout = (props) => {
  const { data } = useQuery({
    queryKey: ['activeMedicalCamp'],
    queryFn: getActiveMedicalCamp,
  });
  const currentDate = new Date();
  const formattedDate = DateTime.fromJSDate(currentDate).toFormat('DD');



  return (
    <>
      <Navbar />
      {data?.length === 0 && (
        <Message type="fail" message="No Active medical camp found" />
      )}
      {data && (<div className='d-flex justify-content-center fs-4'>
        <div className=''>
          <span className='fw-bold '>Medical Camp: {" "}</span>
          {/* {data[0].medicalCampPlace.name}, */}
          {"Swecha Telangana, "}
          {formattedDate}

        </div>
      </div>)}
      <ActiveMedicalCampContext.Provider value={data && data[0]}>
        {props.children}
      </ActiveMedicalCampContext.Provider>
    </>
  );
};
