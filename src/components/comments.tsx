"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, type Locale as DateFnsLocale } from "date-fns";
import type { User } from "@supabase/supabase-js";
import { LogIn, MessageSquare, Reply, Send, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getDateFnsLocale } from "@/lib/date";
import type { Dictionary, Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type CommentLabels = Dictionary["comments"];

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  parent_id: string | null;
}

interface CommentsProps {
  slug: string;
  locale: Locale;
  labels: CommentLabels;
}

const MAX_COMMENT_LENGTH = 5000;

const textareaClassName =
  "w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function userInitial(user: User): string {
  return String(user.user_metadata?.user_name || "U").charAt(0).toUpperCase();
}

export function SupabaseComments({ slug, locale, labels }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dateLocale = getDateFnsLocale(locale);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
    if (res.ok) setComments((await res.json()) as Comment[]);
  }, [slug]);

  useEffect(() => {
    let active = true;
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? (res.json() as Promise<Comment[]>) : null))
      .then((data) => {
        if (active && data) setComments(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const submitComment = async (content: string, parentId: string | null) => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content, parent_id: parentId }),
      });
      if (res.ok) {
        setNewComment("");
        setReplyTo(null);
        setReplyContent("");
        await fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (id: string) => {
    const res = await fetch(`/api/comments?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) await fetchComments();
  };

  const cancelReply = () => {
    setReplyTo(null);
    setReplyContent("");
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, Comment[]>();
  for (const c of comments) {
    if (c.parent_id) repliesByParent.set(c.parent_id, [...(repliesByParent.get(c.parent_id) ?? []), c]);
  }

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
        <MessageSquare className="h-5 w-5" aria-hidden="true" />
        {labels.title}
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h2>

      {user ? (
        <div className="mb-8 flex gap-3">
          <Avatar className="mt-1 h-8 w-8 shrink-0">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{userInitial(user)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={labels.placeholder}
              aria-label={labels.placeholder}
              maxLength={MAX_COMMENT_LENGTH}
              rows={3}
              className={textareaClassName}
            />
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                onClick={() => submitComment(newComment, null)}
                disabled={submitting || !newComment.trim()}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                {labels.send}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="mb-8 gap-2" asChild>
          <Link href="/auth/login">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {labels.signInToComment}
          </Link>
        </Button>
      )}

      {topLevel.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.noComments}</p>
      ) : (
        <div className="space-y-6">
          {topLevel.map((comment) => {
            const replies = repliesByParent.get(comment.id) ?? [];
            return (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  user={user}
                  labels={labels}
                  dateLocale={dateLocale}
                  onDelete={deleteComment}
                  onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                />

                {replies.length > 0 && (
                  <div className="ml-10 mt-3 space-y-3 border-l-2 border-border pl-4">
                    {replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        user={user}
                        labels={labels}
                        dateLocale={dateLocale}
                        onDelete={deleteComment}
                      />
                    ))}
                  </div>
                )}

                {replyTo === comment.id && user && (
                  <div className="ml-10 mt-3 flex gap-3">
                    <Avatar className="mt-1 h-6 w-6 shrink-0">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xs">{userInitial(user)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={labels.replyPlaceholder}
                        aria-label={labels.replyPlaceholder}
                        maxLength={MAX_COMMENT_LENGTH}
                        rows={2}
                        className={textareaClassName}
                        autoFocus
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={cancelReply}>
                          {labels.cancel}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => submitComment(replyContent, comment.id)}
                          disabled={submitting || !replyContent.trim()}
                          className="gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5" aria-hidden="true" />
                          {labels.send}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface CommentItemProps {
  comment: Comment;
  user: User | null;
  labels: CommentLabels;
  dateLocale: DateFnsLocale;
  onDelete: (id: string) => void;
  onReply?: () => void;
}

function CommentItem({ comment, user, labels, dateLocale, onDelete, onReply }: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user_avatar} />
        <AvatarFallback>{comment.user_name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.user_name}</span>
          <time dateTime={comment.created_at} className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: dateLocale })}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm">{comment.content}</p>
        <div className="mt-1.5 flex items-center gap-3">
          {onReply && user && (
            <button
              type="button"
              onClick={onReply}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Reply className="h-3 w-3" aria-hidden="true" />
              {labels.reply}
            </button>
          )}
          {user?.id === comment.user_id && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              {labels.delete}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
