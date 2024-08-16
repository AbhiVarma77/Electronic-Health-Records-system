import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { staffSignup } from '../..//utils/api';
import { useLocalStorage } from '../../hooks/useLocalStage';
import TextInput from '../../components/TextInput';
import Message from '../../components/Message';
import Button from '../../components/Button';

const validationSchema = z.object({
  name: z.string().nonempty('Required'),
  email: z.string().email('Invalid email').nonempty('Required'),
  phone: z.string().min(10).max(10).nonempty('Required'),
  password: z.string().min(8),
});

export function StaffRegistration() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [token, setToken] = useLocalStorage('authToken');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: { name: '', phone: '', email: '', password: '' },
  });

  const { mutate, isLoading } = useMutation(staffSignup, {
    onSuccess: () => {
      navigate('/staff/login');
    },
    onError: () => {
      setMessage({
        type: 'fail',
        description: 'Looks like this account already exists.',
      });
    },
    onSettled: () => {},
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  useEffect(() => {
    if (token) {
      navigate('/overview');
    }

  }, []);

  return (
    <>
      <div className="container">
        <h1 className="mx-4 mb-4">Staff Registration</h1>{' '}
        {message && (
          <Message type={message.type} message={message.description} />
        )}
        <form className="">
          <div className="">
            <TextInput
              label="Name"
              error={errors?.name?.message}
              {...register('name')}
            />
            <TextInput
              label="Email"
              error={errors?.email?.message}
              {...register('email')}
            />
            <TextInput
              label="Phone"
              maxLength={10}
              error={errors?.phone?.message}
              {...register('phone')}
            />
            <TextInput
              label="Password"
              type="password"
              error={errors?.password?.message}
              {...register('password')}
            />
            <div className="mt-2 d-flex justify-content-end me-4">
              Already have an account?
              <a href="/" className="ms-1">
                Login
              </a>
            </div>
            <Button
              type="submit"
              title="sign up"
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </form>
      </div>
    </>
  );
}
