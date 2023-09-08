import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// {
//   user: {
//     name: '_codezera',
//     email: 'bhaveshy737@gmail.com',
//     image: 'https://cdn.discordapp.com/avatars/503841118883020816/74ecb70d3edf53aff55b716e4de54ce0.png'
//   }
// }

export interface SessionType {
  name: String;
  email: String;
  image: String;
}

export async function getSession() {
  const session = await getServerSession(authOptions);

  return session;
}

export async function getUser() {
  const session = await getSession();

  const user = await prisma.user.findFirst({
    where: {
      email: session?.user?.email,
    },
  });

  return user;
}

export async function getApiKey() {
  const session = await getSession();

  const user = await prisma.user.findFirst({
    where: {
      email: String(session?.user?.email),
    },
  });

  return user?.api_key;
}
