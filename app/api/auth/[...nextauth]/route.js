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
        // Dummy user list sementara (bisa diganti dari DB)
        const users = [
          { id: "1", username: "admin", password: "1234", role: "OWNER" },
          { id: "2", username: "staff", password: "123", role: "KARYAWAN" },
        ];

        const user = users.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (!user) return null;

        // Kembalikan data user yang disimpan ke JWT
        return {
          id: user.id,
          username: user.username,
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
      // Ketika user login, tambahkan data user ke token
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Masukkan token.id & token.username ke dalam session.user
      session.user = {
        id: token.id,
        username: token.username,
        role: token.role,
      };
      return session;
    },
  },

  pages: {
    signIn: "/auth",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
