import SearchResultsTemplate from './template'

export default async function SearchPage(props: any) {
  const params = props.params instanceof Promise 
    ? await props.params 
    : props.params
    
  const searchParams = props.searchParams instanceof Promise
    ? await props.searchParams
    : props.searchParams

  const countryCode = params?.countryCode || "in"

  return (
    <SearchResultsTemplate
      searchParams={searchParams ?? {}}
      countryCode={countryCode}
    />
  )
}