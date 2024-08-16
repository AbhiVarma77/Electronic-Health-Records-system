import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import { useQuery, useMutation } from "@tanstack/react-query";
import { addPrescriptions, addTestPrescriptions, getDoctors, getMedicines, getSpecality, getTests, updateConsultation } from "../../utils/api";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm ,useFieldArray} from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import Message from '../../components/Message';
import { useParams } from "react-router-dom";

const medicineSchema = z.object({
    medicineName: z.string(),
    quantity: z.coerce.number(),
    usage: z.string(),
});
const testSchema = z.object({
    testName: z.string(),
  });
const validationSchema = z.object({
    symptoms: z.string(),
    observations: z.string(),
    doctorId: z.string(),//z.coerce.number(),
    specialityId: z.string(),// z.coerce.number(),
    visitId:  z.coerce.number(),
  medicines: z.array(medicineSchema).optional(),
    tests:z.array(testSchema).optional(),
}).refine(data => {
    let ret = true
    if (data.medicines) {
        const medicineNames = data.medicines.map(medicine => medicine.medicineName);
        const uniqueNames = new Set(medicineNames);
        const allFieldsPresent = data.medicines.every(medicine => 
            medicine.medicineName && medicine.quantity && medicine.usage
        );
        ret= ret&& uniqueNames.size === medicineNames.length && allFieldsPresent ;
    }
    if(data.tests){
        const testNames = data.tests.map(test => test.testName);
        const uniqueTestNames = new Set(testNames);
        const allFieldsPresent1 = data.tests.every(test => 
            test.testName&&1
        );
        ret = ret && uniqueTestNames.size === testNames.length && allFieldsPresent1;
    }
    return ret; // If there are no medicines,tests it's still valid
}, {
    message: "All fields are required, and medcine name and test name should be uniqe"
});

export const Consultations = () => {
    const [message, setMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const visitID = useParams().id;

    const { data: docList } = useQuery({
        queryKey: ['docDataList'],
        queryFn: getDoctors,
    });
    const { data: specalityList } = useQuery({
        queryKey: ['specalityList'],
        queryFn: getSpecality,
    });
    const { data: medicinesList } = useQuery({
        queryKey: ['medicinesList'],
        queryFn: getMedicines,
    });
    const { data: testsList } = useQuery({
        queryKey: ['testsList'],
        queryFn: getTests,
    });


    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            observations: '',
            symptoms: '',
            specality: 0,
            doctorId: 0,
            visitId:visitID,
            medicines:[],
            tests:[],
        },
    });
    const { fields, append , remove} = useFieldArray({
        control,
        name: "medicines",
      });
      const { fields:fields1, append:append1 , remove:remove1} = useFieldArray({
        control,
        name: "tests",
      });
      const { mutate: addT, isLoading: isLoading2 } = useMutation(addTestPrescriptions, {
        onSuccess: (data) => {
            setMessage({
                type: 'success',
                description: 'consultation have been recorded!',
            });
        },
        onError: () => {
            setMessage({
                type: 'fail',
                description: 'Something went wrong in recording consultation.',
            });
        },
    });
    const { mutate: addP, isLoading: isLoading1 } = useMutation(addPrescriptions, {
        onSuccess: (data) => {
            const res = addT({...data});
        },
        onError: () => {
            setMessage({
                type: 'fail',
                description: 'Something went wrong in recording consultation.',
            });
        },
    });
    const { mutate, isLoading } = useMutation(updateConsultation, {
        onSuccess: (data) => {
            const resposneData = addP({...data});
        },
        onError: () => {
            setMessage({
                type: 'fail',
                description: 'Something went wrong in recording consultation.',
            });
        },
    });
    let errorMessage1;

    useEffect(() => {
      for (const key in errors) {
        if (key === "") {
          errorMessage1 = errors[key].message;
          setErrorMessage(errorMessage1)
          break;
        }
    }
    }, [errors])
    

    const onSubmit = async (data) => {
        let numberPart = data.doctorId.match(/^\d+_/) || []; // Match the number at the start followed by _
        data.doctorId = parseInt(numberPart[0]); // Convert the matched string to a number
        numberPart = data.specialityId.match(/^\d+_/) || [];
        data.specialityId = parseInt(numberPart[0]);
        const m = data.medicines;
        const convertedMedicines = m.map(medicine => {
            const [id, name] = medicine.medicineName.split('_');
            return {
                id: parseInt(id),
                quantity: parseInt(medicine.quantity),
                usage: medicine.usage
            };
        });
        const isMedicineFieldsFilled = m.every(medicine => medicine.id && medicine.quantity && medicine.usage);
        if (!isMedicineFieldsFilled) {
            setMessage({
                type: 'fail',
                description: 'All medicine fields must be filled.',
            });
            console.error("All medicine fields must be filled");
        }
        try {
            const resposneData = await mutate({...data,medicines:convertedMedicines});
            // Reset form after successful submission
            reset();
        } catch (error) {
            console.error("Error submitting consultation:", error);
        }
    };

    const addMedicine = () => {
        append({ medicineName: '', quantity: '', usage: '' });
      };
    
      const deleteMedicine = (index) => {
        remove(index);
      };
      const addTest = () => {
        append1({ testName: ''});
      };
    
      const deleteTest= (index) => {
        remove1(index);
      };
    return (
        <div>
            {message?.type === 'success' ? (
                <>
                <Message type={message.type} message={message.description} />
                <a className="ms-5 p-2" href="/">
                    Go Back
                </a>
                </>
            ) : (
            <div className="container">
                <h1>Create a consultation</h1>
                <form className="w-100 mb-5" onSubmit={handleSubmit(onSubmit)}>
                    <TextInput
                        label="Observations"
                        error={errors?.observations?.message}
                        {...register('observations')}
                    />
                    <TextInput
                        label="Symptoms"
                        error={errors?.symptoms?.message}
                        {...register('symptoms')}
                    />
                <div className="mx-4 my-3">
                <label
                    className="my-3"
                    htmlFor=""
                    style={{ fontSize: '14px', fontWeight: 600 }}
                >
                    Specality
                </label>
                <Controller
                    name="specialityId"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                    <CreatableSelect
                        styles={{ marggin: '0 24px' }}
                        isClearable
                        options={specalityList}
                        {...field}
                        value={value ? { label: value, value: value } : null}
                        onChange={(value) => onChange(value?.value ?? '')}
                        onBlur={() => field.onBlur()}
                        placeholder=""
                    />
                    )}
                />
                </div>
                <div className="mx-4 my-2">
                <label
                    className="my-2"
                    htmlFor=""
                    style={{ fontSize: '14px', fontWeight: 600 }}
                >
                    doctor
                </label>
                <Controller
                    name="doctorId"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                    <CreatableSelect
                        styles={{ marggin: '0 24px' }}
                        isClearable
                        options={docList}
                        {...field}
                        value={value ? { label: value, value: value } : null}
                        onChange={(value) => onChange(value?.value ?? '')}
                        onBlur={() => field.onBlur()}
                        placeholder=""
                    />
                    )}
                />
                </div>
                    <TextInput
                        label="visit  ID"
                        error={errors?.visitId?.message}
                        {...register('visitId')}
                    />
                    {fields.map((medicine, index) => (
                    <div key={index}>
                        <div className="mx-4 my-2">
                            <label
                                className="my-2"
                                htmlFor=""
                                style={{ fontSize: '14px', fontWeight: 600 }}
                            >
                                Medicine Name
                            </label>
                            <Controller
                                name={`medicines.${index}.medicineName`}
                                control={control}
                                render={({ field: { onChange, value, ...field } }) => (
                                <CreatableSelect
                                    styles={{ marggin: '0 24px' }}
                                    isClearable
                                    options={medicinesList}
                                    {...field}
                                    value={value ? { label: value, value: value } : null}
                                    onChange={(value) => onChange(value?.value ?? '')}
                                    onBlur={() => field.onBlur()}
                                    placeholder=""
                                />
                                )}
                            />
                        </div>
                        <TextInput label={`Quantity ${index+1}`} error={errors?.medicines?.[index]?.quantity?.message} {...register(`medicines.${index}.quantity`)} />
                        <TextInput label={`Usage ${index+1}`} {...register(`medicines.${index}.usage`)} />
                        <Button type="button" onClick={() => deleteMedicine(index)} title={`Delete medicine ${index+1}`} />
                    </div>
                    ))}
                    <Button type="button" onClick={addMedicine} title={fields.length === 0 ? "Add Medicine" :"Add Another Medicine"}/>

                    {fields1.map((tests, index) => (
                    <div key={index}>
                        <div className="mx-4 my-2">
                            <label
                                className="my-2"
                                htmlFor=""
                                style={{ fontSize: '14px', fontWeight: 600 }}
                            >
                                Test Name
                            </label>
                            <Controller
                                name={`tests.${index}.testName`}
                                control={control}
                                render={({ field: { onChange, value, ...field } }) => (
                                <CreatableSelect
                                    styles={{ marggin: '0 24px' }}
                                    isClearable
                                    options={testsList}
                                    {...field}
                                    value={value ? { label: value, value: value } : null}
                                    onChange={(value) => onChange(value?.value ?? '')}
                                    onBlur={() => field.onBlur()}
                                    placeholder=""
                                />
                                )}
                            />
                        </div>
                        <Button type="button" onClick={() => deleteTest(index)} title={`Delete Test ${index+1}`} />
                    </div>
                    ))}
                    <Button type="button" onClick={addTest} title="Add Another Test" />
                    <div>
    {errorMessage && (
      <span style={{ color: 'red' }}>{errorMessage}</span>
    )}
  </div>
                    <Button
                        type="submit"
                        title="Submit"
                        disabled={isLoading}
                    />
                </form>
            </div>
            )}
        </div>
    );
};