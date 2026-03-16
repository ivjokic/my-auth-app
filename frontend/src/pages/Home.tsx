import { useEffect, useState } from 'react'
import { API_URL } from '../constants'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'

type User = {
  firstName: string
  lastName: string
}

function Home() {
  const [user, setUser] = useState<User>({ firstName: '', lastName: '' })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  async function getMe() {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        setErrors(result.errors || [result.message])
        navigate('/')
        return
      }

      setUser(result.user)
    } catch {
      setErrors(['Could not reach the server'])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getMe()
  }, [])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <div className='container py-5'>
        <div className='row justify-content-center'>
          <div className='col-12 col-md-8 col-lg-5'>
            <div className='card shadow-sm'>
              <div className='card-body p-4'>
                <h1 className='h2 mb-4'>
                  Welcome {user.firstName} {user.lastName}!
                </h1>
                <button className='btn btn-outline-danger' onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
