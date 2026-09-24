declare namespace Express {
  interface Request {
    requestId: string;
    user?: import('@homelab/shared-types').AuthUserContext;
  }
}
