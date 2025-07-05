import React from 'react'
import {
  getWeeksWithAssignments,
  getCleaningCountMatrix,
} from '@/lib/history-data'
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
  const weeks = await getWeeksWithAssignments()
  const { members, places, matrix } = await getCleaningCountMatrix()

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
