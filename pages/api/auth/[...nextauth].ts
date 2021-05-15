import { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import Providers from "next-auth/providers";
import Adapters from "next-auth/adapters";
import prisma from "../../../lib/prisma";

const options = {
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
  secret: process.env.SECRET,
  callbacks: {
    signIn: async (profile, account, metadata) => {
      const res = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${account.accessToken}`,
        },
      });
      const emails = await res.json();
      if (!emails || emails.length === 0) {
        return;
      }
      const sortedEmails = emails.sort((a, b) => b.primary - a.primary);
      profile.email = sortedEmails[0].email;
      await prisma.user.update({
        where: {
          id: profile.id
        },
        data: {
          ...profile
        }
      })
      return true
    },
  },
};

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;