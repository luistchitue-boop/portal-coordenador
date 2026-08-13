"use client"

import { useEffect, useState } from "react"
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function Page() {
  const [students, setStudents] = useState<any[]>([])
  const [name, setName] = useState("")
  const [registration, setRegistration] = useState("")
  const [email, setEmail] = useState("")

  async function load() {
    const res = await fetch('/api/students')
    if (!res.ok) return
    const data = await res.json()
    setStudents(data || [])
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, registration, email }) })
    setName('')
    setRegistration('')
    setEmail('')
    load()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete student?')) return
    await fetch(`/api/students/${id}`, { method: 'DELETE' })
    load()
  }

  function initials(name = "") {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Estudantes</h1>
      <div className="flex flex-col gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Add student</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Registration" value={registration} onChange={(e) => setRegistration(e.target.value)} />
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <CardFooter className="justify-end">
                <Button type="submit">Add student</Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="w-16">
                            <Avatar size="sm">
                              {s.avatar_url ? (
                                <AvatarImage src={s.avatar_url} alt={s.name} />
                              ) : (
                                <AvatarFallback>{initials(s.name)}</AvatarFallback>
                              )}
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.email}</div>
                          </TableCell>
                          <TableCell>{s.registration}</TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>
                            <button className="text-sm text-destructive" onClick={() => handleDelete(s.id)}>Delete</button>
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
