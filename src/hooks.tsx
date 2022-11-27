import {useState, useEffect} from 'react'
import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type QueryKey,
  type QueryFunction,
  type UseQueryResult,
} from '@tanstack/react-query'
import api from '@/external/api/api'

import type {ChampionType, UserType, RuneType, BasicChampionWithImageType} from '@/external/types'

export function useDebounce<V>(value: V, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay], // Only re-call effect if value or delay changes
  )
  return debouncedValue
}

export function useUser(): UserType | null {
  const userQuery = useQuery(
    ['my-user'],
    api.player.getMyUser,
    {retry: false, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 10}
  )
  return userQuery.data || null
}

export function useItem({id, major, minor}: {id: number, major: number|string, minor: number|string}) {
  return useQuery(
    ['item', id, major, minor],
    () => api.data.getItem({item_id: id, major, minor}).then(response => response.data.data),
    {refetchOnMount: false, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 10}
  )
}

export function useChampions(): Record<number, ChampionType> {
  const championQuery = useQuery(
    ['champions'],
    () => api.data.getChampions().then((x) => x.data.data),
    {retry: true, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 10},
  )
  const champions: Record<number, ChampionType> = {}
  for (const champ of championQuery.data || []) {
    champions[champ.key] = champ
  }
  return champions
}

export function useBasicChampions(): Record<number, BasicChampionWithImageType> {
  const championQuery = useQuery(
    ['basic-champions'],
    () => api.data.basicChampions().then((x) => x.results),
    {retry: true, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 10},
  )
  const champions: Record<number, BasicChampionWithImageType> = {}
  for (const champ of championQuery.data || []) {
    champions[champ.key] = champ
  }
  return champions
}

export function useRunes(version: string) {
  const runesQuery = useQuery(
    ['runes', version],
    () => api.data.getRunes({version}),
    {retry: false, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 60}
  )
  const runes: Record<number, RuneType> = {}
  for (const rune of runesQuery.data || []) {
    runes[rune._id] = rune
  }
  return runes
}

export function useQueryWithPrefetch<T>(
  key: QueryKey,
  request: QueryFunction<T>,
  prefetchKey: QueryKey,
  prefetchRequest: QueryFunction<T>,
  options: UseQueryOptions<T>,
): UseQueryResult<T, unknown> {
  const queryClient = useQueryClient()
  const matchQuery = useQuery(key, request, options)
  // prefetch next page
  queryClient.prefetchQuery(prefetchKey, prefetchRequest, {
    retry: options.retry,
    staleTime: options.staleTime,
  })
  return matchQuery
}
