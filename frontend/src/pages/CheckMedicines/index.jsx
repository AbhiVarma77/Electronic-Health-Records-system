import React, { useEffect, useState } from "react";

import { getPrescriptionByVisit,getMedicines, deletePrescription, checkMedications } from "../../utils/api";
import { useParams } from "react-router-dom";
import { Controller, useForm ,useFieldArray} from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import { z } from 'zod';
import Message from '../../components/Message';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import { useMutation } from "@tanstack/react-query";
const medicineName = z.object({
    label:z.string(),
    value:z.string()
});

const prescriptionSchema = z.object({
    givenQuantity:z.number(),
    medicineName: z.array(medicineName),
    quantity:z.coerce.number(),

});
const validationSchema = z.object({
    prescriptions:z.array(prescriptionSchema),
});
export const CheckMedicines = () => {
    const visitID = useParams().id;
    const [prescriptions,setPrescriptions] = useState([]);
    const [medicinesList,setMedicinesList] = useState([]);
    const [message, setMessage] = useState(null);

    // const { data: medicinesList } = useQuery({
    //     queryKey: ['medicinesList'],
    //     queryFn: getMedicines,
    // });
    useEffect(() => {
        const search = async () => {
            const presdata = await getPrescriptionByVisit(visitID);
            const medData = await getMedicines();
            setMedicinesList(medData);
            console.log(medicinesList);
            const mergedData = presdata.map(item1 => {
                const matchingItem = medData.find(item2 => item2.value.startsWith(`${item1.medicineId}_`));
                if (matchingItem) {
                    return {
                        ...item1,
                        label: matchingItem.label,
                        value: matchingItem.value,
                        isEdit: false
                    };
                } else {
                    return item1; // Return original item from data1 if no match is found
                }
            });
            console.log(mergedData);
            setPrescriptions(mergedData);
            console.log(mergedData);
          };
        search();
    }, [])
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm({
        // resolver: zodResolver(validationSchema),

    });   
    
    const deleteMedicine = (id) => { 
        deletePrescription(id);
        console.log("hiiiiii",id);
    };
    const toggleEdit = (id) =>{
        console.log(medicinesList);
        const updatedPrescriptions = prescriptions.map(prescription => {
            if (prescription.id === id) {
                return { ...prescription, isEdit: true };
            }
            return prescription;
        });
        setPrescriptions(updatedPrescriptions)

    }
    const { mutate, isLoading } = useMutation({
        mutationFn: checkMedications,
        onSuccess: (data) => {
            setMessage({
                type: 'success',
                description: 'check successful.',
              });
        },
        onError: () => {
          setMessage({
            type: 'fail',
            description: 'Something went wrong in creating a visit.',
          });
        },
      });
    const onSubmit = async (data) => {
        console.log("submitttt",data);
        const transformedData = data.medicines.map(medicine => ({
            medId: parseInt(medicine.medicineName.value.split('_')[0], 10),
            givenQuantity: parseInt(medicine.givenQuantity),
            quantity: parseInt(medicine.quantity),
            id:medicine.id
        }));
    
        console.log("Transformed data:", transformedData);
        mutate({medicines:transformedData,visitId:visitID});
    }
    return(
        <>
              {message?.type === 'success' ? (
        <>
          <Message type={message.type} message={message.description} />
          <a className="ms-5 p-2" href="/">
            Go Back
          </a>
        </>
      ) : (
        <div>
            <h1>prescriptions</h1>
            {!prescriptions.length && (<h3>No medicines prescribed</h3>)}
            <form className="w-100 mb-5" onSubmit={handleSubmit(onSubmit)}>
                {prescriptions.map((item, index) => (
                    <div key={item.id}>
                       <div style={{display:  'none' }}>
                        <Controller
                                name={`medicines.${index}.id`}
                                control={control}
                                defaultValue={item.id}
                                render={({ field }) => (
                                    <TextInput
                                        label={`Medicine id in db:`}
                                        {...field}
                                        inputStyles={{ disabled:true }}
                                    />
                                )}
                            />
                       </div>
                       
                        <Controller
                            name={`medicines.${index}.medicineName`}
                            control={control}
                            defaultValue={{ label: item.label, value: item.value }}
                            render={({ field }) => (
                                <CreatableSelect
                                    styles={{ margin: '0 24px' }}
                                    isClearable
                                    options={medicinesList}
                                    {...field}
                                    isDisabled={!item.isEdit}
                                    value={field.value || { label: item.label, value: item.value }}
                                    onChange={(selectedOption) => {
                                        field.onChange(selectedOption ? { label: selectedOption.label, value: selectedOption.value } : null);
                                    }}
                                    onBlur={field.onBlur}
                                    placeholder=""
                                />
                            )}
                        />
                        <div style={{display: item.isEdit? 'none':'block' }}>
                            <p> Prescribed Quantity: {item.quantity}</p>
                        </div>
                        <div style={{display: !item.isEdit? 'none':'block' }}>
                            <Controller
                                name={`medicines.${index}.quantity`}
                                control={control}
                                defaultValue={item.quantity}
                                render={({ field }) => (
                                    <TextInput
                                        label={`Prescribed Quantity: ${item.quantity}`}
                                        {...field}
                                    />
                                )}
                            />  
                        </div>
                        
                        <Controller
                            name={`medicines.${index}.givenQuantity`}
                            control={control}
                            defaultValue={item.givenQuantity}
                            render={({ field }) => (
                                <TextInput
                                    label={`Given quantity to patient`}
                                    {...field}
                                />
                            )}
                        />
                        <Button type="button" onClick={() => deleteMedicine(item.id)} title="Delete this medicine" />
                        {!item.isEdit && (<Button type="button" onClick={() => toggleEdit(item.id)} title="Edit this medicine" />)}
                    </div>
                ))}
                <Button type="submit" title="Submit" />
            </form>
        </div>)}
        </>
    );
}