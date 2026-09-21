"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImageUploader,
  type ProductImageOutput,
} from "@/components/admin/ImageUploader";

type Category = {
  id: string;
  name: string;
};

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("0");
  const [status, setStatus] = useState("DRAFT");
  const [featured, setFeatured] = useState(false);

  // Multi-image state
  const [images, setImages] = useState<ProductImageOutput[]>([]);
  const [imageError, setImageError] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/admin/categories");
        const data = await response.json();
        if (response.ok) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

  function handleImagesChange(updated: ProductImageOutput[]) {
    setImages(updated);
    setImageError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setImageError("");

    // Validate that uploads have completed (no in-flight files remain).
    // The ImageUploader only calls onChange when there are no pending uploads,
    // so if images is empty and the user hasn't touched the uploader yet,
    // we still allow submission (images are optional).
    setLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          description,
          categoryId: categoryId || null,
          price: Number(price),
          compareAtPrice: compareAtPrice
            ? Number(compareAtPrice)
            : null,
          sku,
          stock: Number(stock),
          images,   // ← array of { url, alt, sortOrder }
          status,
          featured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create product."
        );
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-neutral-500 hover:text-white"
          >
            ← Back
          </button>

          <p className="mt-6 text-sm uppercase tracking-[0.3em] text-neutral-500">
            TheNorthTactical
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Add Product
          </h1>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Basic information ──────────────────────────────────── */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-medium">
              Basic information
            </h2>

            <div className="mt-6 space-y-5">
              <Field label="Product title">
                <input
                  required
                  value={title}
                  onChange={(e) =>
                    handleTitleChange(e.target.value)
                  }
                  placeholder="Example: Tactical Backpack"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="URL slug">
                <input
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(generateSlug(e.target.value))
                  }
                  placeholder="tactical-backpack"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="Description">
                <textarea
                  required
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={7}
                  placeholder="Describe the product..."
                  className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="Category">
                <select
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value)
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white focus:border-neutral-500 focus:outline-none"
                  disabled={loadingCategories}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* ── Pricing & inventory ────────────────────────────────── */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-medium">
              Pricing &amp; inventory
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Price (PKR)">
                <input
                  required
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  placeholder="4999"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="Compare-at price (PKR)">
                <input
                  type="number"
                  min="0"
                  value={compareAtPrice}
                  onChange={(e) =>
                    setCompareAtPrice(e.target.value)
                  }
                  placeholder="5999"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="SKU">
                <input
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="NT-BAG-001"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="Stock quantity">
                <input
                  required
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white focus:border-neutral-500 focus:outline-none"
                />
              </Field>
            </div>
          </section>

          {/* ── Product images ─────────────────────────────────────── */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-medium">
                Product images
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Upload up to as many images as needed. The first
                image is used as the primary product photo.
              </p>
            </div>

            {imageError && (
              <p className="mb-4 text-sm text-red-400">
                {imageError}
              </p>
            )}

            <ImageUploader
              initialImages={[]}
              onChange={handleImagesChange}
              productTitle={title}
            />
          </section>

          {/* ── Publishing ─────────────────────────────────────────── */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-medium">Publishing</h2>

            <div className="mt-6 space-y-5">
              <Field label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white focus:border-neutral-500 focus:outline-none"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) =>
                    setFeatured(e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">
                  Feature this product
                </span>
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-6 py-4 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating product…" : "Create Product"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-neutral-300">
        {label}
      </label>
      {children}
    </div>
  );
}