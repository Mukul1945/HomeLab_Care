import { describe, expect, it, vi } from 'vitest';
import type { Model } from 'mongoose';
import { BaseRepository, type BaseDocument } from './base.repository.js';

interface TestDoc extends BaseDocument {
  _id: string;
  name: string;
}

class TestRepository extends BaseRepository<TestDoc> {
  public exposeFilter(tenantId: string, filter?: Record<string, unknown>) {
    return this.buildTenantFilter(tenantId, filter);
  }
}

describe('BaseRepository Tenant Isolation', () => {
  const mockModel = {} as Model<TestDoc>;
  const repository = new TestRepository(mockModel);

  it('injects tenantId and isDeleted: { $ne: true } into query filter', () => {
    const filter = repository.exposeFilter('tenant_123', { name: 'Blood Test' });

    expect(filter).toEqual({
      name: 'Blood Test',
      tenantId: 'tenant_123',
      isDeleted: { $ne: true },
    });
  });

  it('preserves existing filter criteria while appending tenantId', () => {
    const filter = repository.exposeFilter('lab_tenant_A', { code: 'CBC' });

    expect(filter.tenantId).toBe('lab_tenant_A');
    expect(filter.code).toBe('CBC');
    expect(filter.isDeleted).toEqual({ $ne: true });
  });
});
