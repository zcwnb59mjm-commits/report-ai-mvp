import type { User as SupabaseUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { linkStripeSubscriptionToUserByEmail } from "@/lib/user-access/link-stripe-subscription";

export type AppUser = {
  supabaseUser: SupabaseUser;
  prismaUser: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    usageCount: number;
    subscriptionActive: boolean;
    lifetimeUnlocked: boolean;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  };
};

function getProfileFromSupabaseUser(user: SupabaseUser) {
  const metadata = user.user_metadata ?? {};

  return {
    name:
      (typeof metadata.full_name === "string" && metadata.full_name) ||
      (typeof metadata.name === "string" && metadata.name) ||
      null,
    image:
      (typeof metadata.avatar_url === "string" && metadata.avatar_url) || null,
    emailVerified: user.email_confirmed_at
      ? new Date(user.email_confirmed_at)
      : null,
  };
}

async function upsertPrismaUserFromSupabase(user: SupabaseUser) {
  const email = user.email;

  if (!email) {
    throw new Error("Supabase user is missing email.");
  }

  const profile = getProfileFromSupabaseUser(user);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ supabaseUserId: user.id }, { email }],
    },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        supabaseUserId: user.id,
        email,
        name: profile.name ?? undefined,
        image: profile.image ?? undefined,
        emailVerified: profile.emailVerified ?? undefined,
      },
    });
  }

  const created = await prisma.user.create({
    data: {
      supabaseUserId: user.id,
      email,
      name: profile.name,
      image: profile.image,
      emailVerified: profile.emailVerified,
    },
  });

  await linkStripeSubscriptionToUserByEmail(email);

  return created;
}

export async function getAppUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const prismaUser = await upsertPrismaUserFromSupabase(user);

  return {
    supabaseUser: user,
    prismaUser: {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      image: prismaUser.image,
      usageCount: prismaUser.usageCount,
      subscriptionActive: prismaUser.subscriptionActive,
      lifetimeUnlocked: prismaUser.lifetimeUnlocked,
      stripeCustomerId: prismaUser.stripeCustomerId,
      stripeSubscriptionId: prismaUser.stripeSubscriptionId,
    },
  };
}

export async function requireAppUser(): Promise<AppUser> {
  const appUser = await getAppUser();

  if (!appUser) {
    throw new Error("Unauthorized");
  }

  return appUser;
}
