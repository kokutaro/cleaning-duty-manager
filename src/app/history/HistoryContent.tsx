import { getAssignmentCounts } from '@/lib/history'
import { prisma } from '@/lib/prisma'
import {
  Card,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from '@mantine/core'
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
            <Card key={w.id} withBorder padding="md" radius="md">
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
            </Card>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">掃除回数集計</h2>
        <Table>
          <TableThead>
            <TableTr>
              <TableTh>メンバー\場所</TableTh>
              {places.map(p => (
                <TableTh key={p} style={{ textAlign: 'right' }}>
                  {p}
                </TableTh>
              ))}
            </TableTr>
          </TableThead>
          <TableTbody>
            {members.map(m => (
              <TableTr key={m}>
                <TableTh>{m}</TableTh>
                {places.map(p => (
                  <TableTd key={p} style={{ textAlign: 'right' }}>
                    {matrix[m]?.[p] ?? 0}
                  </TableTd>
                ))}
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </section>
    </>
  )
}
