import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) {
          throw new Error("Invalid email or password");
        }

        const isAdmin = user.email === "hadikarimi@gmail.com" || user.isAdmin || false;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isAdmin: isAdmin,
        };
      },
    }),
  ],
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // When user first logs in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.isAdmin = user.email === "hadikarimi@gmail.com" || user.isAdmin || false;
        console.log("✅ JWT callback - User logged in:", {
          id: token.id,
          email: token.email,
          name: token.name,
        });
      }
      
      // When session is updated
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.image = session.image;
        if (session.email) token.email = session.email;
        if (session.isAdmin !== undefined) token.isAdmin = session.isAdmin;
        console.log("🔄 JWT callback - Session updated:", token);
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id;
        session.user.email = token.email || session.user.email;
        session.user.name = token.name || session.user.name;
        session.user.image = token.image || session.user.image;
        session.user.isAdmin = token.isAdmin || false;
        console.log("✅ Session callback - Session created:", {
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
        });
      } else {
        console.error("❌ Session callback - Token missing or invalid:", {
          hasToken: !!token,
          tokenId: token?.id,
          token: token,
        });
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
