import { useMutation } from '@tanstack/react-query';
import { setPassword } from '../api/auth.api';

export function useSetPassword() {
  return useMutation({
    mutationFn: setPassword,
  });
}
