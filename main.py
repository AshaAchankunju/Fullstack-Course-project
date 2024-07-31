from fastapi import FastAPI, BackgroundTasks
import pandas as pd
import httpx
from io import StringIO
from pymongo import MongoClient
from datetime import datetime, timedelta
import asyncio
import logging

app = FastAPI()

# Set up logging
logging.basicConfig(level=logging.INFO)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client['course_db']
collection = db['CourseName']

# Ensure the data expires every 10 minutes
collection.create_index("createdAt", expireAfterSeconds=600)

# URL to download the CSV file
url = "https://api.mockaroo.com/api/501b2790?count=1000&key=8683a1c0"

@app.on_event("startup")
async def startup_event():
    logging.info("Starting up...")
    
    # Check if data is expired or not present
    if await is_data_expired():
        logging.info("Data expired or not present. Fetching new data.")
        await fetch_and_store_data()
    else:
        logging.info("Data is fresh. No need to fetch new data.")
    
    # Start the background task to refresh data every 10 minutes
    asyncio.create_task(refresh_data_periodically())

@app.get("/")
def read_root():
    return {"message": "Welcome to the Course API"}

@app.get("/courses")
def get_courses():
    courses = list(collection.find({}, {"_id": 0}))
    return {"CourseName": courses}

async def fetch_and_store_data():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            csv_data = StringIO(response.text)
            df = pd.read_csv(csv_data)
        
        # Print columns for debugging
        print("Columns in the DataFrame:", df.columns)

        # Normalize data with proper checks
        if 'StartDate' in df.columns and 'EndDate' in df.columns:
            df['StartDate'] = pd.to_datetime(df['StartDate'], errors='coerce')
            df['EndDate'] = pd.to_datetime(df['EndDate'], errors='coerce')
        else:
            logging.warning("Start Date or End Date columns are missing.")

        df['createdAt'] = datetime.utcnow()
        data = df.to_dict(orient='records')
        collection.delete_many({})  # Clear old data
        collection.insert_many(data)
        logging.info("Data fetched and stored successfully.")

    except Exception as e:
        logging.error(f"Error fetching and storing data: {e}")

async def refresh_data_periodically():
    while True:
        await fetch_and_store_data()
        await asyncio.sleep(600)  # Wait for 10 minutes

async def is_data_expired():
    try:
        latest_entry = collection.find_one(sort=[("createdAt", -1)])
        if latest_entry:
            latest_time = latest_entry.get("createdAt")
            if latest_time:
                return datetime.utcnow() - latest_time > timedelta(minutes=10)
        # If no data or timestamp is missing, consider data as expired
        return True
    except Exception as e:
        logging.error(f"Error checking data expiration: {e}")
        return True  # Assume data is expired if there's an error

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
