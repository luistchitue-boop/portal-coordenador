"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Estudantes</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
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
            <ul className="space-y-2">
              {students.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </div>
                  <div>
                    <button className="text-sm text-destructive" onClick={() => handleDelete(s.id)}>Delete</button>
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
