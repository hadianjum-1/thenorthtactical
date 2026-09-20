"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
    url: string;
  }[];
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] =
    useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [featured, setFeatured] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [productResponse, categoriesResponse] =
          await Promise.all([
            fetch(`/api/admin/products/${id}`),
            fetch("/api/admin/categories"),
          ]);

        const productData = await productResponse.json();
        const categoriesData =
          await categoriesResponse.json();

        if (!productResponse.ok) {
          throw new Error(
            productData.message ||
              "Failed to load product."
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

        if (product.images[0]) {
          setImageUrl(product.images[0].url);
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/products/${id}`,
        {
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
            imageUrl,
            status,
            featured,
          }),
        }
      );

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

        <div className="mb-8 mt-6">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
            TheNorthTactical
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Edit Product
          </h1>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
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
                    setTitle(e.target.value)
                  }
                  className="input"
                />
              </Field>

              <Field label="URL slug">
                <input
                  required
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value)
                  }
                  className="input"
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
                  className="input resize-none"
                />
              </Field>

              <Field label="Category">
                <select
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value)
                  }
                  className="input"
                >
                  <option value="">
                    Uncategorized
                  </option>

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

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-medium">
              Pricing & inventory
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
                  className="input"
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
                  className="input"
                />
              </Field>

              <Field label="SKU">
                <input
                  required
                  value={sku}
                  onChange={(e) =>
                    setSku(e.target.value)
                  }
                  className="input"
                />
              </Field>

              <Field label="Stock">
                <input
                  required
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) =>
                    setStock(e.target.value)
                  }
                  className="input"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-medium">
              Image
            </h2>

            <div className="mt-6">
              <Field label="Image URL">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) =>
                    setImageUrl(e.target.value)
                  }
                  className="input"
                />
              </Field>

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={title}
                  className="mt-5 h-48 w-full rounded-xl object-cover"
                />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-medium">
              Publishing
            </h2>

            <div className="mt-6 space-y-5">
              <Field label="Status">
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="input"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">
                    Archived
                  </option>
                </select>
              </Field>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) =>
                    setFeatured(e.target.checked)
                  }
                />

                <span className="text-sm">
                  Featured product
                </span>
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-white px-6 py-4 font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
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