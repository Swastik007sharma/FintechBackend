import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const getDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = res.locals.user;
    const role = user.role;

    // Base where clause. Ignore soft deleted.
    const where: any = { deletedAt: null };

    // Scope data to the user if they are not an ADMIN
    if (role !== "ADMIN") {
      where.userId = user.id;
    }

    // 1. Total Income & Total Expenses
    const aggregations = await prisma.financialRecord.groupBy({
      by: ["type"],
      where,
      _sum: {
        amount: true,
      },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    aggregations.forEach((agg) => {
      const amount = Number(agg._sum.amount || 0);
      if (agg.type === "INCOME") totalIncome += amount;
      if (agg.type === "EXPENSE") totalExpenses += amount;
    });

    const netBalance = totalIncome - totalExpenses;

    // 2. Category-wise totals
    const categoryAggs = await prisma.financialRecord.groupBy({
      by: ["categoryId", "type"],
      where,
      _sum: {
        amount: true,
      },
    });

    const categoryIds = [...new Set(categoryAggs.map((c) => c.categoryId))];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const categoryTotals = categoryAggs.map((agg) => ({
      categoryName: categoryMap.get(agg.categoryId) || "Unknown",
      categoryId: agg.categoryId,
      type: agg.type,
      totalAmount: Number(agg._sum.amount || 0),
    }));

    // 3. Recent activity
    const recentActivity = await prisma.financialRecord.findMany({
      where,
      orderBy: { date: "desc" },
      take: 5,
      include: { category: { select: { name: true } } },
    });

    res.json({
      status: "success",
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          netBalance,
        },
        categoryTotals,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
