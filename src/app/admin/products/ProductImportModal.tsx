'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Upload, X, Check, AlertCircle, FileText, Plus } from 'lucide-react'
import { bulkCreateProducts, uploadBulkImages } from '@/lib/actions/products'

export type ParsedProductRow = {
  sku: string
  name: string
  category: string
  subcategory?: string
  brand?: string
  price: number
  stock: number
  image_urls?: string
  status: 'valid' | 'invalid'
  error?: string
}

export default function ProductImportModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [rows, setRows] = useState<ParsedProductRow[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
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
            const requiredHeaders = ['sku', 'name', 'category', 'price', 'stock']
            const headers = results.meta.fields?.map((f: string) => f.toLowerCase().trim()) || []
            
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
            if (missingHeaders.length > 0) {
              setUploadError(`Error: The CSV "${file.name}" is missing required columns: ${missingHeaders.join(', ')}`)
              resolve()
              return
            }

            const parsedRows: ParsedProductRow[] = results.data.map((row: any) => {
              const sku = (row.sku || '').trim()
              const name = (row.name || '').trim()
              const category = (row.category || '').trim()
              const subcategory = (row.subcategory || '').trim() || undefined
              const brand = (row.brand || '').trim() || undefined
              const priceStr = (row.price || '').trim()
              const stockStr = (row.stock || '').trim()
              const image_urls = (row.image_urls || '').trim() || undefined

              if (!sku) return { sku, name, category, price: 0, stock: 0, status: 'invalid', error: 'SKU is required' }
              if (!name) return { sku, name, category, price: 0, stock: 0, status: 'invalid', error: 'Name is required' }
              if (!category) return { sku, name, category, price: 0, stock: 0, status: 'invalid', error: 'Category is required' }
              
              const price = parseFloat(priceStr)
              if (isNaN(price) || price < 0) return { sku, name, category, price: 0, stock: 0, status: 'invalid', error: 'Invalid price' }

              const stock = parseInt(stockStr, 10)
              if (isNaN(stock) || stock < 0) return { sku, name, category, price, stock: 0, status: 'invalid', error: 'Invalid stock' }

              return { 
                sku, name, category, subcategory, brand, price, stock, image_urls,
                status: 'valid' 
              }
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

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setImageFiles(prev => [...prev, ...selectedFiles])
    }
  }

  const handleImport = async () => {
    const validRows = [...rows].filter((r) => r.status === 'valid')
    if (validRows.length === 0) return

    setIsImporting(true)
    setUploadError(null)

    // 1. Upload Images in batches of 10
    const matchedUrls: Record<string, string[]> = {}
    if (imageFiles.length > 0) {
      const batchSize = 10
      for (let i = 0; i < imageFiles.length; i += batchSize) {
        const batch = imageFiles.slice(i, i + batchSize)
        const formData = new FormData()
        batch.forEach(f => formData.append('files', f))
        
        try {
          const res = await uploadBulkImages(formData)
          if (res?.uploadedUrls) {
            res.uploadedUrls.forEach((img: any) => {
              // Match by SKU or by Product Name.
              // Normalize by removing spaces/special characters for more forgiving matches.
              const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '')
              
              // Remove file extension from filename for matching
              const rawFilename = img.filename.split('.').slice(0, -1).join('.')
              const normFilename = normalize(rawFilename)

              // 1. Try to find an exact match first
              let matchingRow = validRows.find(r => {
                return normalize(r.sku) === normFilename || normalize(r.name) === normFilename
              })

              // 2. If no exact match, find all partial matches and pick the most specific one (longest name)
              if (!matchingRow) {
                const partialMatches = validRows.filter(r => {
                  const normSku = normalize(r.sku)
                  const normName = normalize(r.name)
                  return (normSku && normFilename.startsWith(normSku)) || 
                         (normName && normFilename.startsWith(normName))
                })
                
                if (partialMatches.length > 0) {
                  matchingRow = partialMatches.sort((a, b) => {
                    const lenA = Math.max(normalize(a.sku).length, normalize(a.name).length)
                    const lenB = Math.max(normalize(b.sku).length, normalize(b.name).length)
                    return lenB - lenA // Descending order
                  })[0]
                }
              }

              if (matchingRow) {
                if (!matchedUrls[matchingRow.sku]) matchedUrls[matchingRow.sku] = []
                matchedUrls[matchingRow.sku].push(img.url)
              }
            })
          }
        } catch (err: any) {
          console.error('Batch upload error', err)
          setUploadError('Warning: Some images failed to upload.')
        }
      }
    }

    // 2. Attach matched URLs to rows
    const payload = validRows.map(r => {
      let finalUrls = r.image_urls || ''
      if (matchedUrls[r.sku]) {
        const appended = matchedUrls[r.sku].join(',')
        finalUrls = finalUrls ? `${finalUrls},${appended}` : appended
      }
      return {
        sku: r.sku,
        name: r.name,
        category: r.category,
        subcategory: r.subcategory,
        brand: r.brand,
        price: r.price,
        stock: r.stock,
        image_urls: finalUrls
      }
    })

    const result = await bulkCreateProducts(payload)

    setIsImporting(false)

    if (result?.error) {
      setUploadError('Import failed: ' + result.error)
    } else {
      setIsOpen(false)
      setRows([])
      setFiles([])
      setImageFiles([])
      setUploadError(null)
      alert('Import successful!')
    }
  }

  const validRows = [...rows].filter((r) => r.status === 'valid')

  // Real-time matching preview
  const getMatches = () => {
    const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    const matched = new Set<File>()
    const unmatched: File[] = []

    imageFiles.forEach(f => {
      let rawFilename = f.name
      const lastDotIdx = rawFilename.lastIndexOf('.')
      if (lastDotIdx > 0) rawFilename = rawFilename.substring(0, lastDotIdx)
      const normFilename = normalize(rawFilename)

      let matchingRow = validRows.find(r => normalize(r.sku) === normFilename || normalize(r.name) === normFilename)
      if (!matchingRow) {
        const partialMatches = validRows.filter(r => {
          const nSku = normalize(r.sku)
          const nName = normalize(r.name)
          return (nSku && normFilename.startsWith(nSku)) || (nName && normFilename.startsWith(nName))
        })
        if (partialMatches.length > 0) {
          matchingRow = partialMatches.sort((a, b) => {
            return Math.max(normalize(b.sku).length, normalize(b.name).length) - Math.max(normalize(a.sku).length, normalize(a.name).length)
          })[0]
        }
      }

      if (matchingRow) matched.add(f)
      else unmatched.push(f)
    })

    return { matched: Array.from(matched), unmatched }
  }

  const { matched: matchedFiles, unmatched: unmatchedFiles } = getMatches()
  const validCount = validRows.length
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
            width: '95%', maxWidth: '1000px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Import Products</h2>
              <button onClick={() => { setIsOpen(false); setRows([]); setFiles([]); setImageFiles([]); setUploadError(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
                <p style={{ marginBottom: '1rem' }}>Upload one or more CSV files to import products.</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
                  Required: <code>sku, name, category, price, stock</code>.<br/> 
                  Optional: <code>subcategory, brand, image_urls</code>.
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Selected CSVs ({files.length})</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', maxHeight: '100px', overflowY: 'auto' }}>
                      {files.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <FileText size={14} color="var(--primary)" /> {f.name}
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '1rem' }}>
                      <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add more CSVs
                        <input type="file" multiple accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--muted)', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Bulk Images ({imageFiles.length})</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Name images by SKU or Product Name (e.g. <code>SKU123.jpg</code> or <code>Motul 7100.jpg</code>). The system will automatically attach them during import.</p>
                    
                    {imageFiles.length > 0 && (
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{matchedFiles.length} Matched</span>
                        {unmatchedFiles.length > 0 && <span style={{ color: 'var(--destructive)', fontWeight: 600 }}>{unmatchedFiles.length} Unmatched</span>}
                      </div>
                    )}

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {imageFiles.map((f, i) => {
                        const isMatched = matchedFiles.includes(f)
                        return (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem', paddingRight: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                              {isMatched ? <Check size={14} color="var(--success)" style={{ flexShrink: 0 }} /> : <AlertCircle size={14} color="var(--destructive)" style={{ flexShrink: 0 }} />}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isMatched ? 'inherit' : 'var(--destructive)' }}>{f.name}</span>
                            </div>
                            <button 
                              onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                              style={{ background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Remove file"
                            >
                              <X size={14} />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                    <div style={{ marginTop: '1rem' }}>
                      <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        <Plus size={14} style={{ marginRight: '0.25rem' }} /> Add Images
                        <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageSelection} />
                      </label>
                      {imageFiles.length > 0 && (
                        <button onClick={() => setImageFiles([])} style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--destructive)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                      )}
                    </div>
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
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
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
                          <td><code style={{ fontSize: '0.75rem' }}>{row.sku}</code></td>
                          <td style={{ fontWeight: 500 }}>{row.name}</td>
                          <td>
                            <div>{row.category}</div>
                            {row.subcategory && <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>↳ {row.subcategory}</div>}
                          </td>
                          <td>{row.price}</td>
                          <td>{row.stock}</td>
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
                    {isImporting ? 'Importing...' : `Import ${validCount} Products`}
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
