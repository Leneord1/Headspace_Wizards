import React from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import './ReportPage.css';

// ReportPage
// - Simple UI that links back to the HomeScreen
// - Placeholder areas where backend calls should be made to fetch or generate reports
// - Keep styling minimal and in ReportPage.css
export default function ReportPage() {
  const navigate = useNavigate();

  // Example: call backend to fetch report list (commented placeholder)
  // fetch('/api/reports') -> process response

  return (
    <div className="report-page">
      <header className="report-header">
        <Button
          variant="contained"
          className="home-button"
          onClick={() => navigate('/')}
        >
          Home
        </Button>
        <h1>Reports</h1>
      </header>

      <main className="report-controls">
        <p className="report-description">
          Generate or preview reports here. Backend call point: <code>/api/reports</code>
        </p>

        <section className="report-card">
          <h2>Report Preview</h2>
          <p className="muted">No report selected. Use the backend endpoint to load report data.</p>
        </section>
      </main>
    </div>
  );
}

