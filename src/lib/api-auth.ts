// Tiny helper around `auth()` that returns just the user id (or null).
// With the next-auth.d.ts module augmentation, `session.user.id` is now
// typed as `string`, so callers no longer need the
// `(session?.user as { id?: string }).id` cast.

import { auth } from "@/lib/auth";

export async function getAuthedUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
