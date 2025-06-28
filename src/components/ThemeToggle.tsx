"use client";
import { useMantineColorScheme } from "@mantine/core";
import { Select } from "@mantine/core";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Select
      value={colorScheme}
      onChange={(value) => {
        if (!value) return;
        setColorScheme(value as "light" | "dark" | "auto");
      }}
      data={[
        { value: "auto", label: "システム" },
        { value: "light", label: "ライト" },
        { value: "dark", label: "ダーク" },
      ]}
      size="xs"
      className="w-28"
    />
  );
}
