import React,{ useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { getVisit, markPatientCouncellingApi } from '../../utils/api';
import Button from '../../components/Button';

export const PatientCounceling = () => {
    const visitID = useParams().visitId;
    const [visitDetails,setVistDetails] = useState({});
    useEffect(() => {
        const search = async () => {
            const data = await getVisit({visitId:parseInt(visitID)});
            setVistDetails(data);
        };
          search()
    }, [])
    const markPatientCounceling = (id) =>{
        markPatientCouncellingApi(id);
    }
    useEffect(() => {
    }, [visitDetails])
    
  return (
    <div>
        {visitDetails && visitDetails.patientCouncellingDone && <h1> Patient counseling already marked</h1>}
        {visitDetails &&!visitDetails.patientCouncellingDone && <Button type="button" onClick={() =>markPatientCounceling(visitID)} title="Mark Patient counceling done" ></Button>}


    </div>


  );
};
