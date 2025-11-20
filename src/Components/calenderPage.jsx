import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import Button from '@mui/material/Button';
import './calenderPage.css';

export default function CalendarPage() {
  const calendarRef = useRef(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  function goNext() {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
  }

  function changeView(viewName) {
    const calendarApi = calendarRef.current && calendarRef.current.getApi();
    if (!calendarApi) {
      setMessage('Calendar not ready yet');
      return;
    }
    try {
      calendarApi.changeView(viewName);
      setMessage(`Switched to ${viewName}`);
    } catch (err) {
      console.error('Failed to change view', err);
      setMessage('Failed to change view');
    }
  }

  // Convert ICS date/time string to an ISO or date string acceptable by FullCalendar
  function parseIcsDate(icsDate) {

    if (!icsDate) return null;
    const cleaned = icsDate.trim();

    // Date-only (YYYYMMDD)
    if (/^\d{8}$/.test(cleaned)) {
      const y = cleaned.slice(0, 4);
      const m = cleaned.slice(4, 6);
      const d = cleaned.slice(6, 8);
      return `${y}-${m}-${d}`; // fullCalendar treats this as all-day
    }

    // Date-time
    const m = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
    if (m) {
      const [, y, mo, d, hh, mm, ss, z] = m;
      if (z) {
        // UTC
        return `${y}-${mo}-${d}T${hh}:${mm}:${ss}Z`;
      }
      // treat as local time (no timezone)
      return `${y}-${mo}-${d}T${hh}:${mm}:${ss}`;
    }

    // Fallback: try Date.parse
    const parsed = Date.parse(cleaned);
    if (!isNaN(parsed)) return new Date(parsed).toISOString();
    return cleaned;
  }

  // Parse a single VEVENT block and return an event object for FullCalendar
  function parseVEvent(block) {
    // unfold folded lines per RFC: lines that start with a space or tab are continuations
    block = block.replace(/\r?\n[ \t]/g, '');

    const getProp = (name) => {
      const re = new RegExp(name + "[^:]*:([^\r\n]+)", 'i');
      const m = block.match(re);
      return m ? m[1].trim() : null;
    };

    const rawSummary = getProp('SUMMARY') || 'Untitled';
    const rawDtStart = getProp('DTSTART');
    const rawDtEnd = getProp('DTEND') || getProp('DUE');

    // Determine if all-day: DTSTART without time (YYYYMMDD)
    const allDay = rawDtStart && /^\d{8}$/.test(rawDtStart);

    const start = parseIcsDate(rawDtStart);
    const end = parseIcsDate(rawDtEnd);

    return {
      title: rawSummary,
      start: start,
      end: end || undefined,
      allDay: allDay,
    };
  }

  async function handleFile(e) {
    setMessage('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.ics')) {
      setMessage('Please select a .ics file');
      return;
    }

    const text = await file.text();

    // Split into VEVENT blocks
    const parts = text.split(/BEGIN:VEVENT/i).slice(1);
    if (!parts.length) {
      setMessage('No VEVENT entries found in the .ics file.');
      return;
    }

    const events = parts.map((p) => {
      // Remove everything after END:VEVENT for safety
      const block = (p.split(/END:VEVENT/i)[0] || '').trim();
      return parseVEvent(block);
    }).filter(Boolean);

    // Add to calendar
    const calendarApi = calendarRef.current && calendarRef.current.getApi();
    if (!calendarApi) {
      setMessage('Calendar is not initialized yet. Try again after it loads.');
      return;
    }

    let added = 0;
    for (const ev of events) {
      try {
        // fullCalendar will accept start/end as ISO or date strings
        calendarApi.addEvent(ev);
        added++;
      } catch (err) {
        // ignore single-event failures
        console.error('Failed to add event', ev, err);
      }
    }

    setMessage(`Imported ${added} event(s) from ${file.name}`);

    // reset file input so same file can be re-selected if needed
    e.target.value = '';
  }

  return (
    <div className="calendar-page">
      <div className="calendar-controls">
          {/* Home button - navigates back to the app homepage */}
          <Button
            onClick={() => navigate('/')}
            className="home-button"
          >
            Home
          </Button>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
        />
        <label className="file-label">
          Load .ics file:
          <input className="file-input" type="file" accept=".ics" onChange={handleFile} />
        </label>

        {/* View switch buttons */}
        <div className="view-buttons">
          <button className="control-button" onClick={() => changeView('dayGridMonth')}>Month</button>
          <button className="control-button" onClick={() => changeView('timeGridWeek')}>Week</button>
          <button className="control-button" onClick={() => changeView('timeGridDay')}>Day</button>
        </div>

        <span className="message">{message}</span>
      </div>
    </div>
  );
}