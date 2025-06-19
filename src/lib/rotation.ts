import { prisma } from "./prisma";

export async function regenerateThisWeekAssignments() {
  // 今週の開始日
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  // 今週のWeekレコード
  const week = await prisma.week.upsert({
    where: { startDate: weekStart },
    update: {},
    create: { startDate: weekStart },
  });

  // 既存の割り当てを削除
  await prisma.dutyAssignment.deleteMany({ where: { weekId: week.id } });

  // 担当者・場所リスト
  const members = await prisma.member.findMany({ orderBy: { id: "asc" } });
  const places = await prisma.place.findMany({ orderBy: { id: "asc" } });

  // 担当者がいなければ何もしない
  if (members.length === 0 || places.length === 0) return;

  // ローテーション: 担当者リストを一つずらす（またはID順で割り当て）
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

export async function rotateThisWeekFromLastWeek() {
  // 今週の開始日を計算
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  // 前週の開始日を取得
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  // 前週の割り当て取得
  const prevWeek = await prisma.week.findUnique({
    where: { startDate: prevWeekStart },
    include: {
      assignments: {
        include: { member: true },
        orderBy: { placeId: "asc" },
      },
    },
  });

  // 担当者・場所リスト取得
  const members = await prisma.member.findMany({ orderBy: { id: "asc" } });
  const places = await prisma.place.findMany({ orderBy: { id: "asc" } });

  // 今週のWeekレコード作成
  const week = await prisma.week.upsert({
    where: { startDate: weekStart },
    update: {},
    create: { startDate: weekStart },
  });

  // 既存の割り当てを削除
  await prisma.dutyAssignment.deleteMany({ where: { weekId: week.id } });

  // 前週がなければID順で割り当て
  if (!prevWeek || prevWeek.assignments.length === 0) {
    for (let i = 0; i < places.length; i++) {
      await prisma.dutyAssignment.create({
        data: {
          weekId: week.id,
          placeId: places[i].id,
          memberId: members[i % members.length].id,
        },
      });
    }
    return;
  }

  // 前週の担当者リストを一つずらす
  const prevMembers = prevWeek.assignments.map((a) => a.member);
  const rotated = [
    prevMembers[prevMembers.length - 1],
    ...prevMembers.slice(0, -1),
  ];

  for (let i = 0; i < places.length; i++) {
    await prisma.dutyAssignment.create({
      data: {
        weekId: week.id,
        placeId: places[i].id,
        memberId: rotated[i % rotated.length].id,
      },
    });
  }
}