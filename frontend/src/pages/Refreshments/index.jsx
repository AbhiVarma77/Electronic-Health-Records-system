import React,{ useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { getVisit, markRefreshmentsApi } from '../../utils/api';
import Button from '../../components/Button';

export const Refreshments = () => {
    const visitID = useParams().visitId;
    console.log("vvvvvvvv",visitID);
    const [visitDetails,setVistDetails] = useState({});
    useEffect(() => {
        const search = async () => {
            const data = await getVisit({visitId:parseInt(visitID)});
            setVistDetails(data);
        };
          search()
    }, [])
    const markRefreshments = (id) =>{
        markRefreshmentsApi(id);
    }
    useEffect(() => {
      console.log("jjjj",visitDetails)
    }, [visitDetails])
    
  return (
    <div>
        {visitDetails && visitDetails.refreshmentsDone && <h1> Refreshements already marked</h1>}
        {visitDetails &&!visitDetails.refreshmentsDone && <Button type="button" onClick={() =>markRefreshments(visitID)} title="Mark refreshments taken" ></Button>}


    </div>


  );
};
