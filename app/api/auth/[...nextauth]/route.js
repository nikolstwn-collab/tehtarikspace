export const dynamic = 'force-dynamic'
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const users = [
          { id: "1", username: "admin", password: "1234", role: "OWNER" },
          { id: "2", username: "staff", password: "12345", role: "KARYAWAN" },
        ];

        const user = users.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (!user) return null;

        return {
          id: user.id,
          name: user.username,   // ⬅️ PENTING
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // ❗ JANGAN TIMPA session.user
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/auth",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };