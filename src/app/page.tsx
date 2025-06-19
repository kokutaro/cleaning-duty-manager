import { prisma } from "@/lib/prisma";
import { autoRotateIfNeeded } from "@/lib/rotation";
import { getWeekStart } from "@/lib/week";
import { updateRotation } from "./actions/rotation";
import { SubmitButton } from "@/components/SubmitButton";
import { format } from "date-fns";

export default async function Home() {
  // 今週の開始日を算出（例：月曜始まり）
  const now = new Date();
  const weekStart = getWeekStart(now);
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

  // 場所ごとの割り当てを検索
  const places = await prisma.place.findMany({ orderBy: { id: "asc" } });
  const assignmentsByPlace = places.map((place) => {
    const assignment = week?.assignments.find((a) => a.placeId === place.id);
    return {
      place,
      member: assignment?.member ?? null,
    };
  });
  const assignedIds = assignmentsByPlace
    .map((a) => a.member?.id)
    .filter((id): id is number => id !== undefined);
  const unassignedMembers = members.filter((m) => !assignedIds.includes(m.id));

  return (
    <main className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">今週のお掃除当番</h1>
      <div className="mb-2 text-gray-500">
        週の開始日: {format(weekStart, "yyyy年MM月dd日")}
      </div>
      <form action={updateRotation} className="mb-4">
        <SubmitButton type="submit">ローテーション更新</SubmitButton>
      </form>
      {members.length === 0 ? (
        <div className="text-red-500">ユーザーが登録されていません。</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4">
            {assignmentsByPlace.map(({ place, member }) => (
              <div
                key={place.id}
                className="w-48 border border-neutral-700 rounded-md bg-neutral-800 p-4"
              >
                <h2 className="text-lg font-semibold mb-2">{place.name}</h2>
                <p>{member ? member.name : "未割当"}</p>
              </div>
            ))}
          </div>
          {unassignedMembers.length > 0 && (
            <div className="mt-8">
              <div className="w-48 border border-neutral-700 rounded-md bg-neutral-800 p-4">
                <h2 className="text-lg font-semibold mb-2">なし</h2>
                <ul className="list-disc list-inside">
                  {unassignedMembers.map((m) => (
                    <li key={m.id}>{m.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
