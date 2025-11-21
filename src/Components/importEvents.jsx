/*
  importEvents.jsx

  Notes for integrators:
  - This component parses .csv/.xls/.xlsx files client-side using SheetJS (XLSX).
  - To send parsed rows to your backend, update the BACKEND_URL or the fetch call below.
  - Expected payload shape when sending to backend:
      {
        sourceFile: string,      // original filename
        rows: Array<object>      // array of row objects, keys from header row
      }
  - If your backend requires authentication, add Authorization headers to the fetch call.
  - If your backend expects field names different from the spreadsheet headers,
    map/transform `parsedRows` before sending (see the TODO mapping area below).
*/

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import Papa from 'papaparse';
import './importEvents.css';

// Optionally change this to your backend base URL (or set via env/config)
// e.g. REACT_APP_BACKEND_URL=http://localhost:5000
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

/*
  Endpoint notes (map these to your Python backend routes):
  - POST {BACKEND_URL}/api/import-events      <- expects JSON payload { sourceFile, rows }
      -> This would be handled by a function that parses rows and inserts into SQL (e.g., upload_step_data or a generic importer)
  - POST {BACKEND_URL}/api/import-events/upload <- expects multipart/form-data with file field 'file'
      -> This would be handled by a function that accepts the file, processes it server-side (e.g., upload_step_data for CSV)

  The provided `frontend/src/backend.py` contains helper functions like `upload_step_data(conn, filename)` and `upload_habit(conn, json_data)`
  but it is not an HTTP server; your backend should expose HTTP endpoints that call these functions.
*/

export default function ImportEvents() {
    const navigate = useNavigate();
    const [fileName, setFileName] = useState('');
    const [previewRows, setPreviewRows] = useState([]);
    const [parsedRows, setParsedRows] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    function handleReturn() {
        navigate('/');
    }

    async function handleFileChange(e) {
        setError('');
        setMessage('');
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (!['csv', 'xls', 'xlsx'].includes(ext)) {
            setError('Unsupported file type. Please select a .csv, .xls or .xlsx file.');
            return;
        }

        try {
            setFileName(file.name);
            // For security we avoid using the 'xlsx' package client-side due to vulnerabilities.
            // Use PapaParse to parse CSV files client-side. For .xls/.xlsx, prefer uploading the raw file to the server.
            if (ext === 'csv') {
                // PapaParse supports parsing from File objects
                await new Promise((resolve, reject) => {
                    Papa.parse(file, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            const json = results.data || [];
                            setParsedRows(json);
                            setPreviewRows(json.slice(0, 10));
                            setMessage(`${json.length} row(s) parsed from ${file.name}`);
                            resolve();
                        },
                        error: (err) => {
                            reject(err);
                        }
                    });
                });
            } else {
                // xls/xlsx: do not parse client-side due to known vulnerabilities in some libraries.
                // Prompt user to upload the raw file via the dedicated upload control below.
                setParsedRows(null);
                setPreviewRows([]);
                setMessage(`Detected ${ext.toUpperCase()} file. Please use "Or upload raw file directly" to send this file to your backend for server-side processing.`);
            }

            // If you need mapping of CSV headers to your backend schema, map parsedRows here before sending.
         } catch (err) {
             console.error(err);
             setError('Failed to parse file. Make sure it is a well-formed spreadsheet or CSV.');
         }

         // reset input so same file can be re-selected later if needed
         e.target.value = '';
     }

    async function handleSend() {
        setError('');
        setMessage('');
        if (!parsedRows || !parsedRows.length) {
            setError('Nothing to send. Please choose a spreadsheet with data first.');
            return;
        }

        if (!BACKEND_URL) {
            setError('BACKEND_URL not configured in client. Set REACT_APP_BACKEND_URL to enable server calls.');
            return;
        }

        setUploading(true);
        try {
            // ===== Backend call point (JSON) =====
            // Update the URL below to point to your backend API endpoint that accepts JSON rows
            const endpoint = `${BACKEND_URL}/api/import-events`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' /*, 'Authorization': 'Bearer <token>' */ },
                body: JSON.stringify({ sourceFile: fileName, rows: parsedRows }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Server responded with ${res.status}`);
            }

            const body = await res.json().catch(() => null);
            setMessage(body?.message || 'Data successfully sent to server.');
            // clear parsed rows if desired
            // setParsedRows(null);
            // setPreviewRows([]);
        } catch (err) {
            console.error('Send failed', err);
            setError('Failed to send data to server: ' + (err.message || err));
        } finally {
            setUploading(false);
        }
    }

    // Optional: upload the raw file as multipart/form-data
    async function handleFileUploadRaw(e) {
        setError('');
        setMessage('');
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!BACKEND_URL) {
            setError('BACKEND_URL not configured in client. Set REACT_APP_BACKEND_URL to enable server calls.');
            return;
        }

        const endpoint = `${BACKEND_URL}/api/import-events/upload`;
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file, file.name);

            // ===== Backend call point (multipart upload) =====
            const res = await fetch(endpoint, {
                method: 'POST',
                body: form,
                // headers: { 'Authorization': 'Bearer <token>' }
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Server responded with ${res.status}`);
            }

            const body = await res.json().catch(() => null);
            setMessage(body?.message || 'File uploaded successfully.');
        } catch (err) {
            console.error('Upload failed', err);
            setError('Failed to upload file: ' + (err.message || err));
        } finally {
            setUploading(false);
        }

        // reset input so same file can be selected again
        e.target.value = '';
    }

    return (
        <div className="importEvents page-container">
            {/* top-left Home button for convenience (styled in importEvents.css) */}
            <Button className="home-button" onClick={() => navigate('/')}>Home</Button>

            <div className="import-header">
                <Button variant="contained" onClick={handleReturn}>Return</Button>
                <h1>Import Events</h1>
            </div>

            <div className="import-controls">
                <label className="file-label">
                    Select a CSV / Excel file:
                    <input
                        className="file-input"
                        type="file"
                        accept=".csv, .xls, .xlsx"
                        onChange={handleFileChange}
                    />
                </label>

                <div className="action-row">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSend}
                        disabled={uploading || !parsedRows || parsedRows.length === 0}
                        className="white-button"
                    >
                        {uploading ? 'Sending...' : 'Send to Server'}
                    </Button>

                    <div className="status-text">
                        {message && <div className="message success">{message}</div>}
                        {error && <div className="message error">{error}</div>}
                    </div>
                </div>

                <div className="upload-raw-row">
                    <label className="file-label">
                        Or upload raw file directly:
                        <input className="file-input" type="file" accept=".csv, .xls, .xlsx" onChange={handleFileUploadRaw} />
                    </label>
                </div>
            </div>

            <div className="preview">
                <h2>Preview (first {previewRows.length} rows)</h2>
                {previewRows && previewRows.length ? (
                    <div className="preview-table-wrapper">
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    {Object.keys(previewRows[0]).map((k) => (
                                        <th key={k}>{k}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewRows.map((row, i) => (
                                    <tr key={i}>
                                        {Object.keys(row).map((k) => (
                                            <td key={k + i}>{String(row[k])}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No preview available.</p>
                )}
            </div>
        </div>
    )
}