import type { FilterQuery } from 'mongoose';
import { BaseRepository } from '../../shared/database/base.repository.js';
import { TestCatalogModel, TestParameterModel, type ITestCatalogDocument, type ITestParameterDocument } from './catalog.model.js';

export class CatalogRepository extends BaseRepository<ITestCatalogDocument> {
  constructor() {
    super(TestCatalogModel);
  }

  async listTests(
    tenantId: string,
    options: {
      search?: string;
      category?: string;
      activeOnly?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<{ tests: ITestCatalogDocument[]; total: number }> {
    const filter: FilterQuery<ITestCatalogDocument> = {};

    if (options.activeOnly) {
      filter.isActive = true;
    }

    if (options.category) {
      filter.category = options.category;
    }

    if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { code: { $regex: options.search, $options: 'i' } },
        { category: { $regex: options.search, $options: 'i' } },
      ];
    }

    const query = this.buildTenantFilter(tenantId, filter);
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [tests, total] = await Promise.all([
      this.model.find(query).sort({ name: 1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return { tests, total };
  }

  async findByCode(tenantId: string, code: string): Promise<ITestCatalogDocument | null> {
    return this.findOne(tenantId, { code: code.toUpperCase().trim() });
  }
}

export class ParameterRepository extends BaseRepository<ITestParameterDocument> {
  constructor() {
    super(TestParameterModel);
  }

  async findParametersByTestId(tenantId: string, testId: string): Promise<ITestParameterDocument[]> {
    return this.find(tenantId, { testId });
  }
}
