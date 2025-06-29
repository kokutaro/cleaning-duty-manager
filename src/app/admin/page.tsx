import { prisma } from '@/lib/prisma'
import { ConfirmDeleteButton } from './components/ConfirmDeleteButton'
import { SubmitButton } from '@/components/SubmitButton'
import { TextInput, Select, Group, Stack, Paper, Divider } from '@mantine/core'
import {
  addMember,
  deleteMember,
  updateMemberName,
  updateMemberGroup,
} from '../actions/members'
import {
  addPlace,
  deletePlace,
  updatePlaceName,
  updatePlaceGroup,
} from '../actions/places'
import { addGroup, deleteGroup } from '../actions/groups'

export default async function AdminPage() {
  const members = await prisma.member.findMany({ include: { group: true } })
  const places = await prisma.place.findMany({ include: { group: true } })
  const groups = await prisma.group.findMany()

  return (
    <main className="mx-auto w-full max-w-4xl py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">管理画面</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">グループ登録</h2>
        <form action={addGroup} className="mb-4">
          <Group>
            <TextInput
              name="groupName"
              placeholder="グループ名"
              required
              style={{ flex: 1 }}
            />
            <SubmitButton type="submit">追加</SubmitButton>
          </Group>
        </form>
        <Paper withBorder radius="md">
          <Stack gap="xs">
            {groups.map((g, index) => (
              <div key={g.id}>
                <Group justify="space-between" className="px-4 py-2">
                  <span>{g.name}</span>
                  <form action={deleteGroup}>
                    <input type="hidden" name="groupId" value={g.id} />
                    <ConfirmDeleteButton type="submit">
                      削除
                    </ConfirmDeleteButton>
                  </form>
                </Group>
                {index < groups.length - 1 && <Divider />}
              </div>
            ))}
          </Stack>
        </Paper>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">ユーザー登録</h2>
        <form action={addMember} className="mb-4">
          <Group>
            <TextInput
              name="memberName"
              placeholder="名前"
              required
              style={{ flex: 1 }}
            />
            <Select
              name="memberGroupId"
              placeholder="未割当"
              data={[
                { value: '', label: '未割当' },
                ...groups.map(g => ({ value: g.id.toString(), label: g.name })),
              ]}
              style={{ minWidth: 150 }}
              clearable
            />
            <SubmitButton type="submit">追加</SubmitButton>
          </Group>
        </form>
        <Paper withBorder radius="md">
          <Stack gap="xs">
            {members.map((m, index) => (
              <div key={m.id}>
                <div className="px-4 py-2">
                  <Group justify="space-between" wrap="wrap">
                    <form action={updateMemberName}>
                      <Group>
                        <input type="hidden" name="memberId" value={m.id} />
                        <TextInput
                          name="memberName"
                          defaultValue={m.name}
                          style={{ minWidth: 150 }}
                        />
                        <SubmitButton type="submit" variant="success">
                          保存
                        </SubmitButton>
                      </Group>
                    </form>
                    <Group>
                      <form action={updateMemberGroup}>
                        <Group>
                          <input type="hidden" name="memberId" value={m.id} />
                          <Select
                            name="memberGroupId"
                            defaultValue={m.groupId?.toString() ?? ''}
                            data={[
                              { value: '', label: '未割当' },
                              ...groups.map(g => ({
                                value: g.id.toString(),
                                label: g.name,
                              })),
                            ]}
                            style={{ minWidth: 120 }}
                            clearable
                          />
                          <SubmitButton type="submit" variant="success">
                            変更
                          </SubmitButton>
                        </Group>
                      </form>
                      <form action={deleteMember}>
                        <input type="hidden" name="memberId" value={m.id} />
                        <ConfirmDeleteButton type="submit">
                          削除
                        </ConfirmDeleteButton>
                      </form>
                    </Group>
                  </Group>
                </div>
                {index < members.length - 1 && <Divider />}
              </div>
            ))}
          </Stack>
        </Paper>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">掃除場所登録</h2>
        <form action={addPlace} className="mb-4">
          <Group>
            <TextInput
              name="placeName"
              placeholder="場所名"
              required
              style={{ flex: 1 }}
            />
            <Select
              name="placeGroupId"
              placeholder="未割当"
              data={[
                { value: '', label: '未割当' },
                ...groups.map(g => ({ value: g.id.toString(), label: g.name })),
              ]}
              style={{ minWidth: 150 }}
              clearable
            />
            <SubmitButton variant="success" type="submit">
              追加
            </SubmitButton>
          </Group>
        </form>
        <Paper withBorder radius="md">
          <Stack gap="xs">
            {places.map((p, index) => (
              <div key={p.id}>
                <div className="px-4 py-2">
                  <Group justify="space-between" wrap="wrap">
                    <form action={updatePlaceName}>
                      <Group>
                        <input type="hidden" name="placeId" value={p.id} />
                        <TextInput
                          name="placeName"
                          defaultValue={p.name}
                          style={{ minWidth: 150 }}
                        />
                        <SubmitButton type="submit" variant="success">
                          保存
                        </SubmitButton>
                      </Group>
                    </form>
                    <Group>
                      <form action={updatePlaceGroup}>
                        <Group>
                          <input type="hidden" name="placeId" value={p.id} />
                          <Select
                            name="placeGroupId"
                            defaultValue={p.groupId?.toString() ?? ''}
                            data={[
                              { value: '', label: '未割当' },
                              ...groups.map(g => ({
                                value: g.id.toString(),
                                label: g.name,
                              })),
                            ]}
                            style={{ minWidth: 120 }}
                            clearable
                          />
                          <SubmitButton type="submit" variant="success">
                            変更
                          </SubmitButton>
                        </Group>
                      </form>
                      <form action={deletePlace}>
                        <input type="hidden" name="placeId" value={p.id} />
                        <ConfirmDeleteButton type="submit">
                          削除
                        </ConfirmDeleteButton>
                      </form>
                    </Group>
                  </Group>
                </div>
                {index < places.length - 1 && <Divider />}
              </div>
            ))}
          </Stack>
        </Paper>
      </section>
    </main>
  )
}
