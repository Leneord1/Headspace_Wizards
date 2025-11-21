import time
import pyodbc
import numpy as np
import csv
from flask import Flask, request
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

def get_conn():
    return pyodbc.connect(
        "Driver={ODBC Driver 17 for SQL Server};"
        "Server=BLUEGHOST;"
        "Database=localhost;"
        "Trusted_Connection=yes;"
    )

@app.route('/api/upload-steps', methods=['POST'])
def upload_step_data():
    if "file" not in request.files:
        return {"error": "No file uploaded"}, 400

    file = request.files["file"]

    conn = get_conn()
    cursor = conn.cursor()

    try:
        # combines step data based on days
        csv_reader = csv.reader(file.stream.read().decode("utf-8").splitlines())
        next(csv_reader)

        steps_list = list(csv_reader)
        steps_array = np.array(steps_list)

        days = [row[0].split(" ")[0] for row in steps_array]
        unique_days = list(dict.fromkeys(days))

        paired_days = [[day, 0] for day in unique_days]

        for row in steps_array:
            date = row[0].split(" ")[0]
            steps = int(row[2])

            for day in paired_days:
                if day[0] == date:
                    day[1] += steps

        # sends to database
        for day, total_steps in paired_days:
            cursor.execute(
                """
                INSERT INTO activity (day, steps, recorded_at)
                VALUES (?, ?, ?)
                """,
                (day, total_steps, datetime.now())
            )

        conn.commit()
        return {"status": "success", "days_inserted": len(paired_days)}
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)
