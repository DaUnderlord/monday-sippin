'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  Download,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import { Article, ArticleStatus } from '@/types'
import { useContentModeration } from '@/hooks/useContentModeration'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export function ContentModeration() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all')
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: string
    articles: string[]
    message: string
  } | null>(null)
  
  const { 
    articles, 
    isLoading, 
    updateArticleStatus,
    deleteArticles,
    exportArticles,
    refetch 
  } = useContentModeration()
  
  const { toast } = useToast()

  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(filteredArticles.map(article => article.id))
    } else {
      setSelectedArticles([])
    }
  }

  const handleSelectArticle = (articleId: string, checked: boolean) => {
    if (checked) {
      setSelectedArticles(prev => [...prev, articleId])
    } else {
      setSelectedArticles(prev => prev.filter(id => id !== articleId))
    }
  }

  const handleBulkAction = () => {
    if (!bulkAction || selectedArticles.length === 0) return

    let message = ''
    switch (bulkAction) {
      case 'publish':
        message = `Publish ${selectedArticles.length} selected articles?`
        break
      case 'draft':
        message = `Move ${selectedArticles.length} selected articles to draft?`
        break
      case 'archive':
        message = `Archive ${selectedArticles.length} selected articles?`
        break
      case 'delete':
        message = `Delete ${selectedArticles.length} selected articles? This action cannot be undone.`
        break
      default:
        return
    }

    setConfirmAction({
      type: bulkAction,
      articles: selectedArticles,
      message
    })
    setIsConfirmDialogOpen(true)
  }

  const executeBulkAction = async () => {
    if (!confirmAction) return

    try {
      switch (confirmAction.type) {
        case 'publish':
          await Promise.all(
            confirmAction.articles.map(id => updateArticleStatus(id, 'published'))
          )
          break
        case 'draft':
          await Promise.all(
            confirmAction.articles.map(id => updateArticleStatus(id, 'draft'))
          )
          break
        case 'archive':
          await Promise.all(
            confirmAction.articles.map(id => updateArticleStatus(id, 'archived'))
          )
          break
        case 'delete':
          await deleteArticles(confirmAction.articles)
          break
      }

      toast({
        title: 'Success',
        description: `Bulk action completed successfully`,
      })

      setSelectedArticles([])
      setBulkAction('')
      setIsConfirmDialogOpen(false)
      setConfirmAction(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete bulk action',
        variant: 'destructive',
      })
    }
  }

  const handleSingleAction = async (articleId: string, action: string) => {
    try {
      switch (action) {
        case 'publish':
          await updateArticleStatus(articleId, 'published')
          break
        case 'draft':
          await updateArticleStatus(articleId, 'draft')
          break
        case 'archive':
          await updateArticleStatus(articleId, 'archived')
          break
        case 'delete':
          await deleteArticles([articleId])
          break
      }

      toast({
        title: 'Success',
        description: 'Article updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update article',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadgeVariant = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'archived':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>
                Manage and moderate published content
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => exportArticles()}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Bulk Actions */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ArticleStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedArticles.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedArticles.length} articles selected
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Bulk actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="draft">Move to Draft</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Apply
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedArticles([])}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Articles Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={(checked) => 
                          handleSelectArticle(article.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <div className="font-medium truncate">{article.title}</div>
                        {article.excerpt && (
                          <div className="text-sm text-gray-500 truncate">
                            {article.excerpt}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {article.author?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(article.status)}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.view_count}</TableCell>
                    <TableCell>
                      {article.published_at 
                        ? new Date(article.published_at).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/articles/${article.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {article.status !== 'published' && (
                              <DropdownMenuItem
                                onClick={() => handleSingleAction(article.id, 'publish')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {article.status !== 'draft' && (
                              <DropdownMenuItem
                                onClick={() => handleSingleAction(article.id, 'draft')}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Move to Draft
                              </DropdownMenuItem>
                            )}
                            {article.status !== 'archived' && (
                              <DropdownMenuItem
                                onClick={() => handleSingleAction(article.id, 'archive')}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleSingleAction(article.id, 'delete')}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No articles found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'}
              onClick={executeBulkAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}