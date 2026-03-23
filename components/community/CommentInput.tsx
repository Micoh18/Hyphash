"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import type { CommentType } from "@/types";
import type { TranslationKey } from "@/lib/i18n/translations/en";

const COMMENT_TYPES: { value: CommentType; labelKey: TranslationKey }[] = [
  { value: "discussion", labelKey: "comments.discuss" },
  { value: "agree", labelKey: "comments.agree" },
  { value: "disagree", labelKey: "comments.disagree" },
  { value: "suggest", labelKey: "comments.suggest_id" },
];

export function CommentInput({
  onSubmit,
}: {
  onSubmit: (body: string, type: CommentType, suggestedSpecies?: string) => void;
}) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [body, setBody] = useState("");
  const [type, setType] = useState<CommentType>("discussion");
  const [suggestedSpecies, setSuggestedSpecies] = useState("");

  if (!user) {
    return (
      <a
        href="/login"
        className="block w-full py-3 text-sm font-medium text-forest bg-forest/10 border border-moss/30 rounded-xl hover:bg-moss/10 transition-colors text-center"
      >
        {t("comments.connect_to_discuss")}
      </a>
    );
  }

  const handleSubmit = () => {
    if (!body.trim()) return;
    onSubmit(body, type, type === "suggest" ? suggestedSpecies : undefined);
    setBody("");
    setSuggestedSpecies("");
    setType("discussion");
  };

  return (
    <div className="space-y-3 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
      <div className="flex gap-1.5" role="group" aria-label="Comment type">
        {COMMENT_TYPES.map((ct) => (
          <button
            key={ct.value}
            onClick={() => setType(ct.value)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              type === ct.value
                ? "bg-forest text-white"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
            }`}
          >
            {t(ct.labelKey)}
          </button>
        ))}
      </div>

      {type === "suggest" && (
        <input
          type="text"
          value={suggestedSpecies}
          onChange={(e) => setSuggestedSpecies(e.target.value)}
          placeholder={t("comments.suggested_placeholder")}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm"
        />
      )}

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("comments.share_thoughts")}
        aria-label="Comment text"
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm resize-none"
      />

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!body.trim()}
          className="px-4 py-1.5 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light disabled:opacity-50 transition-colors"
        >
          {t("comments.post")}
        </button>
      </div>
    </div>
  );
}
