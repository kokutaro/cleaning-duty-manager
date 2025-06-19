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


export async function advanceCurrentWeekRotation() {
  // 今週の開始日を計算
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  const week = await prisma.week.upsert({
    where: { startDate: weekStart },
    update: {},
    create: { startDate: weekStart },
  });


  const places = await prisma.place.findMany({ orderBy: { id: "asc" } });
  const members = await prisma.member.findMany({ orderBy: { id: "asc" } });

  const assignments = await prisma.dutyAssignment.findMany({
    where: { weekId: week.id },
    orderBy: { placeId: "asc" },
  });

  // 割り当てがない場合は初期生成
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
    return;
  }

  // 先頭担当者のインデックス
  const firstIndex = members.findIndex((m) => m.id === assignments[0].memberId);
  const startIndex = (firstIndex - 1 + members.length) % members.length;

  await prisma.dutyAssignment.deleteMany({ where: { weekId: week.id } });

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
