const express = require("express");
const app = express();

const mysql = require("mysql");
const port = 9999;

var bodyParser = require('body-parser');
const cons = require("consolidate");
const { query } = require("express");
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('public'));

app.listen(port);

var con = mysql.createConnection({
    host: "localhost",
    user: "dev_learner",
    password: "dev@mysql_all",
    database : "student_exam_scenario"
});
  
con.connect(function(err) {
    if (err) throw err;
});

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html");
});

var sbj = {};
var subjects = {};
var reverse_sbj_pk = {};
var sbj_length = 0;
// get all subjects and arrange the subjects; pk to name .. name to pk
function getAllSubjects(){
    con.query("SELECT * FROM subjects_mst ORDER BY subject_pk", (error, result)=>{
        sbj = JSON.parse(JSON.stringify(result));
        subjects = {}
        for(var k in sbj){
            subjects[sbj[k].subject_pk] = sbj[k].subject_name
        }
        console.log(subjects)
        reverse_sbj_pk = {}
        for(var k in sbj){
            reverse_sbj_pk[sbj[k].subject_name] = sbj[k].subject_pk
        }
        console.log(reverse_sbj_pk)
        // find length of subjects
        sbj_length = 0
        for(var key in subjects) {
            if(subjects.hasOwnProperty(key)) {
            sbj_length++;
            }
        }
    });
}
getAllSubjects();

function getStudentByPK(pk, res, callback){
    if(pk == -1){
        where = " "
    }else{
        where = " WHERE student_pk="+pk+" "
    }
    con.query("SELECT * FROM students_mst"+where+"ORDER BY student_pk", (err, result)=>{
        console.log(JSON.parse(JSON.stringify(result)))
        result_array = JSON.parse(JSON.stringify(result));
        callback(result_array, res)
        return
    });
};

function show_students(result_array, res){
    var table_script = "";
    var column_script = "<tr><th>Roll Number</th><th>First Name</th><th>Last Name</th></tr>"
    var length = result_array.length;

    if(length > 0){
        for(var i=0; i<length; i++){
            roll_number = i+1
            table_script += "<tr>"
            table_script += "<td>" + roll_number + "</td>"
            table_script += "<td>" + result_array[i].first_name + "</td>"
            table_script += "<td>" + result_array[i].last_name + "</td>"
            table_script += "</tr>"
        };
        
    }else{
        table_script="No student records found in database";
        column_script = ""
    }

    res.send("<html><head><title>Students Page</title></head><body><table>"+column_script+table_script+"</table>  <form action='/students/add' method='POST'><fieldset> First name: <input type='text' id='fname' name='first_name'><br>Last name:  <input type='text' id='lname' name='last_name'><br><input type='submit' value='Submit'></fieldset></form><a href='/index.html'>Home Page<a></body></html>")

}

function getStudentByNAME(full_name, res, callback){
    pos = full_name.indexOf(" ");
    first_name = full_name.slice(0,pos)
    last_name = full_name.slice(pos+1, full_name.length+1)
    con.query("SELECT * FROM students_mst WHERE first_name='"+first_name+"' AND last_name='"+last_name+"'", (err, result)=>{
        console.log(result)
        result_array = JSON.parse(JSON.stringify(result))
        callback(result_array, res)
        return 
    });
}

app.get('/students_page.html', function (req, res) {
    getStudentByPK(-1, res, show_students)
 });

 app.post('/students/add', (req,res) => {
    querry = "INSERT INTO students_mst(first_name, last_name) VALUES('"+req.body.first_name.trim()+"','"+req.body.last_name.trim()+"');"
    con.query(querry, (err, result)=>{
        console.log(querry)
        console.log(req.body.first_name)
        console.log(req.body.last_name)
        res.redirect("/students_page.html");
      });
});

app.get('/subjects_page.html', function (req, res) {
    var table_script = "";
    var column_script = "<tr><th>Sr.</th><th>Subject</th></tr>"
    console.log(sbj)

    if(sbj_length > 0){
        for(var i=0; i<sbj_length; i++){
            sr_number = i + 1
            table_script += "<tr>"
            table_script += "<td>" + sr_number + "</td>"
            table_script += "<td>" + sbj[i].subject_name + "</td>"
            table_script += "</tr>"
        };
        
    }else{
        table_script="No subjects records found in database";
        column_script = ""
    }

    res.send("<html><head><title>Subjects Page</title></head><body><table>"+column_script+table_script+"</table>  <form action='/subjects/add' method='POST'><fieldset>Subject: <input type='text' id='subj' name='subject_name'><input type='submit' value='Submit'></fieldset></form><a href='/index.html'>Home Page<a></body></html>")
});

app.post('/subjects/add', (req,res) => { 
    con.query("INSERT INTO subjects_mst(subject_name) VALUES('"+req.body.subject_name+"')", (err, result)=>{
        getAllSubjects();
        res.redirect("/subjects_page.html");
      });
});

function marks_callback(result_array, res){
    var dp_script;
    console.log(result_array)
    length = result_array.length;
    console.log(length)
    if(length>0){
        dp_script = "<form action='/marks_main' method='post'><select name = 'select_student'>";
        for(var i=0;i<length;i++){
            dp_script += "<option value='"+result_array[i].first_name+" "+result_array[i].last_name+"'>";
            dp_script += result_array[i].first_name+" "+result_array[i].last_name;
            dp_script += "</option>";
        }

        dp_script += "</select><input type='submit' value='Submit'></form>"
    }
    else{
        dp_script = "<h2>No students found in the database</h2>"
    }
    res.send("<html><head><title>Marks Page</title></head><body>"+dp_script+"</body></html>")

}

app.get("/marks.html", function(req,res){
    students = getStudentByPK(-1, res, marks_callback)
});

function marks_table_cb(result_array, res){
    std_fk = result_array[0].student_pk
    std_name = result_array[0].first_name + " "+result_array[0].last_name
    var entered_sbj, marks, myquery;

    con.query("SELECT * FROM marks WHERE student_fk="+std_fk, (error, result)=>{
        marks = JSON.parse(JSON.stringify(result))
        //console.log(marks)
        entered_sbj = []
        for(var packet in marks){
            entered_sbj.push(marks[packet].subject_fk)
        }
        console.log("ENTERED SBJ")
        console.log(entered_sbj)
    });
    
    con.query("select * from subjects_mst where subject_pk not in (select subject_fk from marks where student_fk = "+std_fk+");", (error, result)=>{
        console.log("RESULT")
        console.log(result)
        empty_sbj = JSON.parse(JSON.stringify(result))
        console.log(empty_sbj)
        tb_script = "<tr><td>"+std_name+"</td>";//+"</tr>";
        if(entered_sbj.length==0){
            tb_script += "<td colspan='2'>No marks entered for this student!</td></tr>"
        }
        // just display marks
        var j = 0;
        for(j=0;j<entered_sbj.length;j++){
            if(j!=0){
                // display student name only once
                tb_script += "<tr><td></td>"
            }
            tb_script += "<td>"+subjects[entered_sbj[j]]+"</td>"
            tb_script += "<td>"+marks[j].marks+"</td>"
            tb_script += "</tr>"
        }            

        // for marks not entered
        tb_script += "<tr><td></td>";
        tb_script += "<form action='/add_marks' method='post'>"
        tb_script += "<td><select name='subject' id='subject'>"
        var i = 0;

        for(i=0;i<empty_sbj.length;i++){
            tb_script += "<option value='"+empty_sbj[i].subject_pk+","+std_fk+"'>"+empty_sbj[i].subject_name+"</option>";
        }
        
        tb_script += "</td><td><input type='number' id='e_marks' name='e_marks'><input type='submit' value='Submit'>"
        tb_script += "</select></form></td></tr>"
        
    console.log(tb_script);
    res.send("<html><head><title>"+std_name+" Marks</title></head><body><table BORDER=1 CELLSPACING=10><th>Student 	Name</th><th>Subject</th><th>Marks(/100)</th>"+tb_script+"</table></body></html>")
            //myfunction(entered_sbj, res, result)
        
    });
}

app.post("/marks_main", (req, res)=>{
    full_name = req.body.select_student;
    getStudentByNAME(full_name, res, marks_table_cb)
    //empty_pos = full_name.indexOf(" ")
    //first_name = full_name.slice(0, empty_pos)
    //last_name = full_name.slice(empty_pos+1, full_name.length+1)
    //console.log(first_name +"----"+ last_name)
})

app.post("/add_marks", (req, res)=>{
    var sbj_std = req.body.subject;
    var e_marks = req.body.e_marks;
    comma_pos = sbj_std.indexOf(",")
    my_sbj = sbj_std.slice(0,comma_pos)
    console.log(sbj_std)
    std_pk = sbj_std.slice(comma_pos+1,sbj_std.length)
    console.log(my_sbj, e_marks, std_pk)
    con.query("INSERT INTO marks(subject_fk,student_fk,marks) VALUES('"+my_sbj+"',"+std_pk+","+e_marks+")")
    console.log("INSERT INTO marks(subject_fk,student_fk,marks) VALUES('"+my_sbj+"',"+std_pk+","+e_marks+")")
    res.redirect("/marks.html");
})
