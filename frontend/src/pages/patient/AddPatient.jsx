import React, { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CreatableSelect from 'react-select/creatable';
//
import styles from './patient.module.css';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import Message from '../../components/Message';
import { useState } from 'react';
import { createPatient } from '../../utils/api';
import Select from '../../components/Select';
import { Specialities } from '../../components/Specialities';
import { ActiveMedicalCampContext } from '../../components/Layout';
import { addressOptions } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const createPatientValidationSchema = z.object({
  name: z.string().regex(/^[a-zA-Z]+$/).nonempty('Required'),
  qrId: z.string().optional(),
  phone: z.string().regex(/^\d+$/).min(10).max(10).nonempty('Enter a valid phone number'),
  address: z.string(),
  notes: z.string(),
  age: z.coerce.number().positive().max(150),
  bookNumber: z.string(),
  gender: z.string().nonempty('Required'),
  createVisit: z.boolean(),
});

const AddPatient = () => {
  const activeMedicalCamp = useContext(ActiveMedicalCampContext);
  const navigate = useNavigate();
  const search = useLocation().search;
  const query = new URLSearchParams(search);
  const qrId = query.get("qr-id");

  const [patient, setPatient] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: zodResolver(createPatientValidationSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      age: '',
      bookNumber: '',
      gender: '',
      createVisit: true,
    },
  });

  const { mutate, isLoading } = useMutation(createPatient, {
    onSuccess: (data) => {
      setMessage({
        type: 'success',
        description: 'Patient created successfully!',
      });
      setPatient(data);
    },
    onError: (error) => {
      setMessage({
        type: 'fail',
        description:
          error.response.data?.message ||
          "Something went wrong couldn't register patient",
      });
    },
    onSettled: () => {},
  });

  const onCreatePatient = (data) => {
    mutate({
      ...data,
      selectedSpecialities,
      medicalCampId: activeMedicalCamp.id,
    });
  };

  const handleBack = () => {
    navigate('/patient/search');
  };

  return (
    <div className="container">
      {!patient ? (
        <div className="w-100">
          <h1 className={styles.title}>Register new Patient</h1>
          <form className="w-100 mb-5">
          {  qrId && <TextInput
              label="QR Code Detected"
              type="hidden"
              value={qrId}
              {...register("qrId")}
            />
          }
            <TextInput
              label="Book number"
              error={errors?.bookNumber?.message}
              {...register('bookNumber')}
            />
            <TextInput
              label="Name"
              error={errors?.name?.message}
              {...register('name')}
            />
            <Select
              title="Gender"
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Others', value: 'Others' },
                { label: 'Unknown', value: 'Unknown' },
              ]}
              {...register('gender')}
            />
            <TextInput
              label="Age (in years)"
              error={errors?.age?.message}
              {...register('age')}
            />
            <div className="mx-4 my-2">
              <label
                className="my-2"
                htmlFor=""
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                Address
              </label>
              <Controller
                name="address"
                control={control}
                // rules={{ required: true }}
                render={({ field: { onChange, value, ...field } }) => (
                  <CreatableSelect
                    styles={{ marggin: '0 24px' }}
                    isClearable
                    options={addressOptions}
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
              label="Phone"
              maxLength={10}
              error={errors?.phone?.message}
              {...register('phone')}
            />
            <div className="px-4 py-2">
              <label className="my-2 fw-semibold">Notes</label>
              <textarea
                className="form-control border border-secondary"
                label="Notes"
                rows={5}
                {...register('notes')}
              />
              <div>{errors?.notes?.message}</div>
            </div>
            <div className="mx-3">
              <Specialities
                selectedSpecialities={selectedSpecialities}
                setSelectedSpecialities={setSelectedSpecialities}
              />
            </div>
            <div className="ms-4 my-2">
              <label htmlFor="enableCreateVisit">
                <input
                  id="enableCreateVisit"
                  title="createVisit"
                  className="me-2"
                  type="checkbox"
                  {...register('createVisit')}
                  label="create a visit"
                />
                Create appointment
              </label>
            </div>
            {message && (
              <Message type={message.type} message={message.description} />
            )}
            <Button
              type="submit"
              title="submit"
              disabled={isLoading}
              onClick={handleSubmit(onCreatePatient)}
            />
          </form>
        </div>
      ) : (
        <div className="pt-2">
          <div className="mt-4 d-flex flex-column align-items-center justify-content-center">
            <h3>Name: {patient.name}</h3>
          </div>
          <Button title="go back" onClick={() => handleBack()} />
        </div>
      )}
    </div>
  );
};

export default AddPatient;
