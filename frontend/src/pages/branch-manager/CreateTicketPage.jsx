import React, { useState, useRef } from 'react';
import API from '../../services/api';
import { UploadCloud } from 'lucide-react';

export default function CreateTicketPage({ setActivePage }) {
  const [projectName, setProjectName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTicket = async (isSend = false) => {
  setSubmitting(true);
  try {
    // 1. Create the ticket first (no documents in this call anymore)
    const res = await API.post('tickets/', {
      project_name: projectName,
      requirements: requirements,
    });

    const ticketId = res.data.ticket_id;

    // 2. Upload each real file to the new ticket
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      await API.post(`tickets/${ticketId}/upload-document/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    if (isSend) {
      await API.post(`tickets/${ticketId}/send/`);
    }

    alert(isSend ? 'Ticket created and sent to executive!' : 'Ticket draft saved successfully!');
    setActivePage('view');
  } catch (err) {
    const data = err.response?.data;
    let msg = 'Unknown error';
    if (typeof data === 'string') msg = data;
    else if (data?.detail) msg = data.detail;
    else if (data && typeof data === 'object') {
      msg = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
    }
    alert('Failed to create ticket:\n' + msg);
  } finally {
    setSubmitting(false);
  }
};

    const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Create New Proposal Ticket</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Fill out project details to initiate executive review workflow</p>
          </div>
          
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={labelStyle}>Project Name <span style={{color: '#dc2626'}}>*</span></label>
            <input
              type="text"
              placeholder="e.g. Core Banking Automated Reconciliation Module"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={labelStyle}>Project Requirements & Description <span style={{color: '#dc2626'}}>*</span></label>
            <textarea
              placeholder="1. Automated daily transaction matching...&#10;2. Generate discrepancy logs...&#10;3. Export monthly summaries..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={8}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Attach Supporting Documents (Optional)</label>
            <div
              style={dropzoneStyle}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <UploadCloud size={24} color="#3b82f6" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600, fontSize: '0.95rem' }}>
                Click to upload <span style={{ color: '#64748b', fontWeight: 400 }}>or drag and drop proposal files</span>
              </p>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>PDF, DOCX, XLSX up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedFiles.map((file, i) => (
                  <div key={i} style={fileRowStyle}>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>{file.name}</span>
                    <button type="button" onClick={() => removeFile(i)} style={removeFileBtnStyle}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={() => setActivePage('dashboard')} style={actionBtnNeutral}>Cancel</button>
            <button type="button" onClick={() => handleCreateTicket(false)} disabled={submitting || !projectName || !requirements} style={{ ...actionBtnOutline, color: '#2563eb', borderColor: '#2563eb' }}>
              Save as Draft
            </button>
            <button type="button" onClick={() => handleCreateTicket(true)} disabled={submitting || !projectName || !requirements} style={actionBtnBlue}>
              {submitting ? 'Sending...' : 'Send to Executive →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const labelStyle = { display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a', backgroundColor: '#f8fafc', transition: 'border-color 0.2s', outline: 'none' };
const dropzoneStyle = { border: '2px dashed #bfdbfe', backgroundColor: '#f0f9ff', borderRadius: '12px', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.2s' };

const actionBtnBlue = { backgroundColor: '#2563eb', color: '#ffffff', border: '1px solid #2563eb', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' };
const actionBtnOutline = { backgroundColor: '#ffffff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' };
const actionBtnNeutral = { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' };
const fileRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' };
const removeFileBtnStyle = { background: 'none', border: 'none', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' };