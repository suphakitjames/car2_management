import type { NextApiRequest, NextApiResponse } from "next"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { name, email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" })
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        name: name || "",
        email,
        password: hashedPassword,
        role: "user",
      },
    })

    return res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ",
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" })
  }
}