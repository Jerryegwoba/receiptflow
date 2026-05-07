"use server";

import { createServerClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validators/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type AuthError = {
  error: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
} | null;

export async function signup(
  _prevState: AuthError,
  formData: FormData
): Promise<AuthError> {
  const supabase = await createServerClient();

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath("/", "layout");
  redirect("/receipts");
}

export async function login(
  _prevState: AuthError,
  formData: FormData
): Promise<AuthError> {
  const supabase = await createServerClient();

  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: { _form: [error.message] } };
  }

  revalidatePath("/", "layout");
  redirect("/receipts");
}

export async function logout() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
