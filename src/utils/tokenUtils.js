// Token utility functions
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

export const clearExpiredTokens = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (accessToken && isTokenExpired(accessToken)) {
    console.log('Clearing expired access token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return true;
  }
  
  return false;
};

export const setupTokenCleanup = () => {
  // Check for expired tokens on page load
  clearExpiredTokens();
  
  // Check for expired tokens every 5 minutes
  setInterval(clearExpiredTokens, 5 * 60 * 1000);
  
  // Handle browser close/tab close
  window.addEventListener('beforeunload', () => {
    // Don't clear tokens on browser close to allow for refresh token usage
    // The token expiration check will handle this
  });
  
  // Handle page visibility change (when user switches tabs or minimizes)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Check for expired tokens when user returns to the tab
      clearExpiredTokens();
    }
  });
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error parsing token expiration:', error);
    return null;
  }
};

export const getTokenTimeUntilExpiration = (token) => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return 0;
  
  return expirationTime.getTime() - Date.now();
};
