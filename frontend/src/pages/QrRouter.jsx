import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPatientByQrId } from '../utils/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const QrRouter = () => {
  const params = useParams();
  const qrId = params.qrId;
  const [patient, setPatient] = useState();
  const navigate = useNavigate();

  const loadPatient = async ({ signal }) => {
    const patientRes = await getPatientByQrId(qrId, { signal });
    setPatient(patientRes);
  }

  useEffect(() => {
    const abortController = new AbortController();
    loadPatient({ signal: abortController.signal });

    return () => {
      abortController.abort();
    }
  }, [])

  useEffect(() => {
    if (patient === null) {
      navigate(`/patient/qr/${qrId}/map`);
    } else if (typeof patient !== "undefined") {
      navigate(`/records/${patient.id}`)
    }
  }, [patient])


  return (<div>
    Loading...
  </div>)

};
