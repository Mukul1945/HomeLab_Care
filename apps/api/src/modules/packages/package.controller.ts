import type { Request, Response } from 'express';
import { success } from '../../shared/http/envelope.js';
import * as packageService from './package.service.js';

export async function createPackageHandler(req: Request, res: Response): Promise<void> {
  const tenantId = req.user?.tenantId || (req.body.tenantId as string) || 'default_lab_01';
  const result = await packageService.createPackage(tenantId, req.body);
  res.status(201).json(success(result, req.requestId));
}

export async function updatePackageHandler(req: Request, res: Response): Promise<void> {
  const tenantId = req.user?.tenantId || (req.body.tenantId as string) || 'default_lab_01';
  const result = await packageService.updatePackage(tenantId, req.params.id as string, req.body);
  res.status(200).json(success(result, req.requestId));
}

export async function getPackageByIdHandler(req: Request, res: Response): Promise<void> {
  const tenantId = req.user?.tenantId || (req.query.tenantId as string) || 'default_lab_01';
  const result = await packageService.getPackageById(tenantId, req.params.id as string);
  res.status(200).json(success(result, req.requestId));
}

export async function listPackagesHandler(req: Request, res: Response): Promise<void> {
  const tenantId = req.user?.tenantId || (req.query.tenantId as string) || 'default_lab_01';
  const activeOnly = req.user?.role !== 'LAB_STAFF';

  const result = await packageService.listPackages(tenantId, {
    search: req.query.search as string | undefined,
    category: req.query.category as string | undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
    activeOnly,
  });

  res.status(200).json(
    success(result.packages, req.requestId, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    }),
  );
}
