import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';

import { z } from 'zod';
import Button from '../../components/Button';
import Message from '../../components/Message';
import Select from '../../components/Select';
import TextInput from '../../components/TextInput';
import { getPatient, updatePatient } from '../../utils/api';
import { addressOptions } from '../../utils/constants';

const validationSchema = z.object({
  address: z.string(),
  bookNumber: z.string(),
    //changed the age tag to only accept positive numbers.
  age: z.coerce.number().positive().max(150),
  gender: z.string(),
    // changed the name tag to specifically recognize only strings
  name: z.string().regex(/^[a-zA-Z\s]+$/),
    // changed the phone tag to specifically recognize numbers.
  phone: z.string().regex(/^\d+$/).min(10).max(10),
  notes: z.string().optional(),
});

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

export const EditPatient = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  const {
    data: patient,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatient(patientId),
    enabled: patientId !== '',
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    values: {
      address: patient?.address || '',
      bookNumber: patient?.bookNumber || '',
      age: patient ? calculateAge(patient.dateOfBirth).toString() : '',
      gender: patient?.gender || '',
      name: patient?.name || '',
      phone: patient?.phone || '',
      notes: patient?.notes || '',
    },
  });

  const { mutate } = useMutation(updatePatient, {
    onSuccess: () => {
      navigate(-1);
      setMessage({
        type: 'success',
        description: 'Patient details updated successfully!',
      });
    },
    onError: () => {
      console.log('saas');
      setMessage({
        type: 'fail',
        description: 'Failed to update patient details',
      });
    },
  });

  const handlePatient = (data) => {
    mutate({ ...data, patientId });
  };

  if (isLoading) <div>Loading...</div>;
  if (error) <div>{error.message}</div>;

  return (
    <div className="container">
      <h3 className="text-center">Update patient vitals page</h3>
      <form className="w-100 mb-5">
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
        <TextInput
          label="Phone"
          maxLength={10}
          error={errors?.phone?.message}
          {...register('phone')}
        />{' '}
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
                styles={{ margin: '0 24px' }}
                isClearable
                options={addressOptions}
                {...field}
                value={value ? { label: value, value: value } : null}
                onChange={(value) => onChange(value?.value ?? '')}
                onBlur={() => field.onBlur()}
                placeholder="select address place"
              />
            )}
          />
        </div>
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
        {message && (
          <Message type={message.type} message={message.description} />
        )}
        <Button
          type="submit"
          title="Update Patient"
          disabled={isLoading}
          onClick={handleSubmit(handlePatient)}
        />
      </form>
    </div>
  );
};
