"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<any[]>([])
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")

  async function load() {
    const res = await fetch("/api/turmas")
    const data = await res.json()
    setTurmas(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/turmas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code, description }),
    })
    setName("")
    setCode("")
    setDescription("")
    load()
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Turmas</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create turma</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm mb-1">Code</label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <CardFooter className="justify-end">
                <Button type="submit">Create</Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your turmas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {turmas.map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <div>
                    <Link href={`/turmas/${t.id}`} className="font-medium">
                      {t.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{t.description}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
