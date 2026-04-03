import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { NotFoundError, ForbiddenError } from "../utils/errors";

// ----------------- CATEGORIES -----------------
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.create({
      data: { name, description },
    });
    res.status(201).json({ status: "success", data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await prisma.category.findMany();
    res.json({ status: "success", data: categories });
  } catch (error) {
    next(error);
  }
};

// ----------------- RECORDS -----------------
export const createRecord = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { amount, type, date, description, categoryId } = req.body;
    const userId = res.locals.user.id; // Logged-in user is creating the record

    const record = await prisma.financialRecord.create({
      data: {
        amount,
        type,
        date: date ? new Date(date) : new Date(),
        description,
        categoryId,
        userId,
      },
    });
    res.status(201).json({ status: "success", data: record });
  } catch (error) {
    next(error);
  }
};

export const getRecords = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      type,
      categoryId,
      startDate,
      endDate,
      page = "1",
      limit = "10",
    } = req.query;
    const user = res.locals.user;

    // Base where clause: Ignore soft deleted records
    const where: any = { deletedAt: null };

    // If user is not ADMIN, restrict results to their own records
    if (user.role !== "ADMIN") {
      where.userId = user.id;
    }

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const records = await prisma.financialRecord.findMany({
      where,
      include: {
        category: true,
        user: { select: { name: true, email: true } },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { date: "desc" },
    });

    const total = await prisma.financialRecord.count({ where });

    res.json({
      status: "success",
      data: records,
      meta: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const user = res.locals.user;
    const updates = req.body;

    const record = await prisma.financialRecord.findUnique({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundError("Record not found");
    }

    // Only explicitly allow Admin or the record owner to update
    if (user.role !== "ADMIN" && record.userId !== user.id) {
      throw new ForbiddenError("You can only update your own records");
    }

    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const updatedRecord = await prisma.financialRecord.update({
      where: { id },
      data: updates,
    });

    res.json({ status: "success", data: updatedRecord });
  } catch (error) {
    next(error);
  }
};

// Soft delete
export const deleteRecord = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const user = res.locals.user;

    const record = await prisma.financialRecord.findUnique({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundError("Record not found");
    }

    if (user.role !== "ADMIN" && record.userId !== user.id) {
      throw new ForbiddenError("You can only delete your own records");
    }

    await prisma.financialRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ status: "success", message: "Record deleted successfully" });
  } catch (error) {
    next(error);
  }
};
