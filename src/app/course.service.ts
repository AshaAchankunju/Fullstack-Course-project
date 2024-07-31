import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment';


export interface Course {
  _id?: string;
  university: string;
  city: string;
  country: string;
  course_name: string;
  course_description: string;
  start_date: string;
  end_date: string;
  price: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCourses(queryParams: any): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`, { params: queryParams });
  }

  createCourse(course: Course): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.apiUrl}/courses`, course);
  }

  updateCourse(courseId: string, course: Course): Observable<{ status: string }> {
    return this.http.put<{ status: string }>(`${this.apiUrl}/courses/${courseId}`, course);
  }

  deleteCourse(courseId: string): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${this.apiUrl}/courses/${courseId}`);
  }
}
