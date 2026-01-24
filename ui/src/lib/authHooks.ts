"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { LoginResponse, SignupResponse, UserRead } from "@/lib/authTypes";
import axios from "axios";

export function useMeQuery() {
  return useQuery<UserRead | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<UserRead>("/auth/me");
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          return null;
        }
        throw err;
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { email: string; password: string }) => {
      const res = await apiClient.post<LoginResponse>("/auth/login", vars);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ message: string }>("/auth/logout");
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useSignupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      email: string;
      password: string;
      full_name?: string;
    }) => {
      const res = await apiClient.post<SignupResponse>("/auth/signup", vars);
      return res.data;
    },
    // Note: signup does not set a cookie currently; the page can chain signup -> login.
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
