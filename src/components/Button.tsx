"use client";
import React from "react";
import { Button as MantineButton, type MantineColor } from "@mantine/core";

export type ButtonVariant = "primary" | "success" | "danger";

const colorMap: Record<ButtonVariant, MantineColor> = {
  primary: "blue",
  success: "green",
  danger: "red",
};

export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", ...props }, ref) {
    return (
      <MantineButton
        ref={ref}
        color={colorMap[variant]}
        data-variant={variant}
        {...props}
      />
    );
  },
);
