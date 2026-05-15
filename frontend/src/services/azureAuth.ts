interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

export const authenticateWithAzureAD = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const clientId = process.env.REACT_APP_AZURE_CLIENT_ID || '';
  const tenantId = process.env.REACT_APP_AZURE_AUTHORITY?.split('/').pop() || '';
  
  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('scope', 'User.Read openid profile email');
  params.append('username', email);
  params.append('password', password);
  params.append('grant_type', 'password');
  
  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    const data: AuthResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error_description || data.error || 'Authentication failed');
    }
    
    return data;
  } catch (error) {
    console.error('Azure AD authentication error:', error);
    throw error;
  }
};

export const getUserInfo = async (accessToken: string) => {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw error;
  }
};
