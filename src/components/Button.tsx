import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary";
};

const base = "rounded text-sm font-medium";
const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-white",
  secondary: "border border-ink/15 bg-surface"
};

export function Button({
  variant = "secondary",
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  const classes = [base, variants[variant], className]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={classes} {...rest} />;
}
