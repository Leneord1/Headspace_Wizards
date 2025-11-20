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
import * as XLSX from 'xlsx';
import './importEvents.css';

// Optionally change this to your backend base URL (or set via env/config)
// e.g. const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
const BACKEND_URL = '';

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
            const data = await file.arrayBuffer();
            // Read workbook
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            // Convert sheet to JSON using header row as keys
            const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

            // TODO: If your backend expects specific field names, map them here.
            // Example mapping (uncomment and adapt):(pseudocode)
            // const mapped = json.map(row => ({
            //   startDate: row['Start Date'],
            //   endDate: row['End Date'],
            //   title: row['Summary'],
            //   location: row['Location']
            // }));
            // setParsedRows(mapped);

            setParsedRows(json);
            setPreviewRows(json.slice(0, 10));
            setMessage(`${json.length} row(s) parsed from ${file.name}`);
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

        setUploading(true);
        try {
            // ===== Backend call point =====
            // Update the URL below to point to your backend API endpoint.
            // For example: const url = BACKEND_URL || 'https://api.example.com';
            // Then call `${url}/import-events` or the route your backend exposes.
            // If your backend requires authentication, include headers like:
            // headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' }
            // Payload shape example:
            // { sourceFile: fileName, rows: parsedRows }

            const endpoint = (BACKEND_URL || '') + '/api/import-events';

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

    return (
        <div className="importEvents page-container">
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
                    >
                        {uploading ? 'Sending...' : 'Send to Server'}
                    </Button>
                    <div className="status-text">
                        {message && <div className="message success">{message}</div>}
                        {error && <div className="message error">{error}</div>}
                    </div>
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