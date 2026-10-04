import type { TestCatalogDTO, TestParameterDTO } from '@homelab/shared-types';
import { AppError } from '../../shared/errors/app-error.js';
import { CatalogRepository, ParameterRepository } from './catalog.repository.js';
import type { ITestCatalogDocument, ITestParameterDocument } from './catalog.model.js';

const catalogRepo = new CatalogRepository();
const parameterRepo = new ParameterRepository();

function mapTestToDTO(doc: ITestCatalogDocument, parameters?: ITestParameterDocument[]): TestCatalogDTO {
  return {
    id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    category: doc.category,
    specimenType: doc.specimenType,
    containerColor: doc.containerColor,
    fastingHours: doc.fastingHours,
    tatHours: doc.tatHours,
    price: doc.price,
    isActive: doc.isActive,
    parameters: parameters?.map(mapParameterToDTO),
  };
}

function mapParameterToDTO(doc: ITestParameterDocument): TestParameterDTO {
  return {
    id: doc._id.toString(),
    testId: doc.testId.toString(),
    name: doc.name,
    unit: doc.unit,
    gender: doc.gender,
    minAge: doc.minAge,
    maxAge: doc.maxAge,
    normalMin: doc.normalMin,
    normalMax: doc.normalMax,
    criticalMin: doc.criticalMin,
    criticalMax: doc.criticalMax,
  };
}

export async function createTest(
  tenantId: string,
  data: {
    code: string;
    name: string;
    category: string;
    specimenType: string;
    containerColor: string;
    fastingHours: number;
    tatHours: number;
    price: number;
    isActive?: boolean;
  },
): Promise<TestCatalogDTO> {
  const existing = await catalogRepo.findByCode(tenantId, data.code);
  if (existing) {
    throw new AppError({
      statusCode: 409,
      code: 'DUPLICATE_TEST_CODE',
      message: `A test with code '${data.code.toUpperCase()}' already exists in this catalog`,
      expose: true,
    });
  }

  const created = await catalogRepo.create(tenantId, {
    ...data,
    code: data.code.toUpperCase().trim(),
  });

  return mapTestToDTO(created);
}

export async function updateTest(
  tenantId: string,
  id: string,
  data: Partial<{
    code: string;
    name: string;
    category: string;
    specimenType: string;
    containerColor: string;
    fastingHours: number;
    tatHours: number;
    price: number;
    isActive: boolean;
  }>,
): Promise<TestCatalogDTO> {
  const test = await catalogRepo.findById(tenantId, id);
  if (!test) {
    throw new AppError({
      statusCode: 404,
      code: 'TEST_NOT_FOUND',
      message: 'Test not found',
      expose: true,
    });
  }

  if (data.code && data.code.toUpperCase().trim() !== test.code) {
    const existing = await catalogRepo.findByCode(tenantId, data.code);
    if (existing) {
      throw new AppError({
        statusCode: 409,
        code: 'DUPLICATE_TEST_CODE',
        message: `A test with code '${data.code.toUpperCase()}' already exists in this catalog`,
        expose: true,
      });
    }
  }

  const updated = await catalogRepo.update(tenantId, { _id: id }, {
    ...data,
    ...(data.code ? { code: data.code.toUpperCase().trim() } : {}),
  });

  if (!updated) {
    throw new AppError({
      statusCode: 404,
      code: 'TEST_NOT_FOUND',
      message: 'Test not found',
      expose: true,
    });
  }

  return mapTestToDTO(updated);
}

export async function getTestById(tenantId: string, id: string, includeParameters = true): Promise<TestCatalogDTO> {
  const test = await catalogRepo.findById(tenantId, id);
  if (!test) {
    throw new AppError({
      statusCode: 404,
      code: 'TEST_NOT_FOUND',
      message: 'Test not found',
      expose: true,
    });
  }

  let parameters: ITestParameterDocument[] | undefined;
  if (includeParameters) {
    parameters = await parameterRepo.findParametersByTestId(tenantId, id);
  }

  return mapTestToDTO(test, parameters);
}

export async function listTests(
  tenantId: string,
  options: {
    search?: string;
    category?: string;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  },
): Promise<{ tests: TestCatalogDTO[]; total: number; page: number; limit: number }> {
  const { tests, total } = await catalogRepo.listTests(tenantId, options);
  const page = options.page || 1;
  const limit = options.limit || 20;

  return {
    tests: tests.map((t) => mapTestToDTO(t)),
    total,
    page,
    limit,
  };
}

export async function addTestParameter(
  tenantId: string,
  testId: string,
  data: {
    name: string;
    unit: string;
    gender: 'ALL' | 'MALE' | 'FEMALE';
    minAge: number;
    maxAge: number;
    normalMin: number;
    normalMax: number;
    criticalMin?: number;
    criticalMax?: number;
  },
): Promise<TestParameterDTO> {
  const test = await catalogRepo.findById(tenantId, testId);
  if (!test) {
    throw new AppError({
      statusCode: 404,
      code: 'TEST_NOT_FOUND',
      message: 'Associated test not found',
      expose: true,
    });
  }

  const created = await parameterRepo.create(tenantId, {
    ...data,
    testId: test._id,
  });

  return mapParameterToDTO(created);
}

export async function getTestParameters(tenantId: string, testId: string): Promise<TestParameterDTO[]> {
  const parameters = await parameterRepo.findParametersByTestId(tenantId, testId);
  return parameters.map(mapParameterToDTO);
}
