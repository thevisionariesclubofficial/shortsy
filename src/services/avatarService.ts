import { apiClient } from './apiClient';

export async function uploadAvatar(image: string): Promise<string> {
  // image: base64 string (data:image/jpeg;base64,...)
  const res = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', { body: { image } });
  return res.avatarUrl;
}
