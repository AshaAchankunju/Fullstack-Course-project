import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService, Course } from '../../course.service';

@Component({
  selector: 'app-create-course',
  templateUrl: './update-course.component.html',
  styleUrls: ['./update-course.component.css']
})
export class UpdateCourseComponent implements OnInit {
  courseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    public dialogRef: MatDialogRef<UpdateCourseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.courseForm = this.fb.group({
      university: [data.university, Validators.required],
      city: [data.city, Validators.required],
      country: [data.country, Validators.required],
      course_name: [data.course_name, Validators.required],
      course_description: [data.course_description, Validators.required],
      start_date: [data.start_date, Validators.required],
      end_date: [data.end_date, Validators.required],
      price: [data.price, [Validators.required, Validators.min(0)]],
      currency: [data.currency, Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.courseForm.valid) {
      this.courseService.createCourse(this.courseForm.value).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}



