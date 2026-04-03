import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

// 1. Ensure the user is logged in
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    // Better Auth checks the headers/cookies to find the active session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized: No active session" });
    }

    // Attach the user object to the request so your routes can use it!
    res.locals.user = session.user;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal Server Error during authentication" });
  }
};

// 2. Ensure the user has the correct role
export const requireRole = (allowedRoles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No active session" });
      }

      if (!allowedRoles.includes(session.user.role as string)) {
        return res.status(403).json({
          error: "Forbidden: You do not have permission to perform this action",
        });
      }

      res.locals.user = session.user;
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Internal Server Error during authorization" });
    }
  };
};
