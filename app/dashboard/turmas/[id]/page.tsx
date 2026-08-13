"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function TurmaPage() {
  const params = useParams()
  const router = useRouter()
  const turmaId = params?.id
  const [students, setStudents] = useState<any[]>([])
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [name, setName] = useState("")
  const [registration, setRegistration] = useState("")
  const [email, setEmail] = useState("")

  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [gradeValue, setGradeValue] = useState("")
  const [gradeNote, setGradeNote] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [noteText, setNoteText] = useState("")

  async function loadStudents() {
    const res = await fetch(`/api/turmas/${turmaId}/students`)
    if (!res.ok) return
    const data = await res.json()
    setStudents(data || [])
  }

  async function loadPermissions() {
    const res = await fetch(`/api/turmas/${turmaId}/permissions`)
    if (!res.ok) {
      setAllowed(false)
      return
    }
    const data = await res.json()
    setAllowed(Boolean(data.allowed))
  }

  useEffect(() => { if (turmaId) { loadPermissions(); loadStudents() } }, [turmaId])

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/turmas/${turmaId}/students`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, registration, email }) })
    setName("")
    setRegistration("")
    setEmail("")
    loadStudents()
  }

  async function handleAddGrade(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStudent) return
    await fetch(`/api/turmas/${turmaId}/grades`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: selectedStudent, subjectId: Number(subjectId), value: Number(gradeValue), note: gradeNote }) })
    setGradeValue("")
    setGradeNote("")
    setSubjectId("")
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStudent) return
    await fetch(`/api/turmas/${turmaId}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: selectedStudent, note: noteText }) })
    setNoteText("")
  }

  if (allowed === false) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="text-muted-foreground mt-2">You are not authorized to view this turma.</p>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/turmas')}>Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Turma {turmaId}</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard/turmas')}>Back</Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
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
                    <button className="text-sm text-primary" onClick={() => setSelectedStudent(s.id)}>Select</button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Student</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStudent} className="space-y-3">
              <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Registration" value={registration} onChange={(e) => setRegistration(e.target.value)} />
              <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <CardFooter className="justify-end">
                <Button type="submit">Add student</Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGrade} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Student</label>
                <select value={selectedStudent ?? ""} onChange={(e) => setSelectedStudent(Number(e.target.value))} className="w-full rounded-lg border px-2 py-1">
                  <option value="">Select student</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <Input placeholder="Subject ID" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} />
              <Input placeholder="Value" value={gradeValue} onChange={(e) => setGradeValue(e.target.value)} />
              <Input placeholder="Note" value={gradeNote} onChange={(e) => setGradeNote(e.target.value)} />
              <CardFooter className="justify-end">
                <Button type="submit">Add grade</Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Disciplinary Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Student</label>
                <select value={selectedStudent ?? ""} onChange={(e) => setSelectedStudent(Number(e.target.value))} className="w-full rounded-lg border px-2 py-1">
                  <option value="">Select student</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <Input placeholder="Note" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
              <CardFooter className="justify-end">
                <Button type="submit">Add note</Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
