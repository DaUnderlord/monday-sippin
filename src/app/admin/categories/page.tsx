'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'

interface Category { id: string; name: string; slug: string; description?: string }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' })
      const json = await res.json()
      setCategories(json.data || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'Failed to create category')
      }
      setName('')
      setSlug('')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Typography variant="h2">Manage Categories</Typography>
        <Typography variant="body" className="text-slate-600 dark:text-slate-300">Create and view content categories</Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="DeFi" />
              </div>
              <div>
                <label className="block text-sm mb-1">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="defi" />
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-slate-500">Loading…</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-slate-500">No categories yet.</div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {categories.map((c) => (
                  <li key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-slate-500">/{c.slug}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
