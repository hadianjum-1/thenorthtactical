"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [featured, setFeatured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(
          "/api/admin/categories"
        );

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/products",
        {
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
            imageUrl,
            status,
            featured,
          }),
        }
      );

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
                    handleTitleChange(e.target.value)
                  }
                  placeholder="Example: Tactical Backpack"
                  className="input"
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
                  placeholder="Describe the product..."
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
                  disabled={loadingCategories}
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
                  placeholder="4999"
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
                  placeholder="5999"
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
                  placeholder="NT-BAG-001"
                  className="input"
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
                  className="input"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-medium">
              Product image
            </h2>

            <div className="mt-6">
              <Field label="Image URL">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) =>
                    setImageUrl(e.target.value)
                  }
                  placeholder="https://example.com/product.jpg"
                  className="input"
                />
              </Field>

              {imageUrl && (
                <div className="mt-5">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    className="h-48 w-full rounded-xl object-cover"
                  />
                </div>
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
            {loading ? "Creating product..." : "Create Product"}
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