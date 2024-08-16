import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { staffLogin } from '../../utils/api';
import Message from '../../components/Message';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { useLocalStorage } from '../../hooks/useLocalStage';

const validationSchema = z.object({
  email: z.string().email('Invalid email').nonempty('Required'),
  // phone: z.string().min(10).max(10).nonempty('Required'),
  password: z.string().min(8).nonempty('Required'),
});

export function StaffLogin() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [token, setToken] = useLocalStorage('authToken');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: { name: '', phone: '', email: '', password: '' },
  });

  const { mutate, isLoading } = useMutation(staffLogin, {
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('authToken', JSON.stringify(data.token));

      navigate('/overview');
    },
    onError: () => {
      setMessage({
        type: 'fail',
        description: 'No account found with given credentials.',
      });
    },
    onSettled: () => { },
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
      <div className="container p-4">
        <h1 className="mx-4">Staff Login</h1>
        {message && (
          <Message type={message.type} message={message.description} />
        )}
        <form className="">
          <TextInput
            label="Email"
            error={errors?.email?.message}
            {...register('email')}
          />
          <TextInput
            label="Password"
            type="password"
            error={errors?.password?.message}
            {...register('password')}
          />
          <div className="d-flex justify-content-end me-4">
            <a href="/signup">Create an account</a>
          </div>
          <Button
            type="submit"
            title="submit"
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
          />
        </form>
      </div>
    </>
  );
}
