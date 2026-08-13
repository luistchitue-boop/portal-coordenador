"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Page() {
  const [turmas, setTurmas] = useState<any[]>([])

  async function load() {
    const res = await fetch('/api/turmas')
    if (!res.ok) return
    const data = await res.json()
    setTurmas(data || [])
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Minipautas</h1>
      <p className="text-sm text-muted-foreground mt-2">Quick grade sheets and printable reports.</p>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
        {turmas.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">{t.description}</div>
              <Link href={`/dashboard/turmas/${t.id}`} className="text-primary">Open Turma</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
