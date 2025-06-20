import { prisma } from "@/lib/prisma";
import { getAssignmentCounts } from "@/lib/history";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const weeks = await prisma.week.findMany({
    orderBy: { startDate: "desc" },
    include: {
      assignments: {
        include: { place: true, member: true },
        orderBy: { placeId: "asc" },
      },
    },
  });

  const countList = (await getAssignmentCounts()).sort(
    (a, b) =>
      a.memberName.localeCompare(b.memberName) ||
      a.placeName.localeCompare(b.placeName)
  );

  return (
    <main className="max-w-4xl mx-auto py-10 flex flex-col gap-10">
      <section>
        <h1 className="text-2xl font-bold mb-6">アサイン履歴</h1>
        <div className="flex flex-col gap-8">
          {weeks.map((w) => (
            <div key={w.id} className="border border-neutral-700 rounded-md p-4">
              <h2 className="text-xl font-semibold mb-2">
                {format(w.startDate, "yyyy年MM月dd日")}
              </h2>
              <ul className="list-disc list-inside space-y-1">
                {w.assignments.map((a) => (
                  <li key={a.id}>
                    {a.place.name}: {a.member.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">掃除回数集計</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b border-neutral-700 p-2">メンバー</th>
              <th className="border-b border-neutral-700 p-2">場所</th>
              <th className="border-b border-neutral-700 p-2 text-right">回数</th>
            </tr>
          </thead>
          <tbody>
            {countList.map((c, idx) => (
              <tr key={idx}>
                <td className="border-b border-neutral-800 p-2">{c.memberName}</td>
                <td className="border-b border-neutral-800 p-2">{c.placeName}</td>
                <td className="border-b border-neutral-800 p-2 text-right">{c.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
