type UseFetchOptions<DataT> = {
  key?: string
  method?: string
  params?: Record<string, any>
  body?: Record<string, any>
  headers?: Record<string, any>
  baseURL?: string
  server?: boolean
  lazy?: boolean
  default?: () => DataT
  transform?: (input: DataT) => DataT
  pick?: string[]
  watch?: any
  initialCache?: boolean
}

export const useRestAPI = () => {
  const config = useRuntimeConfig()

  const defaultOptions: UseFetchOptions<any> = {
    baseURL: config.public.API_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  }

  return {
    listBusinesses: listBusinesses.bind({}, defaultOptions),
  }
}

const withAuthToken = (options: UseFetchOptions<any>, token = '') => {
  const { $auth } = useNuxtApp()
  token = $auth.isLoggedIn ? `JWT ${$auth.idToken.value}` : undefined

  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token,
    },
  }
}

const listBusinesses = (
  defaultOptions: UseFetchOptions<any>,
  params: Record<string, any> = {},
) => {
  return useFetch(
    '/users/',
    withAuthToken({
      params,
      method: 'GET',
      transform: response => ({
        nextUrl: response.next,
        businesses: response.results
      }),
      ...defaultOptions,
    }),
  )
}
