import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { CourseService } from '../course.service';
import { UpdateCourseComponent } from './update-course/update-course.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses = new MatTableDataSource<any>();
  displayedColumns: string[] = ['university', 'city', 'country', 'course_name', 'course_description', 'start_date', 'actions'];
  totalCourses = 0;
  pageSize = 10;

  constructor(private courseService: CourseService, public dialog: MatDialog) {}

  ngOnInit() {
    this.getCourses();
  }

  getCourses() {
    this.courseService.getCourses({}).subscribe((data: any) => {
      this.courses.data = data.courses;
      this.totalCourses = data.total;
    });
  }

  openCreateDialog() {
   
    const dialogRef = this.dialog.open(CoursesComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.courseService.createCourse(result).subscribe(() => this.getCourses());
      }
    });
  }

  deleteCourse(id: string) {
    this.courseService.deleteCourse(id).subscribe(() => this.deleteCourse(id));
  }

  onPageChange(event: any) {
    this.onPageChange = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getCourses();
  }
  openUpdateDialog(id: string){

  }
}