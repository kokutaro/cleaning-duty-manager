import { prisma } from '@/lib/prisma'
import { getAssignmentCounts } from '@/lib/history'
import { format } from 'date-fns'
import { Table, Card } from '@mantine/core'

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
          <Table.Thead>
            <Table.Tr>
              <Table.Th>メンバー\場所</Table.Th>
              {places.map(p => (
                <Table.Th key={p} style={{ textAlign: 'right' }}>
                  {p}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {members.map(m => (
              <Table.Tr key={m}>
                <Table.Th>{m}</Table.Th>
                {places.map(p => (
                  <Table.Td key={p} style={{ textAlign: 'right' }}>
                    {matrix[m]?.[p] ?? 0}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </section>
    </>
  )
}
