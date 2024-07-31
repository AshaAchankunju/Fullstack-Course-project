from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from pymongo import MongoClient
from bson import ObjectId
import logging
from datetime import datetime

router = APIRouter()

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client['course_db']
collection = db['CourseName']

class Course(BaseModel):
    university: str
    city: str
    country: str
    course_name: str
    course_description: str
    start_date: datetime
    end_date: datetime
    price: float
    currency: str

@router.get("/courses")
async def get_courses(
    university: Optional[str] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    course_name: Optional[str] = None,
    course_description: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    currency: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1)
):
    query = {}
    if university:
        query["university"] = {"$regex": university, "$options": "i"}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if course_name:
        query["course_name"] = {"$regex": course_name, "$options": "i"}
    if course_description:
        query["course_description"] = {"$regex": course_description, "$options": "i"}
    if start_date:
        query["start_date"] = {"$gte": start_date}
    if end_date:
        query["end_date"] = {"$lte": end_date}
    if price_min is not None:
        query["price"] = {"$gte": price_min}
    if price_max is not None:
        if "price" in query:
            query["price"]["$lte"] = price_max
        else:
            query["price"] = {"$lte": price_max}
    if currency:
        query["currency"] = currency

    courses = list(collection.find(query).skip(skip).limit(limit))
    for course in courses:
        course["_id"] = str(course["_id"])  # Convert ObjectId to string
    return {"courses": courses}

@router.post("/courses")
async def create_course(course: Course):
    try:
        result = collection.insert_one(course.dict())
        return {"id": str(result.inserted_id)}
    except Exception as e:
        logging.error(f"Error creating course: {e}")
        raise HTTPException(status_code=400, detail="Error creating course")

@router.put("/courses/{course_id}")
async def update_course(course_id: str, course: Course):
    try:
        result = collection.update_one({"_id": ObjectId(course_id)}, {"$set": course.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error updating course: {e}")
        raise HTTPException(status_code=400, detail="Error updating course")

@router.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    try:
        result = collection.delete_one({"_id": ObjectId(course_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Error deleting course: {e}")
        raise HTTPException(status_code=400, detail="Error deleting course")

