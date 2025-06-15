// Replace your page.tsx with this enhanced debugging version:

import SearchResultsTemplate from './template'

export default async function SearchPage({ searchParams, params }: any) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  console.log('🚀 [PAGE] SearchPage component called')
  console.log('🚀 [PAGE] Raw searchParams:', searchParams)
  console.log('🚀 [PAGE] Raw params:', params)
  console.log('🚀 [PAGE] Resolved searchParams:', resolvedSearchParams)
  console.log('🚀 [PAGE] Resolved params:', resolvedParams)
  
  // Test if searchParams is properly resolved
  console.log('🚀 [PAGE] Query from searchParams:', resolvedSearchParams?.q)
  console.log('🚀 [PAGE] CountryCode from params:', resolvedParams?.countryCode)
  
  // Test serialization of what we're passing
  try {
    const testProps = {
      searchParams: resolvedSearchParams,
      countryCode: resolvedParams.countryCode
    }
    JSON.stringify(testProps)
    console.log('✅ [PAGE] Props are serializable:', testProps)
  } catch (error) {
    console.error('❌ [PAGE] Props are NOT serializable:', error)
  }
  
  console.log('🚀 [PAGE] About to render SearchResultsTemplate...')
  
  return (
    <SearchResultsTemplate 
      searchParams={resolvedSearchParams}
      countryCode={resolvedParams.countryCode}
    />
  )
}