import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const contact = await db.contact.create({
      data: {
        customerId: body.customerId,
        contactType: body.contactType,
        note: body.note,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      },
      include: { customer: true },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating contact' }, { status: 500 })
  }
}