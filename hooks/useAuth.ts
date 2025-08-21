import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import authService from '../services/auth.service';
import {
  User,
  LoginData,
  RegistrationData,
  ZipCodeVerification,
} from '../types/auth.types';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (response) => {
      setIsAuthenticated(true);
      queryClient.setQueryData(['currentUser'], response.user);
      router.push('/');
    },
    onError: (error: Error) => {
      console.error('Login failed:', error.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegistrationData) => authService.register(data),
    onSuccess: (response) => {
      setIsAuthenticated(true);
      queryClient.setQueryData(['currentUser'], response.user);
      router.push('/');
    },
    onError: (error: Error) => {
      console.error('Registration failed:', error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear();
      router.push('/onboarding');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) =>
      authService.updateUser(userId, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
    },
  });

  const verifyZipCode = useCallback(async (zipCode: string): Promise<ZipCodeVerification> => {
    return authService.verifyZipCode(zipCode);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      router.push('/onboarding');
    }
  }, [router]);

  return {
    user,
    isAuthenticated,
    isLoadingUser,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    updateUser: updateUserMutation.mutate,
    verifyZipCode,
    refreshToken,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}