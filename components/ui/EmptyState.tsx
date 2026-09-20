import React from "react";
import Link from "next/link";
import { Button } from "./Button";

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  action,
  className = "",
}: EmptyStateProps) {
  const resolvedAction = action ?? {
    label: actionText ?? "",
    href: actionHref,
    onClick: onAction,
  };
  return (
    <div
      className={`rounded-2xl border border-dashed border-[#292929] bg-[#111111]/60 p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#171717] border border-[#292929] text-[#A3A3A3] flex items-center justify-center mb-5">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold tracking-tight text-[#F5F5F5] uppercase">
        {title}
      </h3>
      <p className="mt-2 text-sm text-[#737373] max-w-sm leading-relaxed">
        {description}
      </p>
      {resolvedAction?.label && (resolvedAction.href || resolvedAction.onClick) && (
        <div className="mt-7">
          {resolvedAction.href ? (
            <Link href={resolvedAction.href}>
              <Button variant="primary" size="md">
                {resolvedAction.label}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="md" onClick={resolvedAction.onClick}>
              {resolvedAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
