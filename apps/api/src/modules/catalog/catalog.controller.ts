import type { Request, Response } from 'express';
import { success } from '../../shared/http/envelope.js';
import * as catalogService from './catalog.service.js';

export async function createTestHandler(req: Request, res: Response): Promise<void> {
  const tenantId = req.user?.tenantId || (req.body.tenantId as string) || 'default_lab_01';
  const result = await catalogService.createTest(tenantId, req.body);
  res.status(201).json(success(result, req.requestId));
}

export async function updateTestHandler(req: Request, res: Response): Promise<void> {
  const tenantId = req.user?.tenantId || (req.body.tenantId as string) || 'default_lab_01';
  const result = await catalogService.updateTest(tenantId, req.params.id as string, req.body);
  res.status(200).json(success(result, req.requestId));
}

export async function getTestByIdHandler(req: Request, res: Response): Promise<void> {
  const tenantId = req.user?.tenantId || (req.query.tenantId as string) || 'default_lab_01';
  const result = await catalogService.getTestById(tenantId, req.params.id as string);
  res.status(200).json(success(result, req.requestId));
}

export async function listTestsHandler(req: Request, res: Response): Promise<void> {
  const tenantId = req.user?.tenantId || (req.query.tenantId as string) || 'default_lab_01';
  const activeOnly = req.user?.role !== 'LAB_STAFF';

  const result = await catalogService.listTests(tenantId, {
    search: req.query.search as string | undefined,
    category: req.query.category as string | undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
    activeOnly,
  });

  res.status(200).json(
    success(result.tests, req.requestId, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    }),
  );
}

export async function addParameterHandler(req: Request, res: Response): Promise<void> {
  const tenantId = req.user?.tenantId || (req.body.tenantId as string) || 'default_lab_01';
  const result = await catalogService.addTestParameter(tenantId, req.params.id as string, req.body);
  res.status(201).json(success(result, req.requestId));
}
