import { validateToken } from '@/services/authApi';
import { RootStore } from '@/stores/rootStore';
import { UserInput } from '@/stores/userStore';

export interface TokenValidationResult {
  isValid: boolean;
  shouldRedirect: boolean;
  redirectPath?: string;
  newToken?: string;
  user?: UserInput;
  error?: string;
}

/**
 * Performs token validation and handles the response
 * @param rootStore - The root store instance
 * @param currentPath - Current pathname to determine if redirect is needed
 * @returns TokenValidationResult with validation status and actions to take
 */
export const performTokenValidation = async (
  rootStore: RootStore,
  currentPath?: string
): Promise<TokenValidationResult> => {
  // Skip token validation if we're on the auth pages, home page, or root
  if (currentPath === '/' || currentPath === '/auth' || currentPath === '/auth/success' || currentPath === '/home') {
    console.log('User is on auth/home/root page, skipping token validation');
    return {
      isValid: true,
      shouldRedirect: false
    };
  }

  // Check if we have a token in localStorage
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.log('No token found, redirect to auth required');
    return {
      isValid: false,
      shouldRedirect: true,
      redirectPath: '/auth',
      error: 'No authentication token found'
    };
  }

  try {
    console.log('Performing token validation...');
    const validationResult = await validateToken();
    console.log('Token validation result:', validationResult);

    if (!validationResult.isValid) {
      // Token is invalid, remove it and redirect to auth
      localStorage.removeItem('access_token');
      console.log('Token is invalid, redirect to auth required');
      return {
        isValid: false,
        shouldRedirect: true,
        redirectPath: '/auth',
        error: 'Authentication token is invalid'
      };
    }

    // Token is valid, handle the response
    const newToken = validationResult.newToken;
    if (newToken) {
      // Replace token in localStorage with new one
      localStorage.setItem('access_token', newToken);
      console.log('Token refreshed successfully');
    }

    if (validationResult.user) {
      // Set user in user store
      rootStore.userStore.setUser(validationResult.user);
      console.log('User data updated in store');
    }

    return {
      isValid: true,
      shouldRedirect: false,
      newToken: newToken,
      user: validationResult.user
    };

  } catch (error) {
    console.error('Token validation failed:', error);
    // If validation fails, remove token and redirect to auth
    localStorage.removeItem('access_token');
    return {
      isValid: false,
      shouldRedirect: true,
      redirectPath: '/auth',
      error: error instanceof Error ? error.message : 'Token validation failed'
    };
  }
};

/**
 * Validates and processes a new token (used during login/success)
 * @param token - The new token to validate
 * @param rootStore - The root store instance
 * @returns TokenValidationResult with validation status
 */
export const validateAndProcessNewToken = async (
  token: string,
  rootStore: RootStore
): Promise<TokenValidationResult> => {
  try {
    // Store the token first
    localStorage.setItem('access_token', token);
    
    // Verify token was stored correctly
    const storedToken = localStorage.getItem('access_token');
    if (storedToken !== token) {
      throw new Error('Failed to store authentication token');
    }

    // Perform token validation to get user data
    const validationResult = await validateToken();
    
    if (!validationResult.isValid) {
      localStorage.removeItem('access_token');
      return {
        isValid: false,
        shouldRedirect: true,
        redirectPath: '/auth',
        error: 'New token is invalid'
      };
    }

    // Update user data in store
    if (validationResult.user) {
      rootStore.userStore.setUser(validationResult.user);
    }

    // Set authentication state
    rootStore.authStore.setAuthenticated(true);

    return {
      isValid: true,
      shouldRedirect: true,
      redirectPath: '/dashboard',
      user: validationResult.user,
      newToken: validationResult.newToken
    };

  } catch (error) {
    console.error('New token validation failed:', error);
    localStorage.removeItem('access_token');
    return {
      isValid: false,
      shouldRedirect: true,
      redirectPath: '/auth',
      error: error instanceof Error ? error.message : 'Failed to process authentication token'
    };
  }
};
