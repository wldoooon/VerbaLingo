import mysql.connector

def run():
    try:
        c = mysql.connector.connect(host='127.0.0.1', port=9306, user='root')
        cur = c.cursor(dictionary=True)
        cur.execute("SELECT category_title, channel, COUNT(*) as cnt FROM english_dataset GROUP BY category_title, channel ORDER BY category_title ASC, cnt DESC LIMIT 10")
        print("CATEGORIES AND CHANNELS:", cur.fetchall())
    except Exception as e:
        print("ERROR:", e)

if __name__ == '__main__':
    run()
