import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { isTeacherManager, isUserAdmin } from "@/lib/services"

export async function GET(req: Request, context: { params: any }) {
  const session = await getServerAuthSession()
  if (!session || !((session.user as any)?.id)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const p = context.params
  const turmaId = Number(p.id)
  const uid = Number((session.user as any).id)

  const manager = await isTeacherManager(turmaId, uid)
  const admin = await isUserAdmin(uid)
  return NextResponse.json({ allowed: manager || admin, isManager: manager, isAdmin: admin })
}
