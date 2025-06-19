"use server";

import { advanceCurrentWeekRotation } from "@/lib/rotation";
import { revalidatePath } from "next/cache";

export async function updateRotation() {
  await advanceCurrentWeekRotation();
  revalidatePath("/");
}
