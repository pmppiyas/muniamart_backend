import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

export const validateRequest =
  (schema: ZodTypeAny) =>
  async (
    req: Request & { file?: Express.Multer.File },
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Request body is empty. Make sure you're sending form data correctly.",
        });
      }

      let bodyData = req.body;

      if (req.body.data) {
        try {
          bodyData =
            typeof req.body.data === 'string'
              ? JSON.parse(req.body.data)
              : req.body.data;
        } catch (parseError) {
          return res.status(400).json({
            success: false,
            message: 'Invalid JSON in data field',
          });
        }
      }

      const parsed = schema.safeParse(bodyData);

      if (!parsed.success) {
        return next(parsed.error);
      }

      req.body = parsed.data;

      if (req.file) {
        req.body.photoUrl = req.file.path;
      }

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation middleware error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
