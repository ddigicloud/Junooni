// utils/tokenUtils.ts - JWT Token Analysis Utilities

/**
 * Decode JWT token payload
 */
export const decodeJWTToken = (token: string) => {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }

    // Decode the payload (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padding = base64.length % 4;
    const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
    
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJWTToken(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
   } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    return true;
  }
};

/**
 * Analyze token to determine vendor status
 */
export const analyzeVendorToken = (token: string) => {
  try {
    const payload = decodeJWTToken(token);
    
    if (!payload) {
     return {
        isValid: false,
        hasVendorData: false,
        hasAdminData: false,
        tokenType: 'invalid',
        vendorId: null,
        adminData: null,
        isExpired: true,
        error: 'Unable to decode token'
      };
    }

    console.log('🔍 Token payload analysis:', payload);

    // Check for vendor data in token
    const hasVendorData = !!(
      payload.vendor_id || 
      payload.vendor || 
      payload.sub?.includes('vendor') ||
      payload.user_type === 'vendor'
    );

    // Check for admin data in token - multiple possible structures
    const hasAdminData = !!(
      payload.admin || 
      payload.admin_data ||
      payload.is_admin ||
      payload.roles?.includes('admin') ||
      payload.permissions?.includes('admin') ||
      (payload.vendor && payload.vendor.admin) ||
      payload.vendor_admin ||
      payload.admin_id
    );

    // Extract vendor ID
    const vendorId = payload.vendor_id || 
                    payload.vendor?.id || 
                    payload.sub || 
                    payload.id;

    // Extract admin data
    const adminData = payload.admin || 
                     payload.admin_data || 
                     payload.vendor?.admin || 
                     null;

    // Determine token type
    let tokenType: 'vendor-only' | 'vendor-admin' | 'admin-only' | 'unknown';
    
    if (hasVendorData && hasAdminData) {
      tokenType = 'vendor-admin';
    } else if (hasVendorData && !hasAdminData) {
      tokenType = 'vendor-only';
    } else if (!hasVendorData && hasAdminData) {
      tokenType = 'admin-only';
    } else {
      tokenType = 'unknown';
    }

    const result = {
      isValid: true,
      hasVendorData,
      hasAdminData,
      tokenType,
      vendorId,
      adminData,
      fullPayload: payload,
      isExpired: isTokenExpired(token)
    };

    console.log('📊 Token analysis result:', result);
    return result;

} catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('❌ Error analyzing token:', error);
    return {
      isValid: false,
      hasVendorData: false,
      hasAdminData: false,
      tokenType: 'invalid' as const,
      vendorId: null,
      adminData: null,
      isExpired: true,
      error: error.message
    };
  }
};

/**
 * Hook for token-based routing decisions
 */
export const useTokenRouting = () => {
  const analyzeAndRoute = (token: string) => {
    const analysis = analyzeVendorToken(token);
    
    if (!analysis.isValid || analysis.isExpired) {
      return {
        shouldRedirect: true,
        redirectTo: '/sign-in',
        reason: 'Invalid or expired token'
      };
    }

    switch (analysis.tokenType) {
      case 'vendor-admin':
        // Complete vendor with admin privileges - go to dashboard
        return {
          shouldRedirect: true,
          redirectTo: '/dashboard',
          reason: 'Complete vendor profile with admin access'
        };
        
      case 'vendor-only':
        // Vendor without admin setup - needs onboarding
        return {
          shouldRedirect: true,
          redirectTo: '/onboarding',
          reason: 'Vendor profile incomplete - missing admin setup'
        };
        
      case 'admin-only':
        // Admin without vendor - unusual case
        return {
          shouldRedirect: true,
          redirectTo: '/admin-setup',
          reason: 'Admin account needs vendor profile setup'
        };
        
      default:
        // Unknown token type - needs authentication
        return {
          shouldRedirect: true,
          redirectTo: '/sign-in',
          reason: 'Unknown token type'
        };
    }
  };

  return { analyzeAndRoute };
};

// Example token payload structures for reference:

// VENDOR-ONLY TOKEN PAYLOAD:
/*
{
  "sub": "vendor_123",
  "vendor_id": "vendor_123",
  "email": "vendor@example.com",
  "user_type": "vendor",
  "iat": 1234567890,
  "exp": 1234567890,
  "vendor": {
    "id": "vendor_123",
    "name": "My Brand",
    "handle": "mybrand"
  }
}
*/

// VENDOR + ADMIN TOKEN PAYLOAD:
/*
{
  "sub": "vendor_123",
  "vendor_id": "vendor_123", 
  "email": "vendor@example.com",
  "user_type": "vendor",
  "is_admin": true,
  "iat": 1234567890,
  "exp": 1234567890,
  "vendor": {
    "id": "vendor_123",
    "name": "My Brand",
    "handle": "mybrand"
  },
  "admin": {
    "id": "admin_456",
    "first_name": "John",
    "last_name": "Doe",
    "email": "vendor@example.com"
  },
  "roles": ["vendor", "admin"],
  "permissions": ["vendor_manage", "admin_access"]
}
*/