import React from 'react';
import { Card, Row, Col, Input } from 'antd';
import DeskComponent from '../../components/DeskComponet';
import PatientDetails from '../../components/PatientDetails';
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPatient,getVistByPatient } from '../../utils/api';
import { useState, useEffect } from 'react';
const Records = () => {

    const pId = useParams().id;
    console.log(pId);
    const [patientDetails,setPatientDetails] = useState({});
    const [visitDetails,setVistDetails] = useState({});
    useEffect(() => {
        const search = async () => {
            const data = await getPatient(pId);
            setPatientDetails(data);
          };
        search();
    }, [])
    useEffect(() => {
        const search1 = async () => {
            const data = await getVistByPatient(pId);
            setVistDetails(data);
          };
        search1();
    }, [])
    useEffect(() => {
      console.log(patientDetails);
    }, [patientDetails])
    useEffect(() => {
        console.log("vpvpvppvpvpvpvppvp",visitDetails);
      }, [visitDetails])
      
    return (
        <div>
                <PatientDetails patientDetails ={patientDetails} />
                <DeskComponent visitDetails={visitDetails} pId={pId} patientDetails ={patientDetails}/>
        </div>
    );
}

export default Records;
