'use client'

import { useState } from 'react'
import { CloudUpload, File, FileCheck2, FileX2, Loader2 } from 'lucide-react'
import type { StudentDocument } from '@/types/dorm'
import { formatDate } from '@/lib/format'
import { DOCUMENT_STATUS_STYLES, StatusBadge } from '@/components/shared/status'

function FileIcon({ status }: { status: StudentDocument['status'] }) {
  if (status === 'Verified') return <FileCheck2 className="h-5 w-5 text-emerald-500" />
  if (status === 'Expired') return <FileX2 className="h-5 w-5 text-rose-400" />
  return <File className="h-5 w-5 text-gray-400" />
}

export function StudentDocuments({ documents }: { documents: StudentDocument[] }) {
  const [uploading, setUploading] = useState(false)

  const simulateUpload = () => {
    setUploading(true)
    setTimeout(() => setUploading(false), 1200)
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={simulateUpload}
        disabled={uploading}
        className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center transition-colors hover:border-primary/35 hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <CloudUpload className="h-6 w-6 text-gray-400" />
        )}
        <span className="text-sm font-semibold text-gray-900">
          {uploading ? 'Uploading…' : 'Upload a new document'}
        </span>
        <span className="text-xs text-gray-400">
          PDF, JPG or PNG · Max 5 MB per document
        </span>
      </button>

      <ul className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200/70 bg-white">
        {documents.map((document) => (
          <li key={document.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <FileIcon status={document.status} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{document.name}</p>
              <p className="truncate text-xs text-gray-400">
                {document.category} · {document.size} · Uploaded {formatDate(document.uploadedAt)}
              </p>
            </div>
            <StatusBadge style={DOCUMENT_STATUS_STYLES[document.status]} showDot={false} />
          </li>
        ))}
        {documents.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-gray-400">
            No documents uploaded yet.
          </li>
        )}
      </ul>
    </div>
  )
}
