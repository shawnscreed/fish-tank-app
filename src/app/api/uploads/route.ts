import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || !file.name) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Generate filename and path
  const filename = `${uuidv4()}.jpg`;
  const filepath = path.join(process.cwd(), "public/uploads", filename);

  try {
    // Resize and save the image using sharp
    await sharp(buffer)
      .resize(400, 400, { fit: "cover" }) // Square 1" optimized size
      .jpeg({ quality: 80 })
      .toFile(filepath);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("Image processing error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
