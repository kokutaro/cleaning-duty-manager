import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { regenerateThisWeekAssignments } from "@/lib/rotation";
import { ConfirmDeleteButton } from "./components/ConfirmDeleteButton";
import { getWeekStart } from "@/lib/week";
import { SubmitButton } from "@/components/SubmitButton";

export default async function AdminPage() {
  const members = await prisma.member.findMany({ include: { group: true } });
  const places = await prisma.place.findMany({ include: { group: true } });
  const groups = await prisma.group.findMany();

  async function addMember(formData: FormData) {
    "use server";
    const name = formData.get("memberName") as string;
    const groupIdValue = formData.get("memberGroupId") as string;
    const groupId = groupIdValue ? Number(groupIdValue) : null;
    if (name) {
      await prisma.member.create({ data: { name, groupId } });
      await regenerateThisWeekAssignments();
      revalidatePath("/admin");
      revalidatePath("/");
    }
  }

  async function addPlace(formData: FormData) {
    "use server";
    const name = formData.get("placeName") as string;
    const groupIdValue = formData.get("placeGroupId") as string;
    const groupId = groupIdValue ? Number(groupIdValue) : null;
    if (name) {
      await prisma.place.create({ data: { name, groupId } });
      await regenerateThisWeekAssignments();
      revalidatePath("/admin");
      revalidatePath("/");
    }
  }

  async function deleteMember(formData: FormData) {
    "use server";
    const id = Number(formData.get("memberId"));
    if (!id) return;

    // サーバーアクション内で再取得
    const weekStart = getWeekStart();
    const week = await prisma.week.findUnique({
      where: { startDate: weekStart },
      include: { assignments: true },
    });

    const assigned = week?.assignments.some((a) => a.memberId === id);
    await prisma.member.delete({ where: { id } });
    if (assigned) {
      await regenerateThisWeekAssignments();
    }
    revalidatePath("/admin");
    revalidatePath("/");
  }

  async function deletePlace(formData: FormData) {
    "use server";
    const id = Number(formData.get("placeId"));
    if (!id) return;

    // サーバーアクション内で再取得
    const weekStart = getWeekStart();
    const week = await prisma.week.findUnique({
      where: { startDate: weekStart },
      include: { assignments: true },
    });

    const assigned = week?.assignments.some((a) => a.placeId === id);
    await prisma.place.delete({ where: { id } });
    if (assigned) {
      await regenerateThisWeekAssignments();
    }
    revalidatePath("/admin");
    revalidatePath("/");
  }

  async function updateMemberName(formData: FormData) {
    "use server";
    const id = Number(formData.get("memberId"));
    const name = formData.get("memberName") as string;
    if (!id || !name) return;
    await prisma.member.update({ where: { id }, data: { name } });
    revalidatePath("/admin");
    revalidatePath("/");
  }

  async function updatePlaceName(formData: FormData) {
    "use server";
    const id = Number(formData.get("placeId"));
    const name = formData.get("placeName") as string;
    if (!id || !name) return;
    await prisma.place.update({ where: { id }, data: { name } });
    revalidatePath("/admin");
    revalidatePath("/");
  }

  async function addGroup(formData: FormData) {
    "use server";
    const name = formData.get("groupName") as string;
    if (name) {
      await prisma.group.create({ data: { name } });
      revalidatePath("/admin");
      revalidatePath("/");
    }
  }

  async function deleteGroup(formData: FormData) {
    "use server";
    const id = Number(formData.get("groupId"));
    if (!id) return;
    await prisma.group.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/");
  }

  async function updateMemberGroup(formData: FormData) {
    "use server";
    const id = Number(formData.get("memberId"));
    const groupIdValue = formData.get("memberGroupId") as string;
    const groupId = groupIdValue ? Number(groupIdValue) : null;
    if (!id) return;
    await prisma.member.update({ where: { id }, data: { groupId } });
    await regenerateThisWeekAssignments();
    revalidatePath("/admin");
    revalidatePath("/");
  }

  async function updatePlaceGroup(formData: FormData) {
    "use server";
    const id = Number(formData.get("placeId"));
    const groupIdValue = formData.get("placeGroupId") as string;
    const groupId = groupIdValue ? Number(groupIdValue) : null;
    if (!id) return;
    await prisma.place.update({ where: { id }, data: { groupId } });
    await regenerateThisWeekAssignments();
    revalidatePath("/admin");
    revalidatePath("/");
  }

  return (
    <main className="mx-auto w-full max-w-4xl py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">管理画面</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">グループ登録</h2>
        <form action={addGroup} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            name="groupName"
            className="border px-2 py-1 rounded w-full sm:w-auto"
            placeholder="グループ名"
            required
          />
          <SubmitButton type="submit">追加</SubmitButton>
        </form>
        <ul className="divide-y divide-neutral-700 border border-neutral-700 rounded-md">
          {groups.map((g) => (
            <li
              key={g.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-2"
            >
              <span>{g.name}</span>
              <form action={deleteGroup}>
                <input type="hidden" name="groupId" value={g.id} />
                <ConfirmDeleteButton type="submit">削除</ConfirmDeleteButton>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">ユーザー登録</h2>
        <form action={addMember} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            name="memberName"
            className="border px-2 py-1 rounded w-full sm:w-auto"
            placeholder="名前"
            required
          />
          <select name="memberGroupId" className="border px-2 py-1 rounded w-full sm:w-auto">
            <option value="">未割当</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <SubmitButton type="submit">追加</SubmitButton>
        </form>
        <ul className="divide-y divide-neutral-700 border border-neutral-700 rounded-md">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-2"
            >
              <form action={updateMemberName} className="flex flex-col sm:flex-row gap-2">
                <input type="hidden" name="memberId" value={m.id} />
                <input
                  name="memberName"
                  defaultValue={m.name}
                  className="border px-2 py-1 rounded w-full sm:w-auto"
                />
                <SubmitButton type="submit" variant="success">保存</SubmitButton>
              </form>
              <div className="flex flex-col sm:flex-row gap-2">
                <form action={updateMemberGroup} className="flex flex-col sm:flex-row gap-2">
                  <input type="hidden" name="memberId" value={m.id} />
                  <select
                    name="memberGroupId"
                    defaultValue={m.groupId ?? ""}
                    className="border px-2 py-1 rounded w-full sm:w-auto"
                  >
                    <option value="">未割当</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <SubmitButton type="submit" variant="success">
                    変更
                  </SubmitButton>
                </form>
                <form action={deleteMember}>
                  <input type="hidden" name="memberId" value={m.id} />
                  <ConfirmDeleteButton type="submit">削除</ConfirmDeleteButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">掃除場所登録</h2>
        <form action={addPlace} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            name="placeName"
            className="border px-2 py-1 rounded w-full sm:w-auto"
            placeholder="場所名"
            required
          />
          <select name="placeGroupId" className="border px-2 py-1 rounded w-full sm:w-auto">
            <option value="">未割当</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <SubmitButton variant="success" type="submit">
            追加
          </SubmitButton>
        </form>
        <ul className="divide-y divide-neutral-700 border border-neutral-700 rounded-md">
          {places.map((p) => (
            <li
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-2"
            >
              <form action={updatePlaceName} className="flex flex-col sm:flex-row gap-2">
                <input type="hidden" name="placeId" value={p.id} />
                <input
                  name="placeName"
                  defaultValue={p.name}
                  className="border px-2 py-1 rounded w-full sm:w-auto"
                />
                <SubmitButton type="submit" variant="success">保存</SubmitButton>
              </form>
              <div className="flex flex-col sm:flex-row gap-2">
                <form action={updatePlaceGroup} className="flex flex-col sm:flex-row gap-2">
                  <input type="hidden" name="placeId" value={p.id} />
                  <select
                    name="placeGroupId"
                    defaultValue={p.groupId ?? ""}
                    className="border px-2 py-1 rounded w-full sm:w-auto"
                  >
                    <option value="">未割当</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <SubmitButton type="submit" variant="success">
                    変更
                  </SubmitButton>
                </form>
                <form action={deletePlace}>
                  <input type="hidden" name="placeId" value={p.id} />
                  <ConfirmDeleteButton type="submit">削除</ConfirmDeleteButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
