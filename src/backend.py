import pyodbc
from groq import Groq
import json
import csv
import numpy as np
from datetime import datetime


def controller():
    conn = pyodbc.connect(
        "Driver={ODBC Driver 17 for SQL Server};"
        "Server=BLUEGHOST;"
        "Database=HSW;"
        "Trusted_Connection=yes;"
    )
    client = Groq(api_key="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")
    gen_report(client, conn, 4)


def upload_step_data(conn, filename):
    cursor = conn.cursor()
    try:
        # combines step data based on days
        steps_list = []
        with open(filename, 'r') as csvfile:
            csv_reader = csv.reader(csvfile)

            next(csv_reader)
            for row in csv_reader:
                steps_list.append(row)
        steps_array = np.array(steps_list)
        days = []
        for row in steps_array:
            days.append(row[0].split(' ')[0])
        combined_days = list(dict.fromkeys(days))
        paired_days = [[x, 0] for x in combined_days]
        for row in steps_array:
            for day in paired_days:
                if row[0].split(' ')[0] == day[0]:
                    day[1] += int(row[2])

        # sends to database
        for day in paired_days:
            cursor.execute(f"INSERT INTO activity (day, steps, recorded_at) "
                            f"VALUES ('{day[0]}', {day[1]}, '{datetime.now()}'); ")
            conn.commit()
        print("Data inserted successfully")
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        if conn:
            conn.close()


def upload_sleep_data(conn):
    pass


def upload_screen_time(conn):
    pass


def pull_data(conn, table_name):
    cursor = conn.cursor()
    try:
        cursor.execute(f"""
        SELECT * 
        FROM {table_name} 
        WHERE recorded_at >= DATEADD(day, -7, GETDATE())
        FOR JSON PATH;
        """)
        return cursor.fetchone()
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        cursor.close()

def pull_all_data(conn):
    try:
        tables = ["alt_habit_data", "bad_habit_data", "goal_data",
                  "good_habit_data"]
        data = []
        for table in tables:
            data.append(pull_data(conn, table))
        return data
    except Exception as e:
        print(f"An error occurred: {e}")



def upload_habit(conn, json_data):
    cursor = conn.cursor()
    try:
        data = json.loads(json_data)
        if data["radioValue"] == "good":
            cursor.execute(
                "INSERT INTO good_habits (name, description) VALUES (?, ?)",
                (data["name"], data["description"])
            )
        else:
            cursor.execute(
                "INSERT INTO bad_habits (name, description) VALUES (?, ?)",
                (data["name"], data["description"])
            )
        conn.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def upload_goal(conn, json_data):
    cursor = conn.cursor()
    try:
        data = json.loads(json_data)
        cursor.execute(
            "INSERT INTO goals (name, weight, description, start_date, end_date, completed) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                data["name"],
                data["weight"],
                data["description"],
                data["start_date"],
                data["end_date"],
                data["completed"],
            )
        )
        conn.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def upload_habit_log(conn, json_data):
    cursor = conn.cursor()
    try:
        data = json.loads(json_data)
        if data["radioValue"] == "good":
            cursor.execute(
                "INSERT INTO good_habit_data (good_habit_id, duration_min, start_time, progress_report, recorded_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (
                    data["good_habit_id"],
                    data["duration_min"],
                    data["start_time"],
                    data["progress_report"],
                    data["recorded-at"],
                )
            )
        else:
            cursor.execute(
                "INSERT INTO bad_habit_data (bad_habit_id, start_time, duration_min, bad_trigger, recorded_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (
                    data["bad_habit_id"],
                    data["start_time"],
                    data["duration_min"],
                    data["bad_trigger"],
                    data["recorded-at"],
                )
            )
        conn.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def upload_goal_log(conn, json_data):
    cursor = conn.cursor()
    try:
        data = json.loads(json_data)
        cursor.execute(
            "INSERT INTO goals (goal_id, progress_report, recorded_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                data["name"],
                data["weight"],
                data["description"],
                data["start_date"],
                data["end_date"],
                data["completed"],
            )
        )
        conn.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def gen_report(client, conn, prompt_selection):
    try:
        q1 = ("Analyze all my data from the past week, "
              "focusing on health, screentime, habits, and "
              "any other metrics or observations available. "
              "Identify any unusual patterns or important highlights. "
              "Then, provide a detailed, narrative-style day-by-day "
              "report as if you are my personal coach, offering insights, "
              "encouragement, and suggestions for improvement.")

        q2 = ("Analyze all my data from the past week, "
              "focusing on health, screentime, habits, "
              "and any other metrics or observations available. , "
              "hypothesize possible cause-effect relationships. "
              "Identify how specific habits (such as sleep , "
              "physical activity, screentime, etc.) may be "
              "influencing my health outcomes (from physical, "
              "mental, or behavioral measurements). Reference "
              "concrete data trends whenever possible to support "
              "each hypothesis")

        q3 = ("Analyze all my data from the past week, "
              "focusing on my metrics that are available "
              "(Do not consider data that is not available).. "
              "Identify the top 3 good habits and top 3 bad "
              "habits that most strongly influence me. Analyze "
              "the data to determine which habits show the strongest "
              "correlation with positive or negative changes in "
              "well-being (including health, mood, productivity, "
              "or other relevant metrics). Use concrete examples "
              "and patterns from the data to justify each selection")

        q4 = ("Analyze all my data from the past week, "
              "focusing on my metrics that are available "
              "(Do not consider data that is not available). "
              "Identify any positive or negative trends in my "
              "well-being, health, or productivity metrics. "
              "Highlight significant changes—either improvements "
              "or declines—over this period. Additionally, point "
              "out any habits where my consistency has notably "
              "increased or decreased recently, supporting your "
              "findings with patterns or data trends.")

        q5 = ("Analyze my app usage data to determine "
              "which specific apps are most strongly "
              "correlated with decreased sleep duration "
              "or reduced step count. Provide insights "
              "into how these usage patterns may impact "
              "my mental health, activity levels, Good "
              "habits, bad Good habits and overall well-being. "
              "Using concrete data patterns where possible.")

        q6 = ("Analyze my app usage patterns to identify "
              "whether any particular app is consistently "
              "followed by a spike in bad habits (such as "
              "decreased sleep, increased screentime, "
              "unhealthy snacking, skipped workouts, etc.). "
              "Provide insights into how these usage patterns "
              "may impact my mental health, activity levels "
              "and Good habits. Use concrete data and examples "
              "from my tracked habits and app usage to justify "
              "your findings.")

        qs = [q1, q2, q3, q4, q5, q6]
        data = pull_all_data(conn)

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": qs[prompt_selection]
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        print(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if conn:
            conn.close()


if __name__ == '__main__':
    controller()
