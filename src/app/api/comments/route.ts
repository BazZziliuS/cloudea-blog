import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";

const slugSchema = z.string().min(1).max(500);

const createCommentSchema = z.object({
  slug: slugSchema,
  content: z.string().trim().min(1).max(5000),
  parent_id: z.uuid().nullish(),
});

const COMMENT_COLUMNS = "id, content, created_at, user_id, user_name, user_avatar, parent_id";

function serverError(error: { message: string }) {
  console.error("[comments]", error.message);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "comments:get", { windowMs: 60_000, max: 120 });
  if (limited) return limited;

  const slug = slugSchema.safeParse(new URL(request.url).searchParams.get("slug"));
  if (!slug.success) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(COMMENT_COLUMNS)
    .eq("slug", slug.data)
    .order("created_at", { ascending: true });

  if (error) return serverError(error);
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "comments:post", { windowMs: 60_000, max: 10 });
  if (limited) return limited;

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  const { slug, content, parent_id } = parsed.data;
  const { data, error } = await supabase
    .from("comments")
    .insert({
      slug,
      content,
      user_id: user.id,
      user_name: user.user_metadata?.user_name || user.email || "Anonymous",
      user_avatar: user.user_metadata?.avatar_url || "",
      parent_id: parent_id ?? null,
    })
    .select(COMMENT_COLUMNS)
    .single();

  if (error) return serverError(error);
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const limited = enforceRateLimit(request, "comments:delete", { windowMs: 60_000, max: 20 });
  if (limited) return limited;

  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = z.uuid().safeParse(new URL(request.url).searchParams.get("id"));
  if (!id.success) {
    return NextResponse.json({ error: "Valid id required" }, { status: 400 });
  }

  const { error } = await supabase.from("comments").delete().eq("id", id.data).eq("user_id", user.id);

  if (error) return serverError(error);
  return NextResponse.json({ ok: true });
}
