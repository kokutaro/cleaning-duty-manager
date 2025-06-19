import { prisma } from "../lib/prisma";
import { rotateThisWeekFromLastWeek } from "../lib/rotation";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

async function autoRotateIfNeeded(weekStart: Date) {
  // 今週の割り当てが既にあれば何もしない
  const week = await prisma.week.findUnique({
    where: { startDate: weekStart },
    include: { assignments: true },
  });
  if (week && week.assignments.length > 0) return;

  // 前週の開始日
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  // 前週の割り当て取得
  const prevWeek = await prisma.week.findUnique({
    where: { startDate: prevWeekStart },
    include: {
      assignments: {
        include: { place: true, member: true },
        orderBy: { placeId: "asc" },
      },
    },
  });

  // 担当者・場所リスト取得
  const members = await prisma.member.findMany({ orderBy: { id: "asc" } });
  const places = await prisma.place.findMany({ orderBy: { id: "asc" } });

  // 今週のWeekレコード作成
  const newWeek = await prisma.week.upsert({
    where: { startDate: weekStart },
    update: {},
    create: { startDate: weekStart },
  });

  // 前週がなければ初期割り当て（ID順で割り当て）
  if (!prevWeek || prevWeek.assignments.length === 0) {
    for (let i = 0; i < places.length; i++) {
      await prisma.dutyAssignment.create({
        data: {
          weekId: newWeek.id,
          placeId: places[i].id,
          memberId: members[i % members.length].id,
        },
      });
    }
    return;
  }

  // ローテーション: 前週の担当者リストを一つずらす
  const prevMembers = prevWeek.assignments.map(a => a.member);
  const rotated = [prevMembers[prevMembers.length - 1], ...prevMembers.slice(0, -1)];

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

async function updateRotation() {
  "use server";
  await rotateThisWeekFromLastWeek();
  revalidatePath("/");
}
export default async function Home() {
  // 今週の開始日を算出（例：月曜始まり）
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  await autoRotateIfNeeded(weekStart);

  // 今週のWeekレコード取得
  const week = await prisma.week.findUnique({
    where: { startDate: weekStart },
    include: {
      assignments: {
        include: {
          place: true,
          member: true,
        },
      },
    },
  });

  // 全ユーザー取得
  const members = await prisma.member.findMany({ orderBy: { id: "asc" } });

  // ユーザーごとに今週の割り当てを検索
  const assignmentsByMember = members.map((member) => {
    const assignment = week?.assignments.find((a) => a.memberId === member.id);
    return {
      member,
      place: assignment?.place?.name ?? "なし",
    };
  });

  return (
    <main className="max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">今週のお掃除当番</h1>
      <div className="mb-2 text-gray-500">
        週の開始日: {format(weekStart, "yyyy年MM月dd日")}
      </div>
      <form action={updateRotation} className="mb-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          ローテーション更新
        </button>
      </form>
      {members.length === 0 ? (
        <div className="text-red-500">ユーザーが登録されていません。</div>
      ) : (
        <table className="w-full border border-neutral-700 mt-4 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-neutral-800 text-neutral-300">
              <th className="py-2 px-4 border-b border-neutral-700">担当者</th>
              <th className="py-2 px-4 border-b border-neutral-700">場所</th>
            </tr>
          </thead>
          <tbody>
            {assignmentsByMember.map(({ member, place }) => (
              <tr key={member.id} className="even:bg-neutral-800">
                <td className="py-2 px-4 border-b border-neutral-700">{member.name}</td>
                <td className="py-2 px-4 border-b border-neutral-700">{place}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}