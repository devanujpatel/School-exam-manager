# School-exam-manager
This is a very basic project and intended to enhance my understanding. It helps in keeping records of the marks obtained by students in various subjects.
Every school offers numerous subjects. You can add them in the database through a simple form.
Adding students is also similar. Then you can add marks for each subject the school supports for each individual student.
## Database EER
The MySql schema only consists of three tables- students, marks, subjects.<br>
<img src="https://github.com/devanujpatel/School-exam-manager/blob/main/images/eer%20diagram%20pic.png"/>
<br>
<h2>HTTP endpoints</h2>
I developed the backend and frontend for write operations only.<br>
    - /index.html <br>
    - /students_page.html<br>
    - /students/add (for post)<br>
    - /subjects_page.html<br>
    - /subjects/add (for post)<br>
    - /marks.html<br>
    - /marks_main (for post)<br>
    - /add_marks (for post)<br>
 <br>
<h2>See it in action</h2>
Everything is self-explanatory.<br>
Before any student record is added.
<img src="https://github.com/devanujpatel/School-exam-manager/blob/main/images/no%20student%20found.png"/>
<br>
Then when you add.
<img src="https://github.com/devanujpatel/School-exam-manager/blob/main/images/adding%20students.png"/>
<br>
In a matching manner you can also add subjects.
<img src="https://github.com/devanujpatel/School-exam-manager/blob/main/images/subjects.png"/>
<br>
Now, to add marks we first select a student.
<img src="https://github.com/devanujpatel/School-exam-manager/blob/main/images/select%20student.png"/>
<br>
<br>
Now select a subject to add marks for from the dropdown menu and enter the marks in the edit text field.
<img src="https://github.com/devanujpatel/School-exam-manager/blob/main/images/add%20marks.png"/>
<br>
After entering the marks.
<img src="https://github.com/devanujpatel/School-exam-manager/blob/main/images/after%20adding%20marks.png"/>
<br>
I have kept things extremely simple and have ignored a lot of stuff if it were have been a real-world app for a school.
