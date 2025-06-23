'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormData = {
  name: string;
  email: string;
  password: string;
  referralCode: string;
};

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const result = await res.json();
      setServerError(result.error || 'Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register('name', { required: true })}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">Name is required</p>}

        <input
          {...register('email', { required: true })}
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">Email is required</p>}

        <input
          {...register('password', { required: true, minLength: 6 })}
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        {errors.password && <p className="text-red-500 text-sm">Password must be at least 6 characters</p>}

        <input
          {...register('referralCode')}
          placeholder="Referral Code (optional)"
          className="w-full p-2 border rounded"
        />

        {serverError && <p className="text-red-500">{serverError}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
