"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Page() {
  const [teachers, setTeachers] = useState<any[]>([])

  async function load() {
    const res = await fetch('/api/professores')
    if (!res.ok) return
    const data = await res.json()
    setTeachers(data || [])
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Professores</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
        {teachers.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{t.email}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
