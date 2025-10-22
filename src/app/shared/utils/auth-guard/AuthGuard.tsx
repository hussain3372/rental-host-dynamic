// components/GlobalAuthManager.tsx
"use client";
import { useEffect } from 'react';
import Cookies from 'js-cookie';

export default function GlobalAuthManager() {
  useEffect(() => {
    const checkAllTokens = () => {
      // Define all possible tokens in your app
      const tokenNames = [
        'accessToken',
        'adminAccessToken',
      ];

      tokenNames.forEach(tokenName => {
        const token = Cookies.get(tokenName);
        
        if (token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            
            const isExpired = decoded.exp < Date.now() / 1000;
            
            if (isExpired) {
              // Remove expired token
              Cookies.remove(tokenName, { path: '/' });
              console.log(`Removed expired token: ${tokenName}`);
            } else {
              // Set auto delete timer for this token
              const timeUntilExpiry = (decoded.exp - Date.now() / 1000) * 1000;
              setTimeout(() => {
                Cookies.remove(tokenName, { path: '/' });
                console.log(`Auto-removed expired token: ${tokenName}`);
              }, timeUntilExpiry);
            }
          } catch  {
            // Invalid token format
            Cookies.remove(tokenName, { path: '/' });
          }
        }
      });
    };

    checkAllTokens();
  }, []);

  return null;
}