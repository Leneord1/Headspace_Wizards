import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/Components/calenderPage.jsx");import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false, "VITE_BACKEND_URL": "http://127.0.0.1:5000"};import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=117520a4"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=117520a4"; const useRef = __vite__cjsImport1_react["useRef"]; const useState = __vite__cjsImport1_react["useState"];
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=117520a4";
import FullCalendar from "/node_modules/.vite/deps/@fullcalendar_react.js?v=117520a4";
import dayGridPlugin from "/node_modules/.vite/deps/@fullcalendar_daygrid.js?v=117520a4";
import timeGridPlugin from "/node_modules/.vite/deps/@fullcalendar_timegrid.js?v=117520a4";
import Button from "/node_modules/.vite/deps/@mui_material_Button.js?v=117520a4";
import "/src/Components/calenderPage.css";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
export default function CalendarPage() {
  _s();
  const calendarRef = useRef(null);
  const [message, setMessage] = useState("");
  const [lastImportedEvents, setLastImportedEvents] = useState([]);
  const [lastFile, setLastFile] = useState(null);
  const navigate = useNavigate();
  function goNext() {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
  }
  function changeView(viewName) {
    const calendarApi_0 = calendarRef.current && calendarRef.current.getApi();
    if (!calendarApi_0) {
      setMessage("Calendar not ready yet");
      return;
    }
    try {
      calendarApi_0.changeView(viewName);
      setMessage(`Switched to ${viewName}`);
    } catch (err) {
      console.error("Failed to change view", err);
      setMessage("Failed to change view");
    }
  }
  function parseIcsDate(icsDate) {
    if (!icsDate) return null;
    const cleaned = icsDate.trim();
    if (/^\d{8}$/.test(cleaned)) {
      const y = cleaned.slice(0, 4);
      const m = cleaned.slice(4, 6);
      const d = cleaned.slice(6, 8);
      return `${y}-${m}-${d}`;
    }
    const m_0 = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
    if (m_0) {
      const [, y_0, mo, d_0, hh, mm, ss, z] = m_0;
      if (z) {
        return `${y_0}-${mo}-${d_0}T${hh}:${mm}:${ss}Z`;
      }
      return `${y_0}-${mo}-${d_0}T${hh}:${mm}:${ss}`;
    }
    const parsed = Date.parse(cleaned);
    if (!isNaN(parsed)) return new Date(parsed).toISOString();
    return cleaned;
  }
  function parseVEvent(block) {
    block = block.replace(/\r?\n[ \t]/g, "");
    const getProp = (name) => {
      const re = new RegExp(name + "[^:]*:([^\r\n]+)", "i");
      const m_1 = block.match(re);
      return m_1 ? m_1[1].trim() : null;
    };
    const rawSummary = getProp("SUMMARY") || "Untitled";
    const rawDtStart = getProp("DTSTART");
    const rawDtEnd = getProp("DTEND") || getProp("DUE");
    const allDay = rawDtStart && /^\d{8}$/.test(rawDtStart);
    const start = parseIcsDate(rawDtStart);
    const end = parseIcsDate(rawDtEnd);
    return {
      title: rawSummary,
      start,
      end: end || void 0,
      allDay
    };
  }
  async function handleFile(e) {
    setMessage("");
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".ics")) {
      setMessage("Please select a .ics file");
      return;
    }
    setLastFile(file);
    const text = await file.text();
    const parts = text.split(/BEGIN:VEVENT/i).slice(1);
    if (!parts.length) {
      setMessage("No VEVENT entries found in the .ics file.");
      return;
    }
    const events = parts.map((p) => {
      const block_0 = (p.split(/END:VEVENT/i)[0] || "").trim();
      return parseVEvent(block_0);
    }).filter(Boolean);
    const calendarApi_1 = calendarRef.current && calendarRef.current.getApi();
    if (!calendarApi_1) {
      setMessage("Calendar is not initialized yet. Try again after it loads.");
      return;
    }
    let added = 0;
    for (const ev of events) {
      try {
        calendarApi_1.addEvent(ev);
        added++;
      } catch (err_0) {
        console.error("Failed to add event", ev, err_0);
      }
    }
    setLastImportedEvents(events);
    setMessage(`Imported ${added} event(s) from ${file.name}`);
    e.target.value = "";
  }
  async function sendImportedEventsToServer() {
    setMessage("");
    if (!lastImportedEvents || !lastImportedEvents.length) {
      setMessage("No imported events to send. Import a .ics first.");
      return;
    }
    if (!BACKEND_URL) {
      setMessage("BACKEND_URL not configured in client. Set REACT_APP_BACKEND_URL to enable server calls.");
      return;
    }
    const endpoint = `${BACKEND_URL}/api/import-events`;
    setMessage(`Sending ${lastImportedEvents.length} events to server...`);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          /*, 'Authorization': 'Bearer <token>' */
        },
        body: JSON.stringify({
          source: "client-ics",
          events: lastImportedEvents
        })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Server responded ${res.status}`);
      }
      const body = await res.json().catch(() => null);
      setMessage(body?.message || `Server accepted ${lastImportedEvents.length} events.`);
    } catch (err_1) {
      console.error("Failed to send events", err_1);
      setMessage("Failed to send events to server: " + (err_1.message || err_1));
    }
  }
  async function sendRawFileToServer() {
    setMessage("");
    if (!lastFile) {
      setMessage("No file available. Please import an .ics file first.");
      return;
    }
    if (!BACKEND_URL) {
      setMessage("BACKEND_URL not configured in client. Set REACT_APP_BACKEND_URL to enable server calls.");
      return;
    }
    const endpoint_0 = `${BACKEND_URL}/api/import-events/upload`;
    setMessage("Uploading .ics file to server...");
    try {
      const form = new FormData();
      form.append("file", lastFile, lastFile.name);
      const res_0 = await fetch(endpoint_0, {
        method: "POST",
        // DO NOT set Content-Type when sending FormData; the browser will set the correct boundary
        // headers: { 'Authorization': 'Bearer <token>' }
        body: form
      });
      if (!res_0.ok) {
        const txt_0 = await res_0.text().catch(() => "");
        throw new Error(txt_0 || `Server responded ${res_0.status}`);
      }
      const body_0 = await res_0.json().catch(() => null);
      setMessage(body_0?.message || "File uploaded successfully.");
    } catch (err_2) {
      console.error("Upload failed", err_2);
      setMessage("Upload failed: " + (err_2.message || err_2));
    }
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "calendar-page", children: /* @__PURE__ */ jsxDEV("div", { className: "calendar-controls", children: [
    /* @__PURE__ */ jsxDEV(Button, { onClick: () => navigate("/"), className: "home-button", children: "Home" }, void 0, false, {
      fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
      lineNumber: 219,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV(FullCalendar, { ref: calendarRef, plugins: [dayGridPlugin, timeGridPlugin], initialView: "dayGridMonth" }, void 0, false, {
      fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
      lineNumber: 222,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("label", { className: "file-label", children: [
      "Load .ics file:",
      /* @__PURE__ */ jsxDEV("input", { className: "file-input", type: "file", accept: ".ics", onChange: handleFile }, void 0, false, {
        fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
        lineNumber: 225,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
      lineNumber: 223,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "view-buttons", children: [
      /* @__PURE__ */ jsxDEV("button", { className: "control-button", onClick: () => changeView("dayGridMonth"), children: "Month" }, void 0, false, {
        fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
        lineNumber: 230,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "control-button", onClick: () => changeView("timeGridWeek"), children: "Week" }, void 0, false, {
        fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
        lineNumber: 231,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "control-button", onClick: () => changeView("timeGridDay"), children: "Day" }, void 0, false, {
        fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
        lineNumber: 232,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "control-button", onClick: sendImportedEventsToServer, children: "Send Events to Server" }, void 0, false, {
        fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
        lineNumber: 233,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("button", { className: "control-button", onClick: sendRawFileToServer, children: "Upload .ics to Server" }, void 0, false, {
        fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
        lineNumber: 234,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
      lineNumber: 229,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "message", children: message }, void 0, false, {
      fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
      lineNumber: 237,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
    lineNumber: 217,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx",
    lineNumber: 216,
    columnNumber: 10
  }, this);
}
_s(CalendarPage, "NMllAo10S8vCZVbYMJPAUbe0fIA=", false, function() {
  return [useNavigate];
});
_c = CalendarPage;
var _c;
$RefreshReg$(_c, "CalendarPage");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) {
  return RefreshRuntime.register(type, "C:/Users/Sanka/Desktop/School Coding projects/Headspace_Wizards/frontend/src/Components/calenderPage.jsx " + id);
}
function $RefreshSig$() {
  return RefreshRuntime.createSignatureFunctionForTransform();
}

//# sourceMappingURL=data:application/json;base64,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VUFBSyxXQUFVLFdBQVd4RixxQkFBM0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUFtQztBQUFBLE9BM0JyQztBQUFBO0FBQUE7QUFBQTtBQUFBLFNBNEJBLEtBN0JGO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0E4QkE7QUFFSjtBQUFDRixHQTlQdUJELGNBQVk7QUFBQSxVQUtqQlQsV0FBVztBQUFBO0FBQUF3RyxLQUxOL0Y7QUFBWSxJQUFBK0Y7QUFBQUMsYUFBQUQsSUFBQSIsIm5hbWVzIjpbInVzZVJlZiIsInVzZVN0YXRlIiwidXNlTmF2aWdhdGUiLCJGdWxsQ2FsZW5kYXIiLCJkYXlHcmlkUGx1Z2luIiwidGltZUdyaWRQbHVnaW4iLCJCdXR0b24iLCJCQUNLRU5EX1VSTCIsImltcG9ydCIsImVudiIsIlZJVEVfQkFDS0VORF9VUkwiLCJDYWxlbmRhclBhZ2UiLCJfcyIsImNhbGVuZGFyUmVmIiwibWVzc2FnZSIsInNldE1lc3NhZ2UiLCJsYXN0SW1wb3J0ZWRFdmVudHMiLCJzZXRMYXN0SW1wb3J0ZWRFdmVudHMiLCJsYXN0RmlsZSIsInNldExhc3RGaWxlIiwibmF2aWdhdGUiLCJnb05leHQiLCJjYWxlbmRhckFwaSIsImN1cnJlbnQiLCJnZXRBcGkiLCJuZXh0IiwiY2hhbmdlVmlldyIsInZpZXdOYW1lIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicGFyc2VJY3NEYXRlIiwiaWNzRGF0ZSIsImNsZWFuZWQiLCJ0cmltIiwidGVzdCIsInkiLCJzbGljZSIsIm0iLCJkIiwibWF0Y2giLCJtbyIsImhoIiwibW0iLCJzcyIsInoiLCJwYXJzZWQiLCJEYXRlIiwicGFyc2UiLCJpc05hTiIsInRvSVNPU3RyaW5nIiwicGFyc2VWRXZlbnQiLCJibG9jayIsInJlcGxhY2UiLCJnZXRQcm9wIiwibmFtZSIsInJlIiwiUmVnRXhwIiwicmF3U3VtbWFyeSIsInJhd0R0U3RhcnQiLCJyYXdEdEVuZCIsImFsbERheSIsInN0YXJ0IiwiZW5kIiwidGl0bGUiLCJ1bmRlZmluZWQiLCJoYW5kbGVGaWxlIiwiZSIsImZpbGUiLCJ0YXJnZXQiLCJmaWxlcyIsInRvTG93ZXJDYXNlIiwiZW5kc1dpdGgiLCJ0ZXh0IiwicGFydHMiLCJzcGxpdCIsImxlbmd0aCIsImV2ZW50cyIsIm1hcCIsInAiLCJmaWx0ZXIiLCJCb29sZWFuIiwiYWRkZWQiLCJldiIsImFkZEV2ZW50IiwidmFsdWUiLCJzZW5kSW1wb3J0ZWRFdmVudHNUb1NlcnZlciIsImVuZHBvaW50IiwicmVzIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJzb3VyY2UiLCJvayIsInR4dCIsImNhdGNoIiwiRXJyb3IiLCJzdGF0dXMiLCJqc29uIiwic2VuZFJhd0ZpbGVUb1NlcnZlciIsImZvcm0iLCJGb3JtRGF0YSIsImFwcGVuZCIsIl9jIiwiJFJlZnJlc2hSZWckIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbImNhbGVuZGVyUGFnZS5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IHsgdXNlTmF2aWdhdGUgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJztcclxuaW1wb3J0IEZ1bGxDYWxlbmRhciBmcm9tICdAZnVsbGNhbGVuZGFyL3JlYWN0JztcclxuaW1wb3J0IGRheUdyaWRQbHVnaW4gZnJvbSAnQGZ1bGxjYWxlbmRhci9kYXlncmlkJztcclxuaW1wb3J0IHRpbWVHcmlkUGx1Z2luIGZyb20gJ0BmdWxsY2FsZW5kYXIvdGltZWdyaWQnO1xyXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJztcclxuaW1wb3J0ICcuL2NhbGVuZGVyUGFnZS5jc3MnO1xyXG5cclxuLy8gQ29uZmlndXJlIGJhY2tlbmQgYmFzZSBVUkwgaGVyZSBvciB2aWEgVml0ZSBlbnYgdmFyIChzZXQgVklURV9CQUNLRU5EX1VSTCBpbiAuZW52KVxyXG5jb25zdCBCQUNLRU5EX1VSTCA9IGltcG9ydC5tZXRhLmVudi5WSVRFX0JBQ0tFTkRfVVJMIHx8ICcnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ2FsZW5kYXJQYWdlKCkge1xyXG4gIGNvbnN0IGNhbGVuZGFyUmVmID0gdXNlUmVmKG51bGwpO1xyXG4gIGNvbnN0IFttZXNzYWdlLCBzZXRNZXNzYWdlXSA9IHVzZVN0YXRlKCcnKTtcclxuICBjb25zdCBbbGFzdEltcG9ydGVkRXZlbnRzLCBzZXRMYXN0SW1wb3J0ZWRFdmVudHNdID0gdXNlU3RhdGUoW10pOyAvLyBzdG9yZSBwYXJzZWQgZXZlbnRzIGZvciBzZW5kaW5nIHRvIGJhY2tlbmRcclxuICBjb25zdCBbbGFzdEZpbGUsIHNldExhc3RGaWxlXSA9IHVzZVN0YXRlKG51bGwpOyAvLyByYXcgZmlsZSByZWZlcmVuY2UgKGZvciBvcHRpb25hbCB1cGxvYWQpXHJcbiAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xyXG5cclxuICBmdW5jdGlvbiBnb05leHQoKSB7XHJcbiAgICBjb25zdCBjYWxlbmRhckFwaSA9IGNhbGVuZGFyUmVmLmN1cnJlbnQuZ2V0QXBpKCk7XHJcbiAgICBjYWxlbmRhckFwaS5uZXh0KCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGFuZ2VWaWV3KHZpZXdOYW1lKSB7XHJcbiAgICBjb25zdCBjYWxlbmRhckFwaSA9IGNhbGVuZGFyUmVmLmN1cnJlbnQgJiYgY2FsZW5kYXJSZWYuY3VycmVudC5nZXRBcGkoKTtcclxuICAgIGlmICghY2FsZW5kYXJBcGkpIHtcclxuICAgICAgc2V0TWVzc2FnZSgnQ2FsZW5kYXIgbm90IHJlYWR5IHlldCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICBjYWxlbmRhckFwaS5jaGFuZ2VWaWV3KHZpZXdOYW1lKTtcclxuICAgICAgc2V0TWVzc2FnZShgU3dpdGNoZWQgdG8gJHt2aWV3TmFtZX1gKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2hhbmdlIHZpZXcnLCBlcnIpO1xyXG4gICAgICBzZXRNZXNzYWdlKCdGYWlsZWQgdG8gY2hhbmdlIHZpZXcnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIENvbnZlcnQgSUNTIGRhdGUvdGltZSBzdHJpbmcgdG8gYW4gSVNPIG9yIGRhdGUgc3RyaW5nIGFjY2VwdGFibGUgYnkgRnVsbENhbGVuZGFyXHJcbiAgZnVuY3Rpb24gcGFyc2VJY3NEYXRlKGljc0RhdGUpIHtcclxuXHJcbiAgICBpZiAoIWljc0RhdGUpIHJldHVybiBudWxsO1xyXG4gICAgY29uc3QgY2xlYW5lZCA9IGljc0RhdGUudHJpbSgpO1xyXG5cclxuICAgIC8vIERhdGUtb25seSAoWVlZWU1NREQpXHJcbiAgICBpZiAoL15cXGR7OH0kLy50ZXN0KGNsZWFuZWQpKSB7XHJcbiAgICAgIGNvbnN0IHkgPSBjbGVhbmVkLnNsaWNlKDAsIDQpO1xyXG4gICAgICBjb25zdCBtID0gY2xlYW5lZC5zbGljZSg0LCA2KTtcclxuICAgICAgY29uc3QgZCA9IGNsZWFuZWQuc2xpY2UoNiwgOCk7XHJcbiAgICAgIHJldHVybiBgJHt5fS0ke219LSR7ZH1gOyAvLyBmdWxsQ2FsZW5kYXIgdHJlYXRzIHRoaXMgYXMgYWxsLWRheVxyXG4gICAgfVxyXG5cclxuICAgIC8vIERhdGUtdGltZVxyXG4gICAgY29uc3QgbSA9IGNsZWFuZWQubWF0Y2goL14oXFxkezR9KShcXGR7Mn0pKFxcZHsyfSlUKFxcZHsyfSkoXFxkezJ9KShcXGR7Mn0pKFopPyQvKTtcclxuICAgIGlmIChtKSB7XHJcbiAgICAgIGNvbnN0IFssIHksIG1vLCBkLCBoaCwgbW0sIHNzLCB6XSA9IG07XHJcbiAgICAgIGlmICh6KSB7XHJcbiAgICAgICAgLy8gVVRDXHJcbiAgICAgICAgcmV0dXJuIGAke3l9LSR7bW99LSR7ZH1UJHtoaH06JHttbX06JHtzc31aYDtcclxuICAgICAgfVxyXG4gICAgICAvLyB0cmVhdCBhcyBsb2NhbCB0aW1lIChubyB0aW1lem9uZSlcclxuICAgICAgcmV0dXJuIGAke3l9LSR7bW99LSR7ZH1UJHtoaH06JHttbX06JHtzc31gO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZhbGxiYWNrOiB0cnkgRGF0ZS5wYXJzZVxyXG4gICAgY29uc3QgcGFyc2VkID0gRGF0ZS5wYXJzZShjbGVhbmVkKTtcclxuICAgIGlmICghaXNOYU4ocGFyc2VkKSkgcmV0dXJuIG5ldyBEYXRlKHBhcnNlZCkudG9JU09TdHJpbmcoKTtcclxuICAgIHJldHVybiBjbGVhbmVkO1xyXG4gIH1cclxuXHJcbiAgLy8gUGFyc2UgYSBzaW5nbGUgVkVWRU5UIGJsb2NrIGFuZCByZXR1cm4gYW4gZXZlbnQgb2JqZWN0IGZvciBGdWxsQ2FsZW5kYXJcclxuICBmdW5jdGlvbiBwYXJzZVZFdmVudChibG9jaykge1xyXG4gICAgLy8gdW5mb2xkIGZvbGRlZCBsaW5lcyBwZXIgUkZDOiBsaW5lcyB0aGF0IHN0YXJ0IHdpdGggYSBzcGFjZSBvciB0YWIgYXJlIGNvbnRpbnVhdGlvbnNcclxuICAgIGJsb2NrID0gYmxvY2sucmVwbGFjZSgvXFxyP1xcblsgXFx0XS9nLCAnJyk7XHJcblxyXG4gICAgY29uc3QgZ2V0UHJvcCA9IChuYW1lKSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChuYW1lICsgXCJbXjpdKjooW15cXHJcXG5dKylcIiwgJ2knKTtcclxuICAgICAgY29uc3QgbSA9IGJsb2NrLm1hdGNoKHJlKTtcclxuICAgICAgcmV0dXJuIG0gPyBtWzFdLnRyaW0oKSA6IG51bGw7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHJhd1N1bW1hcnkgPSBnZXRQcm9wKCdTVU1NQVJZJykgfHwgJ1VudGl0bGVkJztcclxuICAgIGNvbnN0IHJhd0R0U3RhcnQgPSBnZXRQcm9wKCdEVFNUQVJUJyk7XHJcbiAgICBjb25zdCByYXdEdEVuZCA9IGdldFByb3AoJ0RURU5EJykgfHwgZ2V0UHJvcCgnRFVFJyk7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIGlmIGFsbC1kYXk6IERUU1RBUlQgd2l0aG91dCB0aW1lIChZWVlZTU1ERClcclxuICAgIGNvbnN0IGFsbERheSA9IHJhd0R0U3RhcnQgJiYgL15cXGR7OH0kLy50ZXN0KHJhd0R0U3RhcnQpO1xyXG5cclxuICAgIGNvbnN0IHN0YXJ0ID0gcGFyc2VJY3NEYXRlKHJhd0R0U3RhcnQpO1xyXG4gICAgY29uc3QgZW5kID0gcGFyc2VJY3NEYXRlKHJhd0R0RW5kKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0aXRsZTogcmF3U3VtbWFyeSxcclxuICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICBlbmQ6IGVuZCB8fCB1bmRlZmluZWQsXHJcbiAgICAgIGFsbERheTogYWxsRGF5LFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUZpbGUoZSkge1xyXG4gICAgc2V0TWVzc2FnZSgnJyk7XHJcbiAgICBjb25zdCBmaWxlID0gZS50YXJnZXQuZmlsZXMgJiYgZS50YXJnZXQuZmlsZXNbMF07XHJcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcclxuXHJcbiAgICBpZiAoIWZpbGUubmFtZS50b0xvd2VyQ2FzZSgpLmVuZHNXaXRoKCcuaWNzJykpIHtcclxuICAgICAgc2V0TWVzc2FnZSgnUGxlYXNlIHNlbGVjdCBhIC5pY3MgZmlsZScpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGFzdEZpbGUoZmlsZSk7XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IGZpbGUudGV4dCgpO1xyXG5cclxuICAgIC8vIFNwbGl0IGludG8gVkVWRU5UIGJsb2Nrc1xyXG4gICAgY29uc3QgcGFydHMgPSB0ZXh0LnNwbGl0KC9CRUdJTjpWRVZFTlQvaSkuc2xpY2UoMSk7XHJcbiAgICBpZiAoIXBhcnRzLmxlbmd0aCkge1xyXG4gICAgICBzZXRNZXNzYWdlKCdObyBWRVZFTlQgZW50cmllcyBmb3VuZCBpbiB0aGUgLmljcyBmaWxlLicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZXZlbnRzID0gcGFydHMubWFwKChwKSA9PiB7XHJcbiAgICAgIC8vIFJlbW92ZSBldmVyeXRoaW5nIGFmdGVyIEVORDpWRVZFTlQgZm9yIHNhZmV0eVxyXG4gICAgICBjb25zdCBibG9jayA9IChwLnNwbGl0KC9FTkQ6VkVWRU5UL2kpWzBdIHx8ICcnKS50cmltKCk7XHJcbiAgICAgIHJldHVybiBwYXJzZVZFdmVudChibG9jayk7XHJcbiAgICB9KS5maWx0ZXIoQm9vbGVhbik7XHJcblxyXG4gICAgLy8gQWRkIHRvIGNhbGVuZGFyXHJcbiAgICBjb25zdCBjYWxlbmRhckFwaSA9IGNhbGVuZGFyUmVmLmN1cnJlbnQgJiYgY2FsZW5kYXJSZWYuY3VycmVudC5nZXRBcGkoKTtcclxuICAgIGlmICghY2FsZW5kYXJBcGkpIHtcclxuICAgICAgc2V0TWVzc2FnZSgnQ2FsZW5kYXIgaXMgbm90IGluaXRpYWxpemVkIHlldC4gVHJ5IGFnYWluIGFmdGVyIGl0IGxvYWRzLicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGFkZGVkID0gMDtcclxuICAgIGZvciAoY29uc3QgZXYgb2YgZXZlbnRzKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gZnVsbENhbGVuZGFyIHdpbGwgYWNjZXB0IHN0YXJ0L2VuZCBhcyBJU08gb3IgZGF0ZSBzdHJpbmdzXHJcbiAgICAgICAgY2FsZW5kYXJBcGkuYWRkRXZlbnQoZXYpO1xyXG4gICAgICAgIGFkZGVkKys7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIC8vIGlnbm9yZSBzaW5nbGUtZXZlbnQgZmFpbHVyZXNcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gYWRkIGV2ZW50JywgZXYsIGVycik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRMYXN0SW1wb3J0ZWRFdmVudHMoZXZlbnRzKTtcclxuICAgIHNldE1lc3NhZ2UoYEltcG9ydGVkICR7YWRkZWR9IGV2ZW50KHMpIGZyb20gJHtmaWxlLm5hbWV9YCk7XHJcblxyXG4gICAgLy8gcmVzZXQgZmlsZSBpbnB1dCBzbyBzYW1lIGZpbGUgY2FuIGJlIHJlLXNlbGVjdGVkIGlmIG5lZWRlZFxyXG4gICAgZS50YXJnZXQudmFsdWUgPSAnJztcclxuICB9XHJcblxyXG4gIC8vIFNlbmQgbGFzdCBpbXBvcnRlZCBldmVudHMgdG8gYmFja2VuZCBhcyBKU09OXHJcbiAgYXN5bmMgZnVuY3Rpb24gc2VuZEltcG9ydGVkRXZlbnRzVG9TZXJ2ZXIoKSB7XHJcbiAgICBzZXRNZXNzYWdlKCcnKTtcclxuICAgIGlmICghbGFzdEltcG9ydGVkRXZlbnRzIHx8ICFsYXN0SW1wb3J0ZWRFdmVudHMubGVuZ3RoKSB7XHJcbiAgICAgIHNldE1lc3NhZ2UoJ05vIGltcG9ydGVkIGV2ZW50cyB0byBzZW5kLiBJbXBvcnQgYSAuaWNzIGZpcnN0LicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFCQUNLRU5EX1VSTCkge1xyXG4gICAgICBzZXRNZXNzYWdlKCdCQUNLRU5EX1VSTCBub3QgY29uZmlndXJlZCBpbiBjbGllbnQuIFNldCBSRUFDVF9BUFBfQkFDS0VORF9VUkwgdG8gZW5hYmxlIHNlcnZlciBjYWxscy4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoYW5nZWQgZW5kcG9pbnQgdG8gbWF0Y2ggaGVscGVyIHNlcnZlcjogL2FwaS9pbXBvcnQtZXZlbnRzXHJcbiAgICBjb25zdCBlbmRwb2ludCA9IGAke0JBQ0tFTkRfVVJMfS9hcGkvaW1wb3J0LWV2ZW50c2A7XHJcbiAgICBzZXRNZXNzYWdlKGBTZW5kaW5nICR7bGFzdEltcG9ydGVkRXZlbnRzLmxlbmd0aH0gZXZlbnRzIHRvIHNlcnZlci4uLmApO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIC8vID09PT09IEJhY2tlbmQgY2FsbCBwb2ludCA9PT09PVxyXG4gICAgICAvLyBQT1NUIEpTT04gcGF5bG9hZDogeyBzb3VyY2VGaWxlOiAnPGZpbGVuYW1lPicsIGV2ZW50czogWyB7IHRpdGxlLCBzdGFydCwgZW5kLCBhbGxEYXkgfSBdIH1cclxuICAgICAgLy8gSWYgeW91ciBQeXRob24gYmFja2VuZCBleHBlY3RzIGEgbXVsdGlwYXJ0IHVwbG9hZCB3aXRoIHRoZSByYXcgLmljcywgdXNlIHNlbmRSYXdGaWxlVG9TZXJ2ZXIoKSBiZWxvdyBpbnN0ZWFkLlxyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChlbmRwb2ludCwge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyAvKiwgJ0F1dGhvcml6YXRpb24nOiAnQmVhcmVyIDx0b2tlbj4nICovIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzb3VyY2U6ICdjbGllbnQtaWNzJywgZXZlbnRzOiBsYXN0SW1wb3J0ZWRFdmVudHMgfSksXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCFyZXMub2spIHtcclxuICAgICAgICBjb25zdCB0eHQgPSBhd2FpdCByZXMudGV4dCgpLmNhdGNoKCgpID0+ICcnKTtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodHh0IHx8IGBTZXJ2ZXIgcmVzcG9uZGVkICR7cmVzLnN0YXR1c31gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCk7XHJcbiAgICAgIHNldE1lc3NhZ2UoYm9keT8ubWVzc2FnZSB8fCBgU2VydmVyIGFjY2VwdGVkICR7bGFzdEltcG9ydGVkRXZlbnRzLmxlbmd0aH0gZXZlbnRzLmApO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzZW5kIGV2ZW50cycsIGVycik7XHJcbiAgICAgIHNldE1lc3NhZ2UoJ0ZhaWxlZCB0byBzZW5kIGV2ZW50cyB0byBzZXJ2ZXI6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBPcHRpb25hbGx5IHNlbmQgcmF3IGZpbGUgKG11bHRpcGFydC9mb3JtLWRhdGEpIHRvIHRoZSBiYWNrZW5kXHJcbiAgYXN5bmMgZnVuY3Rpb24gc2VuZFJhd0ZpbGVUb1NlcnZlcigpIHtcclxuICAgIHNldE1lc3NhZ2UoJycpO1xyXG4gICAgaWYgKCFsYXN0RmlsZSkge1xyXG4gICAgICBzZXRNZXNzYWdlKCdObyBmaWxlIGF2YWlsYWJsZS4gUGxlYXNlIGltcG9ydCBhbiAuaWNzIGZpbGUgZmlyc3QuJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICghQkFDS0VORF9VUkwpIHtcclxuICAgICAgc2V0TWVzc2FnZSgnQkFDS0VORF9VUkwgbm90IGNvbmZpZ3VyZWQgaW4gY2xpZW50LiBTZXQgUkVBQ1RfQVBQX0JBQ0tFTkRfVVJMIHRvIGVuYWJsZSBzZXJ2ZXIgY2FsbHMuJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbmRwb2ludCA9IGAke0JBQ0tFTkRfVVJMfS9hcGkvaW1wb3J0LWV2ZW50cy91cGxvYWRgO1xyXG4gICAgc2V0TWVzc2FnZSgnVXBsb2FkaW5nIC5pY3MgZmlsZSB0byBzZXJ2ZXIuLi4nKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBmb3JtID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIGZvcm0uYXBwZW5kKCdmaWxlJywgbGFzdEZpbGUsIGxhc3RGaWxlLm5hbWUpO1xyXG5cclxuICAgICAgLy8gPT09PT0gQmFja2VuZCBjYWxsIHBvaW50IChtdWx0aXBhcnQgdXBsb2FkKSA9PT09PVxyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChlbmRwb2ludCwge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIC8vIERPIE5PVCBzZXQgQ29udGVudC1UeXBlIHdoZW4gc2VuZGluZyBGb3JtRGF0YTsgdGhlIGJyb3dzZXIgd2lsbCBzZXQgdGhlIGNvcnJlY3QgYm91bmRhcnlcclxuICAgICAgICAvLyBoZWFkZXJzOiB7ICdBdXRob3JpemF0aW9uJzogJ0JlYXJlciA8dG9rZW4+JyB9XHJcbiAgICAgICAgYm9keTogZm9ybSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoIXJlcy5vaykge1xyXG4gICAgICAgIGNvbnN0IHR4dCA9IGF3YWl0IHJlcy50ZXh0KCkuY2F0Y2goKCkgPT4gJycpO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0eHQgfHwgYFNlcnZlciByZXNwb25kZWQgJHtyZXMuc3RhdHVzfWApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiBudWxsKTtcclxuICAgICAgc2V0TWVzc2FnZShib2R5Py5tZXNzYWdlIHx8ICdGaWxlIHVwbG9hZGVkIHN1Y2Nlc3NmdWxseS4nKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdVcGxvYWQgZmFpbGVkJywgZXJyKTtcclxuICAgICAgc2V0TWVzc2FnZSgnVXBsb2FkIGZhaWxlZDogJyArIChlcnIubWVzc2FnZSB8fCBlcnIpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImNhbGVuZGFyLXBhZ2VcIj5cclxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjYWxlbmRhci1jb250cm9sc1wiPlxyXG4gICAgICAgICAgey8qIEhvbWUgYnV0dG9uIC0gbmF2aWdhdGVzIGJhY2sgdG8gdGhlIGFwcCBob21lcGFnZSAqL31cclxuICAgICAgICAgIDxCdXR0b25cclxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gbmF2aWdhdGUoJy8nKX1cclxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaG9tZS1idXR0b25cIlxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICBIb21lXHJcbiAgICAgICAgICA8L0J1dHRvbj5cclxuICAgICAgICA8RnVsbENhbGVuZGFyXHJcbiAgICAgICAgICByZWY9e2NhbGVuZGFyUmVmfVxyXG4gICAgICAgICAgcGx1Z2lucz17W2RheUdyaWRQbHVnaW4sIHRpbWVHcmlkUGx1Z2luXX1cclxuICAgICAgICAgIGluaXRpYWxWaWV3PVwiZGF5R3JpZE1vbnRoXCJcclxuICAgICAgICAvPlxyXG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmaWxlLWxhYmVsXCI+XHJcbiAgICAgICAgICBMb2FkIC5pY3MgZmlsZTpcclxuICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJmaWxlLWlucHV0XCIgdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCIuaWNzXCIgb25DaGFuZ2U9e2hhbmRsZUZpbGV9IC8+XHJcbiAgICAgICAgPC9sYWJlbD5cclxuXHJcbiAgICAgICAgey8qIFNlbmQvaW1wb3J0IGNvbnRyb2xzICovfVxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidmlldy1idXR0b25zXCI+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImNvbnRyb2wtYnV0dG9uXCIgb25DbGljaz17KCkgPT4gY2hhbmdlVmlldygnZGF5R3JpZE1vbnRoJyl9Pk1vbnRoPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImNvbnRyb2wtYnV0dG9uXCIgb25DbGljaz17KCkgPT4gY2hhbmdlVmlldygndGltZUdyaWRXZWVrJyl9PldlZWs8L2J1dHRvbj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiY29udHJvbC1idXR0b25cIiBvbkNsaWNrPXsoKSA9PiBjaGFuZ2VWaWV3KCd0aW1lR3JpZERheScpfT5EYXk8L2J1dHRvbj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiY29udHJvbC1idXR0b25cIiBvbkNsaWNrPXtzZW5kSW1wb3J0ZWRFdmVudHNUb1NlcnZlcn0+U2VuZCBFdmVudHMgdG8gU2VydmVyPC9idXR0b24+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImNvbnRyb2wtYnV0dG9uXCIgb25DbGljaz17c2VuZFJhd0ZpbGVUb1NlcnZlcn0+VXBsb2FkIC5pY3MgdG8gU2VydmVyPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm1lc3NhZ2VcIj57bWVzc2FnZX08L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufSJdLCJmaWxlIjoiQzovVXNlcnMvU2Fua2EvRGVza3RvcC9TY2hvb2wgQ29kaW5nIHByb2plY3RzL0hlYWRzcGFjZV9XaXphcmRzL2Zyb250ZW5kL3NyYy9Db21wb25lbnRzL2NhbGVuZGVyUGFnZS5qc3gifQ==