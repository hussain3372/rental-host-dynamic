// import Cookies from "js-cookie";
// // utils/jwtUtils.ts
// export interface DecodedToken {
//   exp: number;
//   iat: number;
//   [key: string]: any;
// }

// export class JWTManager {
//   // Decode JWT token without verification (client-side)
//   static decodeToken(token: string): DecodedToken | null {
//     try {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const jsonPayload = decodeURIComponent(
//         atob(base64)
//           .split('')
//           .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//           .join('')
//       );
//       return JSON.parse(jsonPayload);
//     } catch (error) {
//       console.error('Failed to decode token:', error);
//       return null;
//     }
//   }

//   // Check if token is expired
//   static isTokenExpired(token: string): boolean {
//     const decoded = this.decodeToken(token);
//     if (!decoded || !decoded.exp) return true;

//     const currentTime = Date.now() / 1000;
//     return decoded.exp < currentTime;
//   }

//   // Get time until expiration in milliseconds
//   static getTimeUntilExpiry(token: string): number {
//     const decoded = this.decodeToken(token);
//     if (!decoded || !decoded.exp) return 0;

//     const currentTime = Date.now() / 1000;
//     return (decoded.exp - currentTime) * 1000;
//   }

//   // Remove token from cookies and clear user data
//   static logout(): void {
//     // Remove token from cookies
//     Cookies.remove('accessToken', { path: '/' });
    
//     // Clear user data from localStorage
//     localStorage.removeItem('firstname');
//     localStorage.removeItem('lastname');
//     localStorage.removeItem('email');
//     localStorage.removeItem('userMfaEnabled');
//     localStorage.removeItem('userRole');
    
//     // Redirect to login page
//     if (typeof window !== 'undefined') {
//       window.location.href = '/auth/login';
//     }
//   }
// }

import Cookies from "js-cookie";

// utils/jwtUtils.ts
export interface DecodedToken {
  exp: number;
  iat: number;
  [key: string]: unknown; // Changed from any to unknown for better type safety
}

export class JWTManager {
  // Decode JWT token without verification (client-side)
  static decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  // Get time until expiration in milliseconds
  static getTimeUntilExpiry(token: string): number {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return 0;

    const currentTime = Date.now() / 1000;
    return (decoded.exp - currentTime) * 1000;
  }

  // Remove token from cookies and clear user data
  static logout(): void {
    // Remove token from cookies
    Cookies.remove('accessToken', { path: '/' });
    
    // Clear user data from localStorage
    localStorage.removeItem('firstname');
    localStorage.removeItem('lastname');
    localStorage.removeItem('email');
    localStorage.removeItem('userMfaEnabled');
    localStorage.removeItem('userRole');
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
}