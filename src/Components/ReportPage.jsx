import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import './ReportPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function ReportPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');

  // Example report names - replace with your actual table/report identifiers
  const reports = [
    'attendance',
    'steps',
    'habits',
    'sessions',
    'users',
    'goals',
    'metrics',
    'summary'
  ];

  async function fetchReport(reportName) {
    setStatus(`Requesting ${reportName}...`);
    if (!BACKEND_URL) {
      setStatus('BACKEND_URL not configured. Set REACT_APP_BACKEND_URL to enable requests.');
      return;
    }

    try {
      // ===== Backend call point =====
      // Example: GET /api/reports/pull?table=<reportName>
      // The helper Python server provides /api/reports/pull which expects `table` query param.
      // Adjust endpoint and parameters to match your production backend.
      const endpoint = `${BACKEND_URL}/api/reports/pull?table=${encodeURIComponent(reportName)}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const body = await res.json().catch(() => null);
      // TODO: Display or process `body.data` as needed; for now just show a brief status.
      setStatus(body?.data ? `Fetched ${reportName}` : `Fetched ${reportName} (no data)`);
    } catch (err) {
      console.error('Fetch failed', err);
      setStatus('Failed to fetch report: ' + (err.message || err));
    }
  }

  async function downloadPdf() {
    setStatus('Preparing PDF...');
    if (!BACKEND_URL) {
      setStatus('BACKEND_URL not configured. Set REACT_APP_BACKEND_URL to enable download.');
      return;
    }

    try {
      // ===== Backend call point (download) =====
      // Example (helper server currently returns 501 for PDF):
      // GET /api/reports/download/pdf?report=<name>
      // You should implement server-side generation of PDF and return application/pdf blob here.
      const endpoint = `${BACKEND_URL}/api/reports/download/pdf`;
      const res = await fetch(endpoint);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Server responded ${res.status}`);
      }

      // If implemented, res will be a PDF blob. For now we'll attempt to download if provided.
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setStatus('PDF download started');
    } catch (err) {
      console.error('PDF download failed', err);
      setStatus('PDF download failed: ' + (err.message || err));
    }
  }

  return (
    <div className="report-page">
      <Button className="home-button" onClick={() => navigate('/')}>Home</Button>

      <div className="report-container">
        <h1>Reports</h1>
        <div className="report-grid">
          {reports.map((r) => (
            <Button key={r} className="report-button white-button" onClick={() => fetchReport(r)}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Button>
          ))}
          {/* Download PDF button */}
          <Button className="report-button white-button" onClick={downloadPdf}>Download PDF</Button>
        </div>

        <div className="report-status">{status}</div>
      </div>
    </div>
  );
}

