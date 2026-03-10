"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { MessageSquare, Send, Trash2, Reply, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Locale } from "@/lib/i18n";
import type { Locale as DateLocale } from "date-fns";
import Link from "next/link";

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
}

const t = {
  ru: {
    title: "Комментарии",
    placeholder: "Написать комментарий...",
    replyPlaceholder: "Написать ответ...",
    send: "Отправить",
    signInToComment: "Войдите, чтобы комментировать",
    noComments: "Пока нет комментариев. Будьте первым!",
    reply: "Ответить",
    delete: "Удалить",
    cancel: "Отмена",
  },
  en: {
    title: "Comments",
    placeholder: "Write a comment...",
    replyPlaceholder: "Write a reply...",
    send: "Send",
    signInToComment: "Sign in to comment",
    noComments: "No comments yet. Be the first!",
    reply: "Reply",
    delete: "Delete",
    cancel: "Cancel",
  },
};

export function SupabaseComments({ slug, locale }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);

  const labels = t[locale as keyof typeof t] ?? t.ru;
  const dateLocale: DateLocale = locale === "ru" ? ru : enUS;

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [fetchComments]);

  const submitComment = async (content: string, parentId: string | null) => {
    if (!content.trim()) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  const deleteComment = async (id: string) => {
    const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchComments();
    }
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId);

  return (
    <div className="mt-16 border-t border-border pt-10">
      <h2 className="flex items-center gap-2 text-xl font-semibold mb-6">
        <MessageSquare className="h-5 w-5" />
        {labels.title}
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* New comment form */}
      {user ? (
        <div className="flex gap-3 mb-8">
          <Avatar className="h-8 w-8 shrink-0 mt-1">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {(user.user_metadata?.user_name || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={labels.placeholder}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                onClick={() => submitComment(newComment, null)}
                disabled={loading || !newComment.trim()}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {labels.send}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Link href="/auth/login">
          <Button variant="outline" className="mb-8 gap-2">
            <LogIn className="h-4 w-4" />
            {labels.signInToComment}
          </Button>
        </Link>
      )}

      {/* Comments list */}
      {topLevel.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.noComments}</p>
      ) : (
        <div className="space-y-6">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                user={user}
                labels={labels}
                dateLocale={dateLocale}
                onDelete={deleteComment}
                onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              />

              {/* Replies */}
              {replies(comment.id).length > 0 && (
                <div className="ml-10 mt-3 space-y-3 border-l-2 border-border pl-4">
                  {replies(comment.id).map((reply) => (
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

              {/* Reply form */}
              {replyTo === comment.id && user && (
                <div className="ml-10 mt-3 flex gap-3">
                  <Avatar className="h-6 w-6 shrink-0 mt-1">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {(user.user_metadata?.user_name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={labels.replyPlaceholder}
                      rows={2}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyContent("");
                        }}
                      >
                        {labels.cancel}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => submitComment(replyContent, comment.id)}
                        disabled={loading || !replyContent.trim()}
                        className="gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {labels.send}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  user,
  labels,
  dateLocale,
  onDelete,
  onReply,
}: {
  comment: Comment;
  user: User | null;
  labels: (typeof t)["ru"];
  dateLocale: DateLocale;
  onDelete: (id: string) => void;
  onReply?: () => void;
}) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user_avatar} />
        <AvatarFallback>
          {comment.user_name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.user_name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: dateLocale,
            })}
          </span>
        </div>
        <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>
        <div className="mt-1.5 flex items-center gap-3">
          {onReply && user && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="h-3 w-3" />
              {labels.reply}
            </button>
          )}
          {user?.id === comment.user_id && (
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              {labels.delete}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
