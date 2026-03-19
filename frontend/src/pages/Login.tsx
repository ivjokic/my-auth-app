import { API_URL } from '../constants'
import { useNavigate, Link } from 'react-router-dom'
import Loader from '../components/Loader'
import { z } from 'zod'
import { loginSchema, type LoginFormData } from '../schemas/loginSchema'
import { useForm } from '../hooks/useForm'

function Login() {
  const { formData, errors, setErrors, loading, setLoading, handleChange } =
    useForm<LoginFormData>({
      email: '',
      password: '',
    })

  const navigate = useNavigate()

  async function login(e: React.SyntheticEvent) {
    e.preventDefault()

    setErrors({})

    const parsed = loginSchema.safeParse(formData)

    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors

      setErrors({
        email: fieldErrors.email?.[0] || '',
        password: fieldErrors.password?.[0] || '',
      })

      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
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

  if (loading) {
    return <Loader />
  }

  return (
    <div className='container py-5'>
      <div className='row justify-content-center'>
        <div className='col-12 col-md-8 col-lg-5'>
          <div className='card shadow-sm'>
            <div className='card-body p-4'>
              <h1 id='login-heading' className='card-title mb-4 text-center h2'>
                Login
              </h1>
              {errors.general && (
                <div className='alert alert-danger' role='alert'>
                  {errors.general}
                </div>
              )}
              <form onSubmit={login} noValidate aria-labelledby='login-heading'>
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
                    placeholder='Your password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete='current-password'
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
                  Login
                </button>
                <p className='text-center mt-3 mb-0'>
                  Don't have an account? <Link to='/'>Register</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
