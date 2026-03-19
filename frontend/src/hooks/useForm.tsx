import { useState } from 'react'

export function useForm<T>(initialValues: T) {
  const [formData, setFormData] = useState<T>(initialValues)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return {
    loading,
    setLoading,
    errors,
    setErrors,
    formData,
    setFormData,
    handleChange,
  }
}
