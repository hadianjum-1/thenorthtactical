import React from "react";
import { Badge } from "./Badge";

export interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "product" | "stock";
  className?: string;
}

export function StatusBadge({ status, type = "order", className = "" }: StatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  if (type === "stock") {
    const stockCount = Number(status);
    if (isNaN(stockCount) || stockCount <= 0) {
      return (
        <Badge variant="danger" className={className}>
          Out of Stock
        </Badge>
      );
    }
    if (stockCount <= 4) {
      return (
        <Badge variant="warning" className={className}>
          Low Stock ({stockCount})
        </Badge>
      );
    }
    return (
      <Badge variant="success" className={className}>
        In Stock ({stockCount})
      </Badge>
    );
  }

  if (type === "product") {
    switch (normalized) {
      case "ACTIVE":
        return <Badge variant="accent" className={className}>Active</Badge>;
      case "DRAFT":
        return <Badge variant="warning" className={className}>Draft</Badge>;
      case "ARCHIVED":
        return <Badge variant="muted" className={className}>Archived</Badge>;
      default:
        return <Badge variant="default" className={className}>{status}</Badge>;
    }
  }

  if (type === "payment") {
    switch (normalized) {
      case "PAID":
        return <Badge variant="success" className={className}>Paid</Badge>;
      case "PENDING":
        return <Badge variant="warning" className={className}>Payment Pending</Badge>;
      case "FAILED":
        return <Badge variant="danger" className={className}>Payment Failed</Badge>;
      case "REFUNDED":
        return <Badge variant="muted" className={className}>Refunded</Badge>;
      default:
        return <Badge variant="default" className={className}>{status}</Badge>;
    }
  }

  // Order status
  switch (normalized) {
    case "PENDING":
      return <Badge variant="warning" className={className}>Pending</Badge>;
    case "CONFIRMED":
      return <Badge variant="default" className={className}>Confirmed</Badge>;
    case "PROCESSING":
      return <Badge variant="accent" className={className}>Processing</Badge>;
    case "SHIPPED":
      return <Badge variant="accent" className={className}>Shipped</Badge>;
    case "DELIVERED":
    case "FULFILLED":
      return <Badge variant="success" className={className}>Delivered</Badge>;
    case "CANCELLED":
      return <Badge variant="danger" className={className}>Cancelled</Badge>;
    case "REFUNDED":
    case "RETURNED":
      return <Badge variant="muted" className={className}>Returned</Badge>;
    default:
      return <Badge variant="default" className={className}>{status}</Badge>;
  }
}
