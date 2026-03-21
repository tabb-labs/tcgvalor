import { useEffect, useState } from 'react'
import { fetchApi } from './fetchApi'

export type UseApiArgs = {
  path: string
  shouldMakeRequest?: boolean
}

export type UseApiReturn<T> = {
  data: T | null
  isLoading: boolean
  errors: string[] | null
  refresh: () => void
}

export const useApiController = <T>({ path, shouldMakeRequest = true }: UseApiArgs) => {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<string[] | null>(null)

  const makeRequest = () => {
    if (!shouldMakeRequest) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    fetchApi<T>({ path })
      .then((res) => {
        if (res.isSuccessful) {
          setData(res.data)
        } else {
          setErrors(res.errors)
        }
      })
      .catch((err: unknown) => {
        console.error(err)
        setErrors(['Unexpected Error'])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return { data, isLoading, errors, makeRequest }
}

export const useApi = <T>(args: UseApiArgs): UseApiReturn<T> => {
  const { data, isLoading, errors, makeRequest } = useApiController<T>(args)

  useEffect(makeRequest, [args.shouldMakeRequest, args.path])

  return { data, isLoading, errors, refresh: makeRequest }
}
