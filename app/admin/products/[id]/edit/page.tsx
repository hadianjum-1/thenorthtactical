"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import {
  ImageUploader,
  type ProductImageOutput,
} from "@/components/admin/ImageUploader";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  featured: boolean;
  categoryId: string | null;
  variants: {
    sku: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
  }[];
  images: {
    id?: string;
    url: string;
    alt?: string | null;
    sortOrder?: number;
  }[];
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [featured, setFeatured] = useState(false);

  // Multi-image state
  const [images, setImages] = useState<ProductImageOutput[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/categories"),
        ]);

        const productData = await productResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (!productResponse.ok) {
          throw new Error(
            productData.message || "Failed to load product."
          );
        }

        const product: Product = productData.product;
        const variant = product.variants[0];

        setTitle(product.title);
        setSlug(product.slug);
        setDescription(product.description);
        setCategoryId(product.categoryId || "");
        setStatus(product.status);
        setFeatured(product.featured);

        if (variant) {
          setPrice(String(variant.price));
          setCompareAtPrice(
            variant.compareAtPrice !== null
              ? String(variant.compareAtPrice)
              : ""
          );
          setSku(variant.sku);
          setStock(String(variant.stock));
        }

        if (product.images && product.images.length > 0) {
          setImages(
            product.images.map((img, idx) => ({
              url: img.url,
              alt: img.alt || product.title,
              sortOrder:
                typeof img.sortOrder === "number" ? img.sortOrder : idx,
            }))
          );
        }

        if (categoriesResponse.ok) {
          setCategories(categoriesData.categories);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
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
          images, // Passes updated images list with sort order
          status,
          featured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update product."
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
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (delError) {
      setError(
        delError instanceof Error
          ? delError.message
          : "Failed to delete product."
      );
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading product...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-neutral-500 hover:text-white"
        >
          ← Back
        </button>

        <div className="mb-8 mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              TheNorthTactical
            </p>

            <h1 className="mt-2 text-4xl font-semibold">
              Edit Product
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-900/50 hover:text-white self-start sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete Product
          </button>
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
                  onChange={(e) => setTitle(e.target.value)}
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
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="Description">
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={7}
                  className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="Category">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white focus:border-neutral-500 focus:outline-none"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
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
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="Compare-at price (PKR)">
                <input
                  type="number"
                  min="0"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="SKU">
                <input
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                />
              </Field>

              <Field label="Stock">
                <input
                  required
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
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
                Upload or manage images for this product. The first image is used
                as the primary product photo. Drag images to reorder them.
              </p>
            </div>

            <ImageUploader
              initialImages={images}
              onChange={setImages}
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

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4"
                />

                <span className="text-sm">Featured product</span>
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-white px-6 py-4 font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* ── Danger Zone ────────────────────────────────────────── */}
        <section className="mt-12 rounded-2xl border border-red-950/60 bg-red-950/20 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-medium text-red-300">
                Delete product
              </h3>
              <p className="mt-1 text-sm text-neutral-400">
                Permanently remove this product and all associated images from the store.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-800/80 bg-red-950/50 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-900 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              Delete Product
            </button>
          </div>
        </section>

        {/* ── Delete Confirmation Modal ──────────────────────────── */}
        {showDeleteModal && (
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
                      "{title}"
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
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