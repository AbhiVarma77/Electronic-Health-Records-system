import { Button, Modal, Popover, Space, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import React,{useContext} from 'react';
import { ActiveMedicalCampContext } from './Layout';
import { createVisit1 } from '../utils/api';
import { medicalCampId } from '../utils/constants';
import { record } from 'zod';

const DeskComponent = (visitDetails) => {
    const navigate = useNavigate()
    const activeMedicalCamp = useContext(ActiveMedicalCampContext);

    const handleButtonClick = (record) => {
      if(record?.tags?.includes('success')){
        console.log('Print related ID:', record.key); // Log the print related ID
        navigate(`/deskpage/${record.key}?success=true`); // Navigate to another page for success
      } else if (record?.tags?.includes('pending')){
        Modal.error({
          title: `${record.name} pending`,
          // content: 'Navigation is not allowed for pending items.',
      });
       
    }

       
    };

    const handleSubmitB = (record) =>{
        navigate(`/${record.path}`);
    }
    const columns = [
        {
          title: 'Name Of The Desks',
          dataIndex: 'name',
          key: 'name',
          render: (text,record) => {
            let color = record.tags[0]==='success'? 'green' : 'gray';

            return(
                <div>
                    <Button  type="link" className="font-bold text-lg" disabled={record.isDisabled} onClick={() => {handleSubmitB(record)}}>{text}</Button>
                    <Tag color={color}>
                        {record.tags[0].toUpperCase()}
                    </Tag>    
                </div>
            );
          }
          , 
        },
      ];
      
      const data = [
        {
          key: '1',
          name: 'Record Vitals',
          tags: visitDetails.visitDetails.vitalsDone?['success']:['pending'],
          path: `vitals/${visitDetails.visitDetails.id}`,
          isDisabled:1,
          positon: [{
            key:'1',
            result: 'Normal'
          }

          ]
        },
        {
          key: '2',
          name: 'Record Diagnosis,medicine,tests',
          tags: visitDetails.visitDetails.consultationDocumentingDone?['success']:['pending'],
          path: `consultations/${visitDetails.visitDetails.id}`,
        isDisabled:1

        },
          {
            key: '3',
            name: 'check Medicines',
            tags: visitDetails.visitDetails.medicinesCheckDone?['success']:['pending'],
            path: `checkMedicines/${visitDetails.visitDetails.id}`,
            isDisabled:1

          },
        //   {
        //     key: '4',
        //     name: 'dispatch Medicines',
        //     tags: visitDetails.visitDetails.medicinesDispatchDone?['success']:['pending'],
        //     isDisabled:1

        //   },
          {
            key: '4',
            name: 'Mark councelling',
            tags: visitDetails.visitDetails.patientCouncellingDone?['success']:['pending'],
            path: `patientCounceling/${visitDetails.visitDetails.id}`,
            isDisabled:1

          },
        //   {
        //     key: '6',
        //     name: 'Sample Collected',
        //     tags: visitDetails.visitDetails.sampleCollectionDone?['success']:['pending'],
        //     isDisabled:1

        //   },
          {
            key: '5',
            name: 'Food & Book',
            tags: visitDetails.visitDetails.refreshmentsDone?['success']:['pending'],
            path: `refreshments/${visitDetails.visitDetails.id}`,
            isDisabled:visitDetails.visitDetails.refreshmentsDone?1:0

          },
      ]
      for (const d of data){
        if(d.tags[0]==='pending'){
            d.isDisabled =0;
            break;
        }
      }

      console.log(data);
      const handleSubmit =() =>{
            createVisit1({id:parseInt(visitDetails.pId), medicalCampId:activeMedicalCamp.id,selectedSpecialities:[]})
        }
    return (
        <div>
            {!visitDetails.visitDetails?(
                <Button onClick={handleSubmit} type="primary">{`book appointment for patientID ${visitDetails.pId}`}</Button>

            ):(
                <Table columns={columns} dataSource={data} />
            )}
            
        </div>
    )
}

export default DeskComponent;