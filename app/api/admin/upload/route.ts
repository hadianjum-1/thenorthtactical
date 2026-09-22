/**
 * POST /api/admin/upload
 *
 * Accepts multipart/form-data with one or more "images" fields.
 * Requires an authenticated ADMIN or STAFF session.
 * Validates each file server-side (type and size).
 * Uploads to Cloudinary and returns the resulting URLs + publicIds.
 *
 * Never exposes CLOUDINARY_API_SECRET to the client.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "STAFF"
  ) {
    return null;
  }

  return session;
}

export async function POST(request: Request) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── Parse multipart body ────────────────────────────────────────────────
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request — expected multipart/form-data.",
        },
        { status: 400 }
      );
    }

    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No images provided. Include at least one file.",
        },
        { status: 400 }
      );
    }

    // Guard: reject non-File values (e.g. string fields named "images")
    const validFiles = files.filter(
      (f) => f instanceof File && f.size > 0
    );

    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid image files received.",
        },
        { status: 400 }
      );
    }

    // ── Upload each file in parallel ────────────────────────────────────────
    const uploadPromises = validFiles.map(async (file) => {
      try {
        const uploaded = await uploadImageToCloudinary(file);
        return {
          success: true as const,
          url: uploaded.url,
          publicId: uploaded.publicId,
          originalName: file.name,
        };
      } catch (err) {
        return {
          success: false as const,
          file: file.name,
          message:
            err instanceof Error ? err.message : "Upload failed",
        };
      }
    });

    const uploadResults = await Promise.all(uploadPromises);

    const results: {
      url: string;
      publicId: string;
      originalName: string;
    }[] = [];

    const errors: { file: string; message: string }[] = [];

    for (const res of uploadResults) {
      if (res.success) {
        results.push({
          url: res.url,
          publicId: res.publicId,
          originalName: res.originalName,
        });
      } else {
        errors.push({
          file: res.file,
          message: res.message,
        });
      }
    }

    // If every file failed, return an error.
    if (results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "All uploads failed.",
          errors,
        },
        { status: 422 }
      );
    }

    // If some files succeeded and some failed, report both.
    return NextResponse.json(
      {
        success: true,
        images: results,
        ...(errors.length > 0 && { partialErrors: errors }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during upload.",
      },
      { status: 500 }
    );
  }
}
