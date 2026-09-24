import type { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';

export interface BaseDocument {
  _id: unknown;
  tenantId: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class BaseRepository<T extends BaseDocument> {
  constructor(protected readonly model: Model<T>) {}

  protected buildTenantFilter(tenantId: string, filter: FilterQuery<T> = {}): FilterQuery<T> {
    return {
      ...filter,
      tenantId,
      isDeleted: { $ne: true },
    } as FilterQuery<T>;
  }

  async find(tenantId: string, filter: FilterQuery<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    const query = this.buildTenantFilter(tenantId, filter);
    return this.model.find(query, null, options).exec();
  }

  async findOne(tenantId: string, filter: FilterQuery<T>): Promise<T | null> {
    const query = this.buildTenantFilter(tenantId, filter);
    return this.model.findOne(query).exec();
  }

  async findById(tenantId: string, id: string): Promise<T | null> {
    const query = this.buildTenantFilter(tenantId, { _id: id } as FilterQuery<T>);
    return this.model.findOne(query).exec();
  }

  async create(tenantId: string, doc: Partial<T>): Promise<T> {
    const payload = {
      ...doc,
      tenantId,
      isDeleted: false,
    } as unknown as T;
    const created = new this.model(payload);
    return created.save();
  }

  async update(tenantId: string, filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    const query = this.buildTenantFilter(tenantId, filter);
    return this.model.findOneAndUpdate(query, update, { new: true }).exec();
  }

  async softDelete(tenantId: string, id: string): Promise<boolean> {
    const query = this.buildTenantFilter(tenantId, { _id: id } as FilterQuery<T>);
    const result = await this.model.findOneAndUpdate(query, { isDeleted: true } as UpdateQuery<T>).exec();
    return result !== null;
  }
}
