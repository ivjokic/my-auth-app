import React, { useState } from 'react';
import { API_URL } from '../constants';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

type formDataType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
function Registration() {
  const [formData, setFormData] = useState<formDataType>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  async function registerUser(e: React.SyntheticEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors || { general: result.message });
        return;
      } else {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        navigate('/home');
      }
    } catch {
      setErrors({ general: 'Could not reach the server.' });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='container py-5'>
      <div className='row justify-content-center'>
        <div className='col-12 col-md-8 col-lg-5'>
          <div className='card shadow-sm'>
            <div className='card-body p-4'>
              <h1
                id='register-heading'
                className='card-title mb-4 text-center h2'
              >
                Register
              </h1>
              {errors.general && (
                <div className='alert alert-danger' role='alert'>
                  {errors.general}
                </div>
              )}
              <form onSubmit={registerUser} aria-labelledby='register-heading'>
                <div className='mb-3'>
                  <label htmlFor='firstName' className='form-label'>
                    First name
                  </label>
                  <input
                    id='firstName'
                    type='text'
                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                    placeholder='Your first name'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete='given-name'
                    required
                    aria-required='true'
                  />
                  {errors.firstName && (
                    <div className='invalid-feedback'>{errors.firstName}</div>
                  )}
                </div>
                <div className='mb-3'>
                  <label htmlFor='lastName' className='form-label'>
                    Last name
                  </label>
                  <input
                    id='lastName'
                    type='text'
                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                    placeholder='Your last name'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete='family-name'
                    required
                    aria-required='true'
                  />
                  {errors.lastName && (
                    <div className='invalid-feedback'>{errors.lastName}</div>
                  )}
                </div>
                <div className='mb-3'>
                  <label htmlFor='email' className='form-label'>
                    Email
                  </label>
                  <input
                    id='email'
                    type='email'
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder='you@example.com'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete='email'
                    required
                    aria-required='true'
                  />
                  {errors.email && (
                    <div className='invalid-feedback'>{errors.email}</div>
                  )}
                </div>
                <div className='mb-3'>
                  <label htmlFor='password' className='form-label'>
                    Password
                  </label>
                  <input
                    id='password'
                    type='password'
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder='At least 6 characters'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete='new-password'
                    required
                    aria-required='true'
                  />
                  {errors.password && (
                    <div className='invalid-feedback'>{errors.password}</div>
                  )}
                </div>
                <button
                  type='submit'
                  className='btn btn-primary w-100 mt-2'
                  disabled={loading}
                >
                  {loading ? 'Registering..' : 'Register'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
