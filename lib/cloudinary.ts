/**
 * lib/cloudinary.ts
 * Server-only Cloudinary utility.
 * Import ONLY in server-side files (API routes, Server Components, server actions).
 * Never import in "use client" files — CLOUDINARY_API_SECRET must not reach the browser.
 */

import { v2 as cloudinary } from "cloudinary";

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary environment variables. " +
        "Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and " +
        "CLOUDINARY_API_SECRET are set in .env."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validates and streams a single File to Cloudinary with maximum upload speed.
 * Omits eager transformations during upload to eliminate server-side encoding latency.
 * Applies CDN-level auto-formatting (`f_auto,q_auto`) directly to the returned delivery URL.
 *
 * @param file  A Web API File object (from formData.get/getAll)
 * @param folder  Cloudinary folder path (default: "thenorthtactical/products")
 */
export async function uploadImageToCloudinary(
  file: File,
  folder = "thenorthtactical/products"
): Promise<UploadResult> {
  // ── Server-side validation ────────────────────────────────────────────────
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      `Invalid file type "${file.type}". Only JPEG, PNG, and WebP images are allowed.`
    );
  }

  if (file.size > MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `File "${file.name}" is ${mb} MB. Maximum allowed size is 10 MB.`
    );
  }

  const client = getCloudinary();

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ── Fast Upload Stream ────────────────────────────────────────────────────
  // Note: No eager transformation here — Cloudinary stores immediately.
  // Delivery format & quality optimization (f_auto, q_auto) are applied dynamically
  // on Cloudinary's global CDN edge.
  const result = await new Promise<UploadResult>((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, uploadResult) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        if (!uploadResult) {
          reject(new Error("Cloudinary returned an empty response."));
          return;
        }

        // Deliver with automatic edge optimization (WebP/AVIF and quality auto)
        const rawUrl = uploadResult.secure_url;
        const deliveryUrl = rawUrl.includes("/upload/")
          ? rawUrl.replace("/upload/", "/upload/f_auto,q_auto/")
          : rawUrl;

        resolve({
          url: deliveryUrl,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
        });
      }
    );

    uploadStream.end(buffer);
  });

  return result;
}

export { cloudinary };
