import type { HealthPackageDTO, TestCatalogDTO } from '@homelab/shared-types';
import { AppError } from '../../shared/errors/app-error.js';
import { CatalogRepository } from '../catalog/catalog.repository.js';
import { PackageRepository } from './package.repository.js';
import type { IHealthPackageDocument } from './package.model.js';
import type { ITestCatalogDocument } from '../catalog/catalog.model.js';

const packageRepo = new PackageRepository();
const catalogRepo = new CatalogRepository();

function mapPackageToDTO(doc: IHealthPackageDocument): HealthPackageDTO {
  const tests: TestCatalogDTO[] = (doc.testIds || []).map((t: any) => {
    if (typeof t === 'object' && t._id) {
      const testDoc = t as ITestCatalogDocument;
      return {
        id: testDoc._id.toString(),
        code: testDoc.code,
        name: testDoc.name,
        category: testDoc.category,
        specimenType: testDoc.specimenType,
        containerColor: testDoc.containerColor,
        fastingHours: testDoc.fastingHours,
        tatHours: testDoc.tatHours,
        price: testDoc.price,
        isActive: testDoc.isActive,
      };
    }
    return {
      id: t.toString(),
      code: '',
      name: '',
      category: '',
      specimenType: '',
      containerColor: '',
      fastingHours: 0,
      tatHours: 24,
      price: 0,
      isActive: true,
    };
  });

  return {
    id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    description: doc.description,
    category: doc.category,
    tests,
    originalPrice: doc.originalPrice,
    discountPrice: doc.discountPrice,
    fastingHours: doc.fastingHours,
    isActive: doc.isActive,
  };
}

export async function createPackage(
  tenantId: string,
  data: {
    code: string;
    name: string;
    description: string;
    category: string;
    testIds: string[];
    originalPrice: number;
    discountPrice: number;
    fastingHours?: number;
    isActive?: boolean;
  },
): Promise<HealthPackageDTO> {
  const existing = await packageRepo.findByCode(tenantId, data.code);
  if (existing) {
    throw new AppError({
      statusCode: 409,
      code: 'DUPLICATE_PACKAGE_CODE',
      message: `A health package with code '${data.code.toUpperCase()}' already exists`,
      expose: true,
    });
  }

  // Validate bundled tests exist in tenant catalog
  const tests = await Promise.all(data.testIds.map((id) => catalogRepo.findById(tenantId, id)));
  if (tests.some((t) => !t)) {
    throw new AppError({
      statusCode: 400,
      code: 'INVALID_TEST_ID',
      message: 'One or more test IDs specified in the package do not exist in the catalog',
      expose: true,
    });
  }

  // Calculate fasting requirement as max of bundled tests if not explicitly supplied
  const maxFasting = data.fastingHours ?? Math.max(0, ...tests.map((t) => t?.fastingHours || 0));

  const created = await packageRepo.create(tenantId, {
    ...data,
    code: data.code.toUpperCase().trim(),
    testIds: data.testIds as any,
    fastingHours: maxFasting,
  });

  const populated = await packageRepo.findWithPopulatedTests(tenantId, created._id.toString());
  return mapPackageToDTO(populated || created);
}

export async function updatePackage(
  tenantId: string,
  id: string,
  data: Partial<{
    code: string;
    name: string;
    description: string;
    category: string;
    testIds: string[];
    originalPrice: number;
    discountPrice: number;
    fastingHours: number;
    isActive: boolean;
  }>,
): Promise<HealthPackageDTO> {
  const pkg = await packageRepo.findById(tenantId, id);
  if (!pkg) {
    throw new AppError({
      statusCode: 404,
      code: 'PACKAGE_NOT_FOUND',
      message: 'Health package not found',
      expose: true,
    });
  }

  if (data.code && data.code.toUpperCase().trim() !== pkg.code) {
    const existing = await packageRepo.findByCode(tenantId, data.code);
    if (existing) {
      throw new AppError({
        statusCode: 409,
        code: 'DUPLICATE_PACKAGE_CODE',
        message: `A health package with code '${data.code.toUpperCase()}' already exists`,
        expose: true,
      });
    }
  }

  if (data.testIds) {
    const tests = await Promise.all(data.testIds.map((tid) => catalogRepo.findById(tenantId, tid)));
    if (tests.some((t) => !t)) {
      throw new AppError({
        statusCode: 400,
        code: 'INVALID_TEST_ID',
        message: 'One or more test IDs specified do not exist in the catalog',
        expose: true,
      });
    }
  }

  const updated = await packageRepo.update(tenantId, { _id: id }, {
    ...data,
    ...(data.code ? { code: data.code.toUpperCase().trim() } : {}),
  });

  if (!updated) {
    throw new AppError({
      statusCode: 404,
      code: 'PACKAGE_NOT_FOUND',
      message: 'Health package not found',
      expose: true,
    });
  }

  const populated = await packageRepo.findWithPopulatedTests(tenantId, id);
  return mapPackageToDTO(populated || updated);
}

export async function getPackageById(tenantId: string, id: string): Promise<HealthPackageDTO> {
  const pkg = await packageRepo.findWithPopulatedTests(tenantId, id);
  if (!pkg) {
    throw new AppError({
      statusCode: 404,
      code: 'PACKAGE_NOT_FOUND',
      message: 'Health package not found',
      expose: true,
    });
  }

  return mapPackageToDTO(pkg);
}

export async function listPackages(
  tenantId: string,
  options: {
    search?: string;
    category?: string;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  },
): Promise<{ packages: HealthPackageDTO[]; total: number; page: number; limit: number }> {
  const { packages, total } = await packageRepo.listPackages(tenantId, options);
  const page = options.page || 1;
  const limit = options.limit || 20;

  return {
    packages: packages.map(mapPackageToDTO),
    total,
    page,
    limit,
  };
}
