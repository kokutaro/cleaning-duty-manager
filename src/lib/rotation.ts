import { prisma } from "./prisma";
import { getWeekStart } from "./week";

async function fetchGroups() {
  const groups = await prisma.group.findMany({
    orderBy: { id: "asc" },
    include: {
      members: { orderBy: { id: "asc" } },
      places: { orderBy: { id: "asc" } },
    },
  });
  const ungroupMembers = await prisma.member.findMany({
    where: { groupId: null },
    orderBy: { id: "asc" },
  });
  const ungroupPlaces = await prisma.place.findMany({
    where: { groupId: null },
    orderBy: { id: "asc" },
  });
  return [
    ...groups,
    { id: null as number | null, name: "", members: ungroupMembers, places: ungroupPlaces },
  ];
}

export async function regenerateThisWeekAssignments() {
  // 今週の開始日
  const now = new Date();
  const weekStart = getWeekStart(now);

  // 今週のWeekレコード
  const week = await prisma.week.upsert({
    where: { startDate: weekStart },
    update: {},
    create: { startDate: weekStart },
  });

  // 既存の割り当てを削除
  await prisma.dutyAssignment.deleteMany({ where: { weekId: week.id } });

  const groups = await fetchGroups();

  for (const g of groups) {
    const { members, places } = g;
    if (members.length === 0 || places.length === 0) continue;
    for (let i = 0; i < places.length; i++) {
      await prisma.dutyAssignment.create({
        data: {
          weekId: week.id,
          placeId: places[i].id,
          memberId: members[i % members.length].id,
        },
      });
    }
  }
}

export async function advanceCurrentWeekRotation() {
  // 今週の開始日を計算
  const now = new Date();
  const weekStart = getWeekStart(now);

  const week = await prisma.week.upsert({
    where: { startDate: weekStart },
    update: {},
    create: { startDate: weekStart },
  });

  const groups = await fetchGroups();

  for (const g of groups) {
    const { members, places } = g;
    if (members.length === 0 || places.length === 0) continue;

    const assignments = await prisma.dutyAssignment.findMany({
      where: { weekId: week.id, place: { groupId: g.id } },
      orderBy: { placeId: "asc" },
    });

    if (assignments.length === 0) {
      for (let i = 0; i < places.length; i++) {
        await prisma.dutyAssignment.create({
          data: {
            weekId: week.id,
            placeId: places[i].id,
            memberId: members[i % members.length].id,
          },
        });
      }
      continue;
    }

    const firstIndex = members.findIndex((m) => m.id === assignments[0].memberId);
    const startIndex = (firstIndex - 1 + members.length) % members.length;

    await prisma.dutyAssignment.deleteMany({
      where: { weekId: week.id, place: { groupId: g.id } },
    });

    for (let i = 0; i < places.length; i++) {
      await prisma.dutyAssignment.create({
        data: {
          weekId: week.id,
          placeId: places[i].id,
          memberId: members[(startIndex + i) % members.length].id,
        },
      });
    }
  }
}

export async function autoRotateIfNeeded(weekStart: Date) {
  // 今週の割り当てが既にあれば何もしない
  const week = await prisma.week.findUnique({
    where: { startDate: weekStart },
    include: { assignments: true },
  });
  if (week && week.assignments.length > 0) return;

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const prevWeek = await prisma.week.findUnique({
    where: { startDate: prevWeekStart },
    include: {
      assignments: {
        include: { place: true, member: true },
        orderBy: { placeId: "asc" },
      },
    },
  });

  const groups = await fetchGroups();

  const newWeek = await prisma.week.upsert({
    where: { startDate: weekStart },
    update: {},
    create: { startDate: weekStart },
  });

  for (const g of groups) {
    const { members, places } = g;
    if (members.length === 0 || places.length === 0) continue;

    const prevAssignments = prevWeek?.assignments.filter(
      (a) => a.place.groupId === g.id
    );

    if (!prevAssignments || prevAssignments.length === 0) {
      for (let i = 0; i < places.length; i++) {
        await prisma.dutyAssignment.create({
          data: {
            weekId: newWeek.id,
            placeId: places[i].id,
            memberId: members[i % members.length].id,
          },
        });
      }
      continue;
    }

    const prevMembers = prevAssignments.map((a) => a.member);
    const rotated = [
      prevMembers[prevMembers.length - 1],
      ...prevMembers.slice(0, -1),
    ];

    for (let i = 0; i < places.length; i++) {
      await prisma.dutyAssignment.create({
        data: {
          weekId: newWeek.id,
          placeId: places[i].id,
          memberId: rotated[i % rotated.length].id,
        },
      });
    }
  }
}
