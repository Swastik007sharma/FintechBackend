import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

export const validateRequest = (schema: ZodType) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: "error",
          message: "Validation Error",
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };
};
