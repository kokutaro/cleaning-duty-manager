import { vi, expect, test, beforeEach, type Mock } from "vitest";

vi.mock("../prisma", () => {
  const prisma = {
    week: { upsert: vi.fn().mockResolvedValue({ id: 1 }) },
    place: {
      findMany: vi.fn().mockResolvedValue([
        { id: 1, groupId: null },
        { id: 2, groupId: null },
      ]),
    },
    member: {
      findMany: vi.fn().mockResolvedValue([
        { id: 10, groupId: null },
        { id: 20, groupId: null },
      ]),
    },
    group: { findMany: vi.fn().mockResolvedValue([]) },
    dutyAssignment: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  return { prisma };
});

import { prisma } from "../prisma";
import { advanceCurrentWeekRotation } from "../rotation";

const create = prisma.dutyAssignment.create as unknown as Mock;
const deleteMany = prisma.dutyAssignment.deleteMany as unknown as Mock;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
});

test("creates assignments when none exist", async () => {
  await advanceCurrentWeekRotation();
  expect(create).toHaveBeenCalledTimes(2);
  expect(deleteMany).not.toHaveBeenCalled();
  expect(create).toHaveBeenNthCalledWith(1, {
    data: { weekId: 1, placeId: 1, memberId: 10 },
  });
  expect(create).toHaveBeenNthCalledWith(2, {
    data: { weekId: 1, placeId: 2, memberId: 20 },
  });
});
