"use client";

import type { Comment } from "@/types";
import { useI18n } from "@/hooks/useI18n";
import type { TranslationKey } from "@/lib/i18n/translations/en";

const TYPE_STYLES: Record<string, { bg: string; labelKey: TranslationKey }> = {
  discussion: { bg: "bg-gray-100 text-gray-700", labelKey: "comments.discussion" },
  agree: { bg: "bg-forest/10 text-forest", labelKey: "comments.agrees" },
  disagree: { bg: "bg-red-100 text-red-700", labelKey: "comments.disagrees" },
  suggest: { bg: "bg-violet-100 text-violet-700", labelKey: "comments.suggests" },
};

export function CommentThread({ comments }: { comments: Comment[] }) {
  const { t } = useI18n();

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--muted-foreground)]">
        <p className="text-sm">{t("comments.no_comments")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const style = TYPE_STYLES[comment.comment_type] ?? TYPE_STYLES.discussion;
        return (
          <div
            key={comment.id}
            className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-medium text-[var(--muted-foreground)]">
                {(comment.author?.username ?? "?")[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {comment.author?.username ?? t("common.anonymous")}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${style.bg}`}>
                {t(style.labelKey)}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] ml-auto">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              {comment.body}
            </p>
            {comment.suggested_species && (
              <p className="mt-1.5 text-xs text-violet-600 italic">
                {t("comments.suggested")} {comment.suggested_species}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
