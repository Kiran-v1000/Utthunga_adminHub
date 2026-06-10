import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@adminhub/shared';

export function authorizeRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }
    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
}
