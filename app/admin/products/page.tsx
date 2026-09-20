"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

            <h1 className="mt-2 text-4xl font-semibold">
              Products
            </h1>
          </div>

          <Link
            href="/admin/products/new"
            className="rounded-xl bg-white px-5 py-3 text-center text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
          >
            Add product
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
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
                    <th className="px-6 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800">
                  {products.map((product) => {
                    const variant = product.variants[0];

                    return (
                      <tr key={product.id} className="hover:bg-neutral-800/40">
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
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-sm text-neutral-400 hover:text-white"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}