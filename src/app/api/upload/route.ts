import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "cars");
    
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file || file.size === 0) continue;

      // ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // ตรวจสอบขนาดไฟล์ (สูงสุด 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      // สร้างชื่อไฟล์ใหม่
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `car_${timestamp}_${randomStr}.${ext}`;

      // บันทึกไฟล์
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);
      
      // เก็บ URL
      uploadedUrls.push(`/uploads/cars/${fileName}`);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "อัปโหลดล้มเหลว" }, { status: 500 });
  }
}