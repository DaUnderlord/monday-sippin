'use client'

import { useEffect, useState } from 'react'
import { useArticles, useArticleData, useArticleSearch } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestArticlesPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  
  // Test individual hooks
  const { articles, loading, error, refetch } = useArticles({ autoFetch: false })
  const { search, results, loading: searchLoading } = useArticleSearch()
  const articleData = useArticleData()

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testApiRoutes = async () => {
    addResult('Starting API tests...')

    try {
      // Test GET /api/articles
      const articlesResponse = await fetch('/api/articles?limit=5')
      if (articlesResponse.ok) {
        const data = await articlesResponse.json()
        addResult(`✅ GET /api/articles - Found ${data.data.length} articles`)
      } else {
        addResult(`❌ GET /api/articles - Failed: ${articlesResponse.status}`)
      }

      // Test GET /api/categories
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const data = await categoriesResponse.json()
        addResult(`✅ GET /api/categories - Found ${data.data.length} categories`)
      } else {
        addResult(`❌ GET /api/categories - Failed: ${categoriesResponse.status}`)
      }

      // Test GET /api/tags
      const tagsResponse = await fetch('/api/tags')
      if (tagsResponse.ok) {
        const data = await tagsResponse.json()
        addResult(`✅ GET /api/tags - Found ${data.data.length} tags`)
      } else {
        addResult(`❌ GET /api/tags - Failed: ${tagsResponse.status}`)
      }

      // Test GET /api/filters
      const filtersResponse = await fetch('/api/filters')
      if (filtersResponse.ok) {
        const data = await filtersResponse.json()
        addResult(`✅ GET /api/filters - Found ${data.data.length} filters`)
      } else {
        addResult(`❌ GET /api/filters - Failed: ${filtersResponse.status}`)
      }

      // Test search
      const searchResponse = await fetch('/api/articles/search?q=test&limit=3')
      if (searchResponse.ok) {
        const data = await searchResponse.json()
        addResult(`✅ GET /api/articles/search - Found ${data.data.length} results`)
      } else {
        addResult(`❌ GET /api/articles/search - Failed: ${searchResponse.status}`)
      }

    } catch (error) {
      addResult(`❌ API test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testHooks = async () => {
    addResult('Testing hooks...')
    
    try {
      // Test useArticles hook
      await refetch()
      addResult(`✅ useArticles hook - Loaded ${articles.length} articles`)
      
      // Test search hook
      await search('crypto')
      addResult(`✅ useArticleSearch hook - Found ${results.length} search results`)
      
      // Test comprehensive hook
      await articleData.fetchArticles()
      addResult(`✅ useArticleData hook - Loaded ${articleData.articles.length} articles`)
      
    } catch (error) {
      addResult(`❌ Hook test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article Data Models and API Layer Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testApiRoutes}>Test API Routes</Button>
            <Button onClick={testHooks}>Test Hooks</Button>
            <Button onClick={() => setTestResults([])} variant="outline">
              Clear Results
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No tests run yet</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">useArticles Hook Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>Error: {error || 'None'}</p>
                <p>Articles: {articles.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">useArticleData Hook Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Loading: {articleData.loading ? 'Yes' : 'No'}</p>
                <p>Error: {articleData.error || 'None'}</p>
                <p>Articles: {articleData.articles.length}</p>
                <p>Categories: {articleData.categories.length}</p>
                <p>Tags: {articleData.tags.length}</p>
                <p>Filters: {articleData.filters.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Hook Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Loading: {searchLoading ? 'Yes' : 'No'}</p>
              <p>Query: {articleData.searchQuery || 'None'}</p>
              <p>Results: {results.length}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}