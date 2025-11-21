"""
Simple Flask wrapper to expose HTTP endpoints that call into `frontend/src/backend.py` helpers.

Notes:
- This server is intentionally defensive: it will try to import and call functions from
  `frontend/src/backend.py` but will return friendly errors if dependencies (pyodbc, groq)
  or the DB are not available.
- Adjust DB connection string and API behavior to match your production backend.

Run (from the project `frontend` folder):
  python backend_server.py

Install minimal deps:
  pip install flask flask-cors

Optional (if you want full DB/Groq support):
  pip install pyodbc groq

This file is a quick integration helper for local development and mapping with the frontend.
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tempfile
import os
import sys
import json
import traceback

# ensure src is importable
SRC_DIR = os.path.join(os.path.dirname(__file__), 'src')
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

app = Flask(__name__)
CORS(app)

# Helper: try to import the backend helpers module
def import_backend():
    try:
        import backend as backend_module
        return backend_module
    except Exception as e:
        # return None on import failure
        print('Failed to import frontend/src/backend.py:', e)
        return None

@app.route('/api/import-events', methods=['POST'])
def import_events_json():
    """Accepts JSON body: { sourceFile: string, rows: [ ... ] }
    Attempts to write a temporary CSV and call backend.upload_step_data(conn, filename).
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400

    rows = data.get('rows')
    filename = data.get('sourceFile') or 'upload.csv'
    if not rows:
        return jsonify({'error': 'No rows provided'}), 400

    # Create a temporary CSV file
    tmpfd, tmp_path = tempfile.mkstemp(prefix='import_', suffix='.csv')
    os.close(tmpfd)
    try:
        # Write rows to CSV assuming rows is list of dicts with consistent keys
        keys = rows[0].keys() if isinstance(rows[0], dict) else None
        with open(tmp_path, 'w', encoding='utf-8', newline='') as f:
            if keys:
                import csv
                writer = csv.DictWriter(f, fieldnames=list(keys))
                writer.writeheader()
                for r in rows:
                    writer.writerow(r)
            else:
                # If rows are lists, join by commas
                for r in rows:
                    f.write(','.join(map(str, r)) + '\n')

        backend = import_backend()
        if not backend:
            return jsonify({'message': 'Rows saved to temporary CSV', 'temp_path': tmp_path, 'note': 'backend module not importable - cannot call DB helper'}), 200

        # attempt to create DB connection similar to backend.controller()
        try:
            import pyodbc
            conn = pyodbc.connect(
                "Driver={ODBC Driver 17 for SQL Server};"
                "Server=BLUEGHOST;"
                "Database=HSW;"
                "Trusted_Connection=yes;"
            )
        except Exception as e:
            return jsonify({'message': 'Temporary CSV saved', 'temp_path': tmp_path, 'error': f'Failed to create DB connection: {e}'}), 200

        # try calling upload_step_data
        try:
            backend.upload_step_data(conn, tmp_path)
            return jsonify({'message': 'Backend upload_step_data invoked successfully'}), 200
        except Exception as e:
            tb = traceback.format_exc()
            return jsonify({'message': 'Backend call failed', 'error': str(e), 'trace': tb}), 500
    finally:
        # keep temp file for inspection if backend module not available; if upload done, remove
        pass

@app.route('/api/import-events/upload', methods=['POST'])
def import_events_upload():
    # multipart file upload with form field 'file'
    if 'file' not in request.files:
        return jsonify({'error': "Missing 'file' field"}), 400
    f = request.files['file']
    tmpfd, tmp_path = tempfile.mkstemp(prefix='upload_', suffix='_' + f.filename)
    os.close(tmpfd)
    f.save(tmp_path)

    backend = import_backend()
    if not backend:
        return jsonify({'message': 'File saved to temporary path', 'temp_path': tmp_path, 'note': 'backend module not importable - cannot call DB helper'}), 200

    try:
        import pyodbc
        conn = pyodbc.connect(
            "Driver={ODBC Driver 17 for SQL Server};"
            "Server=BLUEGHOST;"
            "Database=HSW;"
            "Trusted_Connection=yes;"
        )
    except Exception as e:
        return jsonify({'message': 'File saved', 'temp_path': tmp_path, 'error': f'Failed to create DB connection: {e}'}), 200

    try:
        backend.upload_step_data(conn, tmp_path)
        # success
        try:
            os.remove(tmp_path)
        except Exception:
            pass
        return jsonify({'message': 'File processed by backend.upload_step_data'}), 200
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({'message': 'Backend processing failed', 'error': str(e), 'trace': tb}), 500

@app.route('/api/reports/pull', methods=['GET'])
def reports_pull():
    table = request.args.get('table')
    if not table:
        return jsonify({'error': 'Missing table query param'}), 400

    backend = import_backend()
    if not backend:
        return jsonify({'error': 'backend module not importable'}), 500

    try:
        import pyodbc
        conn = pyodbc.connect(
            "Driver={ODBC Driver 17 for SQL Server};"
            "Server=BLUEGHOST;"
            "Database=HSW;"
            "Trusted_Connection=yes;"
        )
    except Exception as e:
        return jsonify({'error': f'Failed to connect to DB: {e}'}), 500

    try:
        res = backend.pull_data(conn, table)
        # pull_data uses FOR JSON PATH so the result may already be a JSON string
        return jsonify({'data': res}), 200
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({'error': str(e), 'trace': tb}), 500

@app.route('/api/reports/all', methods=['GET'])
def reports_all():
    backend = import_backend()
    if not backend:
        return jsonify({'error': 'backend module not importable'}), 500

    try:
        import pyodbc
        conn = pyodbc.connect(
            "Driver={ODBC Driver 17 for SQL Server};"
            "Server=BLUEGHOST;"
            "Database=HSW;"
            "Trusted_Connection=yes;"
        )
    except Exception as e:
        return jsonify({'error': f'Failed to connect to DB: {e}'}), 500

    try:
        res = backend.pull_all_data(conn)
        return jsonify({'data': res}), 200
    except Exception as e:
        tb = traceback.format_exc()
        return jsonify({'error': str(e), 'trace': tb}), 500

@app.route('/api/reports/gen', methods=['POST'])
def reports_gen():
    # This endpoint demonstrates how the frontend would request a generated report.
    body = request.get_json() or {}
    prompt_selection = body.get('prompt_selection', 3)

    backend = import_backend()
    if not backend:
        return jsonify({'error': 'backend module not importable; gen_report requires groq client and DB'}), 500

    # The backend.gen_report function expects a Groq client and a DB connection; calling it
    # requires groq and pyodbc to be installed and configured. For safety we return a message
    # instructing the operator how to enable it.
    return jsonify({'message': 'gen_report is available in backend.py but running it requires Groq API key and DB access. Implement this endpoint in your backend to call backend.gen_report(client, conn, prompt_selection)'}), 501

@app.route('/api/reports/export', methods=['GET'])
def reports_export():
    fmt = request.args.get('format', 'csv').lower()
    # Not implemented server-side here; frontend expects a file download.
    return jsonify({'error': 'Export endpoint not implemented in this helper server. Implement server-side PDF/CSV generation.'}), 501

@app.route('/api/reports/download/pdf', methods=['GET'])
def reports_download_pdf():
    # Not implemented - return helpful message
    return jsonify({'error': 'PDF download endpoint not implemented. Implement on backend to return application/pdf blob.'}), 501

if __name__ == '__main__':
    print('Starting helper backend server on http://127.0.0.1:5000')
    app.run(host='127.0.0.1', port=5000, debug=True)

