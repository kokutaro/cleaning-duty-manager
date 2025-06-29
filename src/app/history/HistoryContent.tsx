import { prisma } from '@/lib/prisma'
import { getAssignmentCounts } from '@/lib/history'
import { format } from 'date-fns'

export async function HistoryContent() {
  const weeks = await prisma.week.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      assignments: {
        include: { place: true, member: true },
        orderBy: { placeId: 'asc' },
      },
    },
  })

  const countList = (await getAssignmentCounts()).sort(
    (a, b) =>
      a.memberName.localeCompare(b.memberName) ||
      a.placeName.localeCompare(b.placeName)
  )

  const members = Array.from(new Set(countList.map(c => c.memberName))).sort(
    (a, b) => a.localeCompare(b)
  )
  const places = Array.from(new Set(countList.map(c => c.placeName))).sort(
    (a, b) => a.localeCompare(b)
  )
  const matrix: Record<string, Record<string, number>> = {}
  for (const c of countList) {
    if (!matrix[c.memberName]) matrix[c.memberName] = {}
    matrix[c.memberName][c.placeName] = c.count
  }

  return (
    <>
      <section>
        <h1 className="text-2xl font-bold mb-6">アサイン履歴</h1>
        <div className="flex flex-col gap-8">
          {weeks.map(w => (
            <div
              key={w.id}
              className="border border-neutral-700 rounded-md p-4"
            >
              <h2 className="text-xl font-semibold mb-2">
                {format(w.startDate, 'yyyy年MM月dd日')}
              </h2>
              <ul className="list-disc list-inside space-y-1">
                {w.assignments.map(a => (
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
              <th className="border-b border-neutral-700 p-2">メンバー\場所</th>
              {places.map(p => (
                <th
                  key={p}
                  className="border-b border-neutral-700 p-2 text-right"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m}>
                <th className="border-b border-neutral-800 p-2">{m}</th>
                {places.map(p => (
                  <td
                    key={p}
                    className="border-b border-neutral-800 p-2 text-right"
                  >
                    {matrix[m]?.[p] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
