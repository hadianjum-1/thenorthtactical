import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Trophy, Users, Zap, TrendingUp, Star } from "lucide-react";

export default async function AdminLoyaltyPage() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role as string)) {
    redirect("/admin/login");
  }

  const [accounts, transactions] = await Promise.all([
    prisma.loyaltyAccount.findMany({
      orderBy: { pointsBalance: "desc" },
      take: 50,
    }),
    prisma.loyaltyTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Enrich accounts with user data
  const userIds = [...new Set(accounts.map((a) => a.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  // Enrich transactions with account + user data
  const accountIds = [...new Set(transactions.map((t) => t.accountId))];
  const txAccounts = await prisma.loyaltyAccount.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, userId: true },
  });
  const txAccountUserIds = [...new Set(txAccounts.map((a) => a.userId))];
  const txUsers = await prisma.user.findMany({
    where: { id: { in: txAccountUserIds } },
    select: { id: true, name: true, email: true },
  });
  const txUserMap = new Map(txUsers.map((u) => [u.id, u]));
  const txAccountMap = new Map(txAccounts.map((a) => [a.id, txUserMap.get(a.userId)]));

  const totalPoints = accounts.reduce((s, a) => s + a.pointsBalance, 0);
  const pointsIssued = transactions
    .filter((t) => t.pointsDelta > 0)
    .reduce((s, t) => s + t.pointsDelta, 0);
  const pointsRedeemed = transactions
    .filter((t) => t.pointsDelta < 0)
    .reduce((s, t) => s + Math.abs(t.pointsDelta), 0);

  function formatDate(d: Date) {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const STATS = [
    { label: "Total Members", value: accounts.length, icon: Users, accent: false },
    { label: "Total Points Balance", value: totalPoints.toLocaleString(), icon: Star, accent: true },
    { label: "Points Issued", value: `+${pointsIssued.toLocaleString()}`, icon: TrendingUp, accent: false },
    { label: "Points Redeemed", value: `-${pointsRedeemed.toLocaleString()}`, icon: Zap, accent: false },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest mb-1">
          Engagement
        </p>
        <h1 className="text-2xl font-bold text-[#F5F5F5] tracking-tight">
          Loyalty Program
        </h1>
        <p className="text-sm text-[#737373] mt-1">
          Manage customer points, transaction history, and program health.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className={`rounded-xl border p-4 ${
              accent
                ? "border-[#D6FF3F]/20 bg-[#D6FF3F]/5"
                : "border-[#292929] bg-[#111111]"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} className={accent ? "text-[#D6FF3F]" : "text-[#737373]"} />
              <p className="text-[10px] font-mono text-[#737373] uppercase tracking-widest">
                {label}
              </p>
            </div>
            <p className={`text-2xl font-bold ${accent ? "text-[#D6FF3F]" : "text-[#F5F5F5]"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Members Leaderboard */}
        <div className="rounded-xl border border-[#292929] bg-[#111111] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#292929] flex items-center gap-2">
            <Trophy size={14} className="text-[#D6FF3F]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A3A3A3]">
              Top Members
            </h2>
          </div>
          {accounts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#737373]">No loyalty members yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1D1D1D]">
              {accounts.map((account, idx) => {
                const user = userMap.get(account.userId);
                return (
                  <div key={account.id} className="flex items-center gap-4 px-4 py-3.5">
                    <span
                      className={`text-xs font-mono font-bold w-5 text-center ${
                        idx === 0
                          ? "text-[#D6FF3F]"
                          : idx === 1
                          ? "text-[#A3A3A3]"
                          : idx === 2
                          ? "text-amber-600"
                          : "text-[#4A4A4A]"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#1D1D1D] border border-[#292929] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#A3A3A3]">
                        {(user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F5F5F5] truncate">
                        {user?.name ?? "Anonymous"}
                      </p>
                      <p className="text-[10px] font-mono text-[#737373] truncate">
                        {user?.email ?? account.userId}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#D6FF3F] font-mono">
                        {account.pointsBalance.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-mono text-[#737373] uppercase">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-[#292929] bg-[#111111] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#292929] flex items-center gap-2">
            <Zap size={14} className="text-[#D6FF3F]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A3A3A3]">
              Recent Transactions
            </h2>
          </div>
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#737373]">No transactions yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1D1D1D]">
              {transactions.map((tx) => {
                const txUser = txAccountMap.get(tx.accountId);
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        tx.pointsDelta >= 0
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-red-500/10 border border-red-500/20"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold ${
                          tx.pointsDelta >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {tx.pointsDelta >= 0 ? "+" : "−"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#F5F5F5] truncate">
                        {txUser?.name ?? txUser?.email ?? "User"}
                      </p>
                      <p className="text-[10px] font-mono text-[#737373] truncate">
                        {tx.reason}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold font-mono ${
                          tx.pointsDelta >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {tx.pointsDelta >= 0 ? "+" : ""}
                        {tx.pointsDelta}
                      </p>
                      <p className="text-[10px] text-[#737373]">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
