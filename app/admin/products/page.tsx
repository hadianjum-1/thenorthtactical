"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

type Product = {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  category: {
    name: string;
  } | null;
  variants: {
    price: number;
    stock: number;
  }[];
  images: {
    url: string;
  }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load products.");
        }

        setProducts(data.products);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  async function handleConfirmDelete() {
    if (!productToDelete) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product.");
      }

      setProducts((prev) =>
        prev.filter((p) => p.id !== productToDelete.id)
      );

      setToastMessage(`Product "${productToDelete.title}" deleted.`);
      setTimeout(() => setToastMessage(""), 4000);

      setProductToDelete(null);
    } catch (delError) {
      setError(
        delError instanceof Error
          ? delError.message
          : "Failed to delete product."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Link
              href="/admin"
              className="text-sm text-neutral-500 hover:text-white"
            >
              Back to dashboard
            </Link>

            <p className="mt-6 text-sm uppercase tracking-[0.3em] text-neutral-500">
              TheNorthTactical
            </p>

            <h1 className="mt-2 text-4xl font-semibold">Products</h1>
          </div>

          <Link
            href="/admin/products/new"
            className="rounded-xl bg-white px-5 py-3 text-center text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
          >
            Add product
          </Link>
        </div>

        {toastMessage && (
          <div className="mb-6 rounded-xl border border-emerald-800 bg-emerald-950/40 p-4 text-emerald-300">
            {toastMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-neutral-400">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900 p-12 text-center">
            <h2 className="text-xl font-medium">No products yet</h2>
            <p className="mt-2 text-neutral-400">
              Add your first product to start building the catalog.
            </p>
            <Link
              href="/admin/products/new"
              className="mt-6 inline-block rounded-xl bg-white px-5 py-3 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
            >
              Add first product
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-neutral-800 text-neutral-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800">
                  {products.map((product) => {
                    const variant = product.variants[0];

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            {product.images[0] ? (
                              <img
                                src={product.images[0].url}
                                alt=""
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-neutral-800" />
                            )}
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="mt-1 text-xs text-neutral-500">
                                /{product.slug}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-neutral-400">
                          {product.category?.name || "Uncategorized"}
                        </td>
                        <td className="px-6 py-5">
                          PKR {variant?.price?.toLocaleString() || "0"}
                        </td>
                        <td className="px-6 py-5 text-neutral-400">
                          {variant?.stock ?? 0}
                        </td>
                        <td className="px-6 py-5">
                          <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                            {product.featured
                              ? "Featured"
                              : product.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="rounded-lg px-2.5 py-1.5 text-sm text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => setProductToDelete(product)}
                              className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-red-950/40 hover:text-red-400"
                              title="Delete product"
                              aria-label={`Delete ${product.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Confirmation Modal ──────────────────────────────────────── */}
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-950/60 border border-red-900/50 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Delete Product
                  </h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    Are you sure you want to delete{" "}
                    <span className="font-medium text-white">
                      "{productToDelete.title}"
                    </span>
                    ? This will permanently remove the product, variants, and
                    all attached photos.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setProductToDelete(null)}
                  className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition disabled:opacity-50"
                >
                  {deleting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {deleting ? "Deleting…" : "Delete Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}