'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { bulkImportCsvRows } from '@/lib/actions/products'

export default function CsvImportPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data)
      }
    })
  }

  const handleImport = async () => {
    if (data.length === 0) return
    setLoading(true)
    try {
      const res = await bulkImportCsvRows(data)
      setResults(res)
    } catch (e: any) {
      alert('Import failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Bulk Import Products (CSV)</h1>
      </div>

      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--muted-foreground)' }}>
          Upload a CSV file with the following headers: <strong>SKU, Name, Slug, RetailPrice, CategorySlug, BrandSlug, Quantity</strong>
        </p>
        
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload}
          className="form-input"
          style={{ marginBottom: '1rem' }}
        />

        {data.length > 0 && (
          <div>
            <p style={{ marginBottom: '1rem', fontWeight: 500 }}>Parsed {data.length} rows.</p>
            <button 
              className="btn-primary" 
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Start Import'}
            </button>
          </div>
        )}
      </div>

      {results && (
        <div className="admin-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Import Results</h2>
          <p style={{ color: '#166534', fontWeight: 500 }}>Successfully imported: {results.successful}</p>
          <p style={{ color: '#991b1b', fontWeight: 500 }}>Failed: {results.failed}</p>
          
          {results.errors.length > 0 && (
            <div style={{ marginTop: '1rem', background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius)' }}>
              <h3 style={{ fontSize: '1rem', color: '#991b1b', marginBottom: '0.5rem' }}>Errors:</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', color: '#991b1b' }}>
                {results.errors.map((err: any, i: number) => (
                  <li key={i}>Row {err.row}: {err.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
