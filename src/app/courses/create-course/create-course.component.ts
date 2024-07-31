import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CourseService, Course } from '../../course.service';


@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.css']
})
export class CreateCourseComponent implements OnInit {
  courseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    public dialogRef: MatDialogRef<CreateCourseComponent>
  ) {
    this.courseForm = this.fb.group({
      university: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      course_name: ['', Validators.required],
      course_description: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      currency: ['', Validators.required]
    });
  }

  onSave(): void {
    if (this.courseForm.valid) {
      // handle form submission
      console.log(this.courseForm.value);
      this.dialogRef.close();
    } else {
      // handle validation errors
    }
  }
  ngOnInit(): void {
    this.courseForm = new FormGroup({
      university: new FormControl('',Validators.required),
      city: new FormControl('', Validators.required),
      courseName: new FormControl('', Validators.required),
      // other form controls
    });
  }

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



