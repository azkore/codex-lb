import { Bot, SquareTerminal, User } from "lucide-react";

import { isEmailLabel } from "@/components/blur-email";
import { AccountActions } from "@/features/accounts/components/account-actions";
import { AccountTokenInfo } from "@/features/accounts/components/account-token-info";
import { AccountUsagePanel } from "@/features/accounts/components/account-usage-panel";
import type { AccountSummary } from "@/features/accounts/schemas";
import { useAccountTrends } from "@/features/accounts/hooks/use-accounts";
import { usePrivacyStore } from "@/hooks/use-privacy";
import { cn } from "@/lib/utils";
import { formatCompactAccountId } from "@/utils/account-identifiers";
import { isAnthropicAccountId, providerLabelForAccountId } from "@/utils/account-provider";

export type AccountDetailProps = {
  account: AccountSummary | null;
  showAccountId?: boolean;
  busy: boolean;
  onPause: (accountId: string) => void;
  onResume: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onReauth: () => void;
};

export function AccountDetail({
  account,
  showAccountId = false,
  busy,
  onPause,
  onResume,
  onDelete,
  onReauth,
}: AccountDetailProps) {
  void showAccountId;
  const { data: trends } = useAccountTrends(account?.accountId ?? null);
  const blurred = usePrivacyStore((s) => s.blurred);

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium text-muted-foreground">Select an account</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Choose an account from the list to view details.</p>
      </div>
    );
  }

  const isAnthropic = isAnthropicAccountId(account.accountId);
  const ProviderIcon = isAnthropic ? Bot : SquareTerminal;
  const providerLabel = providerLabelForAccountId(account.accountId);
  const title = account.displayName || account.email;
  const titleIsEmail = isEmailLabel(title, account.email);
  const compactId = formatCompactAccountId(account.accountId);
  const emailSubtitle = account.displayName && account.displayName !== account.email ? account.email : null;
  const idSuffix = showAccountId ? ` (${compactId})` : "";

  return (
    <div
      key={account.accountId}
      className={cn(
        "animate-fade-in-up space-y-4 rounded-xl border bg-card p-5",
        isAnthropic && "border-amber-500/20 bg-amber-500/5",
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
              isAnthropic
                ? "border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "border-sky-500/35 bg-sky-500/15 text-sky-700 dark:text-sky-400",
            )}
            title={providerLabel}
          >
            <ProviderIcon className="h-3 w-3" />
          </span>
          <h2 className="text-base font-semibold">
            {titleIsEmail ? (
              <>
                <span className={blurred ? "privacy-blur" : ""}>{title}</span>
                {!emailSubtitle ? idSuffix : ""}
              </>
            ) : (
              <>
                {title}
                {!emailSubtitle ? idSuffix : ""}
              </>
            )}
          </h2>
        </div>
        {emailSubtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground" title={showAccountId ? `Account ID ${account.accountId}` : undefined}>
            <span className={blurred ? "privacy-blur" : ""}>{emailSubtitle}</span>
            {showAccountId ? ` | ID ${compactId}` : ""}
          </p>
        ) : null}
      </div>

      <AccountUsagePanel account={account} trends={trends} />
      <AccountTokenInfo account={account} />
      <AccountActions
        account={account}
        busy={busy}
        onPause={onPause}
        onResume={onResume}
        onDelete={onDelete}
        onReauth={onReauth}
      />
    </div>
  );
}
