import { API_URL } from '../constants'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import { z } from 'zod'
import {
  registerSchema,
  type RegisterFormData,
} from '../schemas/registerSchema'
import { useForm } from '../hooks/useForm'

function Registration() {
  const { formData, loading, setLoading, errors, setErrors, handleChange } =
    useForm<RegisterFormData>({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    })

  const navigate = useNavigate()

  async function registerUser(e: React.SyntheticEvent) {
    e.preventDefault()

    setErrors({})

    const parsed = registerSchema.safeParse(formData)

    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors

      setErrors({
        firstName: fieldErrors.firstName?.[0] || '',
        lastName: fieldErrors.lastName?.[0] || '',
        email: fieldErrors.email?.[0] || '',
        password: fieldErrors.password?.[0] || '',
        confirmPassword: fieldErrors.confirmPassword?.[0] || '',
      })

      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        setErrors(result.errors || { general: result.message })
        return
      }
      localStorage.setItem('user', JSON.stringify(result.user))
      localStorage.setItem('token', result.token)
      navigate('/home')
    } catch {
      setErrors({ general: 'Could not reach the server.' })
    } finally {
      setLoading(false)
    }
  }

  const passwordDoNotMatch =
    formData.confirmPassword.length > 0 &&
    formData.confirmPassword !== formData.password

  if (loading) {
    return <Loader />
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
              <form
                onSubmit={registerUser}
                noValidate
                aria-labelledby='register-heading'
              >
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
                <div className='mb-3'>
                  <label htmlFor='confirmPassword' className='form-label'>
                    Confirm Password
                  </label>
                  <input
                    id='confirmPassword'
                    type='password'
                    className={`form-control ${errors.confirmPassword || passwordDoNotMatch ? 'is-invalid' : ''}`}
                    placeholder='Repeat your password'
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete='new-password'
                    required
                    aria-required='true'
                  />
                  {errors.confirmPassword && (
                    <div className='invalid-feedback'>
                      {errors.confirmPassword}
                    </div>
                  )}
                  {!errors.confirmPassword && passwordDoNotMatch && (
                    <div className='invalid-feedback'>
                      {'Passwords do not match'}
                    </div>
                  )}
                </div>
                <button
                  type='submit'
                  className='btn btn-primary w-100 mt-2'
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Registration
