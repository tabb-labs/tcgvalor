import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

export type UseRouterReturn = {
  navigateTo: (path: string) => void
  getParam: (key: string) => string | null
  getSearchParam: (key: string) => string | null
  setSearchParams: (params: Record<string, string>) => void
  hostname: string
  pathname: string
}

export const useRouter = (): UseRouterReturn => {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams, setSearchParamsRaw] = useSearchParams()

  const navigateTo = (path: string) => {
    navigate(path)
  }

  const getParam = (key: string): string | null => {
    return params[key] ?? null
  }

  const getSearchParam = (key: string): string | null => {
    return searchParams.get(key)
  }

  const setSearchParams = (newParams: Record<string, string>) => {
    setSearchParamsRaw(newParams)
  }

  return {
    navigateTo,
    getParam,
    getSearchParam,
    setSearchParams,
    hostname: location.hostname,
    pathname: location.pathname,
  }
}
