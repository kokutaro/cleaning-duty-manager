import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { regenerateThisWeekAssignments } from "@/lib/rotation";
import { ConfirmDeleteButton } from "./components/ConfirmDeleteButton";
import { getWeekStart } from "@/lib/week";

export default async function AdminPage() {
  const members = await prisma.member.findMany();
  const places = await prisma.place.findMany();

  async function addMember(formData: FormData) {
    "use server";
    const name = formData.get("memberName") as string;
    if (name) {
      await prisma.member.create({ data: { name } });
      await regenerateThisWeekAssignments();
      revalidatePath("/admin");
    }
  }

  async function addPlace(formData: FormData) {
    "use server";
    const name = formData.get("placeName") as string;
    if (name) {
      await prisma.place.create({ data: { name } });
      await regenerateThisWeekAssignments();
      revalidatePath("/admin");
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
  }

  return (
    <main className="max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">管理画面</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">ユーザー登録</h2>
        <form action={addMember} className="flex gap-2 mb-4">
          <input
            name="memberName"
            className="border px-2 py-1 rounded"
            placeholder="名前"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            追加
          </button>
        </form>
        <ul className="list-disc pl-5">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-2">
              {m.name}
              <form action={deleteMember}>
                <input type="hidden" name="memberId" value={m.id} />
                <ConfirmDeleteButton
                  type="submit"
                  className="ml-2 text-red-400 hover:text-red-600"
                >
                  削除
                </ConfirmDeleteButton>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">掃除場所登録</h2>
        <form action={addPlace} className="flex gap-2 mb-4">
          <input
            name="placeName"
            className="border px-2 py-1 rounded"
            placeholder="場所名"
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-1 rounded"
          >
            追加
          </button>
        </form>
        <ul className="list-disc pl-5">
          {places.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              {p.name}
              <form action={deletePlace}>
                <input type="hidden" name="placeId" value={p.id} />
                <ConfirmDeleteButton
                  type="submit"
                  className="ml-2 text-red-400 hover:text-red-600"
                >
                  削除
                </ConfirmDeleteButton>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
