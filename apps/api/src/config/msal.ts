import { ConfidentialClientApplication } from '@azure/msal-node';

export const MSAL_SCOPES = ['openid', 'profile', 'email', 'User.Read'];

let _msalClient: ConfidentialClientApplication | null = null;

function getMsalClient(): ConfidentialClientApplication {
  if (_msalClient) return _msalClient;
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
  if (!clientId || !tenantId || !clientSecret) {
    throw new Error('Azure AD credentials not configured. Set AZURE_AD_CLIENT_ID, AZURE_AD_TENANT_ID, AZURE_AD_CLIENT_SECRET in .env');
  }
  _msalClient = new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret,
    },
  });
  return _msalClient;
}

export function getAuthCodeUrl() {
  return getMsalClient().getAuthCodeUrl({
    scopes: MSAL_SCOPES,
    redirectUri: process.env.AZURE_AD_REDIRECT_URI!,
  });
}

export function acquireTokenByCode(code: string) {
  return getMsalClient().acquireTokenByCode({
    code,
    scopes: MSAL_SCOPES,
    redirectUri: process.env.AZURE_AD_REDIRECT_URI!,
  });
}
