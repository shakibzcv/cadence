// Cadence - Transcript Dropzone & Empty State
import React from 'react'
import { AlertCircle, ClipboardPaste, Upload, UploadCloud } from 'lucide-react'

interface TranscriptDropzoneProps {
  parseError: string | null
  onTriggerUpload: () => void
  onOpenPaste: () => void
}

export const TranscriptDropzone: React.FC<TranscriptDropzoneProps> = ({
  parseError,
  onTriggerUpload,
  onOpenPaste,
}) => {
  return (
    <div className="yt-transcript-dropzone" onClick={onTriggerUpload}>
      <div className="yt-dropzone-icon">
        <UploadCloud size={32} />
      </div>
      <div className="yt-dropzone-primary-text">
        Upload or paste transcript
      </div>
      <div className="yt-dropzone-sub-text">
        Upload an SRT/VTT file or paste transcript text
      </div>
      <div className="yt-dropzone-actions" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="yt-transcript-btn yt-transcript-btn-primary"
          onClick={onTriggerUpload}
        >
          <Upload size={15} style={{ marginRight: 6 }} />
          Upload File
        </button>

        <button
          type="button"
          className="yt-transcript-btn yt-transcript-btn-secondary"
          onClick={onOpenPaste}
        >
          <ClipboardPaste size={15} style={{ marginRight: 6 }} />
          Paste
        </button>
      </div>

      {parseError && (
        <div
          className="yt-transcript-error-badge"
          style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <AlertCircle size={14} />
          <span>{parseError}</span>
        </div>
      )}
    </div>
  )
}
