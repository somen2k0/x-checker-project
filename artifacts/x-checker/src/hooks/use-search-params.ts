import { useSearch } from "wouter";

export function useSearchParams(): URLSearchParams {
  const search = useSearch();
  return new URLSearchParams(search);
}
