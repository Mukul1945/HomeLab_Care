import type { FilterQuery } from 'mongoose';
import { BaseRepository } from '../../shared/database/base.repository.js';
import { HealthPackageModel, type IHealthPackageDocument } from './package.model.js';

export class PackageRepository extends BaseRepository<IHealthPackageDocument> {
  constructor() {
    super(HealthPackageModel);
  }

  async listPackages(
    tenantId: string,
    options: {
      search?: string;
      category?: string;
      activeOnly?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<{ packages: IHealthPackageDocument[]; total: number }> {
    const filter: FilterQuery<IHealthPackageDocument> = {};

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
        { description: { $regex: options.search, $options: 'i' } },
      ];
    }

    const query = this.buildTenantFilter(tenantId, filter);
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [packages, total] = await Promise.all([
      this.model.find(query).populate('testIds').sort({ name: 1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return { packages, total };
  }

  async findByCode(tenantId: string, code: string): Promise<IHealthPackageDocument | null> {
    return this.findOne(tenantId, { code: code.toUpperCase().trim() });
  }

  async findWithPopulatedTests(tenantId: string, id: string): Promise<IHealthPackageDocument | null> {
    const query = this.buildTenantFilter(tenantId, { _id: id });
    return this.model.findOne(query).populate('testIds').exec();
  }
}
