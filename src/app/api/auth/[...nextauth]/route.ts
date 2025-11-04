import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  pages: {
    signIn: "/auth/signup",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account, user }) {
      // ✅ When user first signs in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token; // ✅ Add this line
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }

      // ✅ Include user ID if available
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      // ✅ Expose tokens to the client session
      return {
        ...session,
        accessToken: token.accessToken as string | undefined,
        refreshToken: token.refreshToken as string | undefined,
        idToken: token.idToken as string | undefined, // ✅ Add this line
        provider: token.provider as string | undefined,
        user: {
          ...session.user,
          id: token.id as string | undefined,
        },
      };
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/auth/socialCallback`;
    },
  },

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
