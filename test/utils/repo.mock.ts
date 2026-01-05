import { ObjectLiteral, Repository } from 'typeorm';

export type MockRepo<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;

export const createMockRepo = <T extends ObjectLiteral>(): MockRepo<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});
