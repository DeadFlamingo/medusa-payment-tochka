import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { TochkaOptionsPatch } from "../../lib/tochka-options"
import type { TochkaOptionsResponse } from "./lib/copy"
import { sdk } from "./lib/sdk"

export const tochkaOptionsQueryKey = ["tochka-options"] as const

export const useTochkaOptions = () => {
  return useQuery({
    queryKey: tochkaOptionsQueryKey,
    queryFn: () =>
      sdk.client.fetch<TochkaOptionsResponse>("/admin/tochka/options"),
  })
}

export const useUpdateTochkaOptions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TochkaOptionsPatch) =>
      sdk.client.fetch<TochkaOptionsResponse>("/admin/tochka/options", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(tochkaOptionsQueryKey, data)
    },
  })
}
