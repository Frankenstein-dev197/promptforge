import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getDashboardStats(userId: string) {
  const [promptCount, collectionCount, runCount, starredCount] = await Promise.all([
    prisma.prompt.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.run.count({ where: { userId } }),
    prisma.prompt.count({ where: { userId, isStarred: true } }),
  ]);

  // Runs this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const runsThisMonth = await prisma.run.count({
    where: { userId, createdAt: { gte: startOfMonth } },
  });

  // Total tokens
  const tokenAgg = await prisma.run.aggregate({
    where: { userId },
    _sum: { tokensIn: true, tokensOut: true },
  });

  return {
    promptCount,
    collectionCount,
    runCount,
    starredCount,
    runsThisMonth,
    tokensUsed: (tokenAgg._sum.tokensIn ?? 0) + (tokenAgg._sum.tokensOut ?? 0),
  };
}

export async function getRecentActivity(userId: string, limit = 8) {
  const [recentRuns, recentPrompts] = await Promise.all([
    prisma.run.findMany({
      where: { userId },
      include: { prompt: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.prompt.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, title: true, updatedAt: true },
    }),
  ]);
  return { recentRuns, recentPrompts };
}

export async function getRunsChart(userId: string, days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const runs = await prisma.run.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { createdAt: true, status: true, tokensIn: true, tokensOut: true },
  });

  // Bucket by day
  const buckets: { date: string; label: string; runs: number; tokens: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      date: key,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      runs: 0,
      tokens: 0,
    });
  }
  const map = new Map(buckets.map((b) => [b.date, b]));
  for (const r of runs) {
    const key = r.createdAt.toISOString().slice(0, 10);
    const bucket = map.get(key);
    if (bucket) {
      bucket.runs += 1;
      bucket.tokens += r.tokensIn + r.tokensOut;
    }
  }
  return buckets;
}
