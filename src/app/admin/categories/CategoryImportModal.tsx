'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Upload, X, Check, AlertCircle, FileText, Plus } from 'lucide-react'
import { bulkCreateCategories } from '@/lib/actions/categories'

type ParsedRow = {
  name: string
  slug: string
  parent_category: string
  status: 'valid' | 'invalid'
  error?: string
}

export default function CategoryImportModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    setUploadError(null)
    const validFiles: File[] = []

    for (const file of selectedFiles) {
      await new Promise<void>((resolve) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const requiredHeaders = ['name']
            const headers = results.meta.fields?.map((f: string) => f.toLowerCase().trim()) || []
            
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
            if (missingHeaders.length > 0) {
              setUploadError(`Error: The CSV "${file.name}" is missing required columns: ${missingHeaders.join(', ')}`)
              resolve()
              return
            }

            const parsedRows: ParsedRow[] = results.data.map((row: any) => {
              const name = (row.name || '').trim()
              let slug = (row.slug || '').trim()
              const parent_category = (row.parent_category || '').trim()

              if (!name) {
                return { name, slug, parent_category, status: 'invalid', error: 'Name is required' }
              }

              if (!slug) {
                slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
              }

              return { name, slug, parent_category, status: 'valid' }
            })

            validFiles.push(file)
            setRows(prev => [...prev, ...parsedRows])
            resolve()
          },
          error: (error) => {
            setUploadError(`Error parsing CSV "${file.name}": ` + error.message)
            resolve()
          }
        })
      })
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImport = async () => {
    const validRows = rows.filter((r) => r.status === 'valid')
    if (validRows.length === 0) return

    setIsImporting(true)
    const result = await bulkCreateCategories(validRows.map(r => ({
      name: r.name,
      slug: r.slug,
      parent_category: r.parent_category
    })))

    setIsImporting(false)

    if (result.error) {
      setUploadError('Import failed: ' + result.error)
    } else {
      setIsOpen(false)
      setRows([])
      setFiles([])
      setUploadError(null)
      alert('Import successful!')
    }
  }

  const validCount = rows.filter(r => r.status === 'valid').length
  const invalidCount = rows.length - validCount

  return (
    <>
      <button className="btn-secondary" onClick={() => setIsOpen(true)}>
        <Upload size={16} style={{ marginRight: '0.5rem' }} />
        Import
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--card)', 
            padding: '2rem', 
            borderRadius: '8px',
            width: '90%', maxWidth: '800px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Import Categories</h2>
              <button onClick={() => { setIsOpen(false); setRows([]); setFiles([]); setUploadError(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {uploadError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} />
                <span style={{ fontWeight: 500 }}>{uploadError}</span>
              </div>
            )}

            {files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2px dashed var(--border)', borderRadius: '8px' }}>
                <Upload size={48} style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }} />
                <p style={{ marginBottom: '1rem' }}>Upload one or more CSV files to import categories.</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                  Required columns: <code>name</code>. Optional: <code>slug</code>, <code>parent_category</code>.
                </p>
                <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  Select CSV Files
                  <input 
                    type="file" 
                    multiple
                    accept=".csv" 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Selected Files ({files.length})</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', maxHeight: '100px', overflowY: 'auto' }}>
                    {files.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <FileText size={14} color="var(--primary)" /> {f.name}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '1rem' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add more files
                      <input type="file" multiple accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>{validCount} Valid rows</span>
                  <span style={{ color: 'var(--destructive)', fontWeight: 500 }}>{invalidCount} Invalid rows</span>
                </div>

                <div className="admin-table-container" style={{ maxHeight: '400px', marginBottom: '1.5rem' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Parent Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i}>
                          <td>
                            {row.status === 'valid' ? (
                              <Check size={16} color="var(--success)" />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--destructive)' }}>
                                <AlertCircle size={16} />
                                <span style={{ fontSize: '0.75rem' }}>{row.error}</span>
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 500 }}>{row.name}</td>
                          <td><code style={{ fontSize: '0.75rem' }}>{row.slug}</code></td>
                          <td>{row.parent_category || <span style={{ color: 'var(--muted-foreground)' }}>-</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button className="btn-secondary" onClick={() => { setRows([]); setFiles([]); }}>
                    Cancel
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleImport} 
                    disabled={validCount === 0 || isImporting}
                  >
                    {isImporting ? 'Importing...' : `Import ${validCount} Categories`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
