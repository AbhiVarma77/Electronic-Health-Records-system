import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useParams } from 'react-router-dom';
import { updateVitals, getVisit } from '../../utils/api';
import TextInput from '../../components/TextInput';
import Message from '../../components/Message';
import Button from '../../components/Button';

const validationSchema = z.object({
  heartRate: z.coerce.number(),
  bloodPressure: z
    .string()
    .regex(/^[0-9]{2,3}\/[0-9]{2,3}$/, { message: 'Invalid blood pressure' }),
  temperature: z.coerce.number(),
  weight: z.coerce.number(),
  height: z.coerce.number(),
});

export const RecordVitals = () => {
  const [message, setMessage] = useState(null);
  const { visitId } = useParams();

  const { data } = useQuery({
    queryKey: ['visit'],
    queryFn: () => getVisit({ visitId }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    values: {
      heartRate: data?.heartRate || '',
      bloodPressure: data?.bloodPressure || '',
      temperature: data?.temperature || '',
      weight: data?.weight || '',
      height: data?.height || '',
    },
  });

  const { mutate, isLoading } = useMutation(updateVitals, {
    onSuccess: () => {
      setMessage({
        type: 'success',
        description: 'Vitals have been recorded!',
      });
    },
    onError: () => {
      setMessage({
        type: 'fail',
        description: 'Something went wrong in recording vitals.',
      });
    },
  });

  const onSubmit = (data) => {
    mutate({ ...data, visitId });
  };

  return (
    <div className="container mt-4 mb-4">
      <h3 className="text-center">Update patient vitals page</h3>
      {message?.type === 'success' ? (
        <>
          <Message type={message.type} message={message.description} />
          <a className="ms-5 p-2" href="/">
            Go Back
          </a>
        </>
      ) : (
        <div>
          {message && (
            <Message type={message.type} message={message.description} />
          )}
          <form className="mt-4">
            <TextInput
              label="Heart Rate (bpm)"
              type="number"
              error={errors?.heartRate?.message}
              {...register('heartRate')}
            />
            <TextInput
              label="Blood Pressure (sp/dp)"
              error={errors?.bloodPressure?.message}
              {...register('bloodPressure')}
            />
            <TextInput
              label="Temperature (C)"
              type="number"
              error={errors?.temperature?.message}
              {...register('temperature')}
            />
            <TextInput
              label="Weight (Kg)"
              type="number"
              error={errors?.weight?.message}
              {...register('weight')}
            />
            <TextInput
              label="Height (cm)"
              type="number"
              error={errors?.height?.message}
              {...register('height')}
            />
            <Button
              type="submit"
              title="submit"
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
            />
          </form>
        </div>
      )}
    </div>
  );
};
