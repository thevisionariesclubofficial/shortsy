import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_TOKENS_KEY = 'authTokens';
export const AUTH_FLAG_KEY = 'isAuthenticated';

export async function saveAuthTokens(tokens: any) {
  await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
}

export async function getAuthTokens() {
  const value = await AsyncStorage.getItem(AUTH_TOKENS_KEY);
  return value ? JSON.parse(value) : null;
}

export async function saveAuthFlag(flag: boolean) {
  await AsyncStorage.setItem(AUTH_FLAG_KEY, flag ? 'true' : 'false');
}

export async function getAuthFlag() {
  const value = await AsyncStorage.getItem(AUTH_FLAG_KEY);
  return value === 'true';
}

export async function clearAuthStorage() {
  await AsyncStorage.multiRemove([AUTH_TOKENS_KEY, AUTH_FLAG_KEY]);
}
