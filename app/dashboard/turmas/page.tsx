"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<any[]>([])
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const { data: session, status } = useSession()

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
      <div className="flex flex-col gap-4">
        {status !== 'loading' && (session as any)?.user?.admin ? (
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
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Your turmas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turmas.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Link href={`/dashboard/turmas/${t.id}`} className="font-medium">
                          {t.name}
                        </Link>
                      </TableCell>
                      <TableCell>{t.code}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/turmas/${t.id}`} className="text-primary">Open</Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
