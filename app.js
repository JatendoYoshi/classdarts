let students = [];
let classes = [];
let behaviours = [];

async function loadCloudData() {

    const studentResult =
        await supabase
        .from("students")
        .select("*");

    students =
        studentResult.data || [];

    const classResult =
        await supabase
        .from("classes")
        .select("*");

    classes =
        classResult.data || [];

    const behaviourResult =
        await supabase
        .from("behaviours")
        .select("*");

    behaviours =
        behaviourResult.data || [];

}

function saveData() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

    localStorage.setItem(
        "classes",
        JSON.stringify(classes)
    );

    localStorage.setItem(
        "behaviours",
        JSON.stringify(behaviours)
    );

}

function generateId() {

    return Date.now() +
        Math.floor(Math.random() * 1000);

}

function updateDashboard() {

    document.getElementById(
        "studentCount"
    ).textContent = students.length;

    document.getElementById(
        "classCount"
    ).textContent = classes.length;

    const today =
        new Date().toDateString();

    const todayRecords =
        behaviours.filter(b =>
            new Date(
                b.timestamp
            ).toDateString() === today
        );

    document.getElementById(
        "todayCount"
    ).textContent =
        todayRecords.length;

    let total = 0;

    behaviours.forEach(b => {
        total += Number(b.points);
    });

    document.getElementById(
        "totalPoints"
    ).textContent = total;

    renderRecentActivity();

}

function renderRecentActivity() {

    const container =
        document.getElementById(
            "recentActivity"
        );

    container.innerHTML = "";

    const sorted =
        [...behaviours]
        .sort(
            (a,b) =>
            new Date(b.timestamp)
            -
            new Date(a.timestamp)
        )
        .slice(0,10);

    if(sorted.length === 0){

        container.innerHTML =
            "<p>No activity yet.</p>";

        return;

    }

    sorted.forEach(record => {

        const student =
            students.find(
                s => s.id === record.studentId
            );

        const cls =
            classes.find(
                c => c.id === record.classId
            );

        const div =
            document.createElement("div");

        div.className =
            "student-card";

        div.innerHTML = `
            <strong>
            ${student ?
            student.name :
            "Unknown Student"}
            </strong>
            <br>

            ${record.type.toUpperCase()}

            |

            ${record.description}

            |

            ${record.points > 0
            ? "+"
            : ""}

            ${record.points}

            <br>

            ${cls ?
            cls.name :
            "Unknown Class"}

            <br>

            ${new Date(
                record.timestamp
            ).toLocaleString()}
        `;

        container.appendChild(div);

    });

}

function renderStudents() {

    const list =
        document.getElementById(
            "studentList"
        );

    list.innerHTML = "";

    students.forEach(student => {

        const card =
            document.createElement("div");

        card.className =
            "student-card";

        let assignedClasses =
            classes.filter(c =>
                student.classes.includes(
                    c.id
                )
            );

        card.innerHTML = `
            <strong>
                ${student.name}
            </strong>

            <br><br>

            Classes:

            ${
                assignedClasses.length
                ?
                assignedClasses
                .map(c => c.name)
                .join(", ")
                :
                "None Assigned"
            }

            <br><br>

            <button
                onclick="
                assignClass(
                ${student.id}
                )">
                Assign Class
            </button>

            <button
                onclick="
                deleteStudent(
                ${student.id}
                )">
                Delete
            </button>
        `;

        list.appendChild(card);

    });

}

function addStudent() {

    const input =
        document.getElementById(
            "studentName"
        );

    const name =
        input.value.trim();

    if(!name){
        return;
    }

    students.push({

        id: generateId(),

        name: name,

        classes: []

    });

    input.value = "";

    saveData();

    renderStudents();

    populateDropdowns();

    updateDashboard();

}

document
.getElementById(
    "addStudentBtn"
)
.addEventListener(
    "click",
    addStudent
);

```javascript id="lg7r0v"
function deleteStudent(id) {

    if(
        !confirm(
            "Delete this student?"
        )
    ){
        return;
    }

    students =
        students.filter(
            s => s.id !== id
        );

    behaviours =
        behaviours.filter(
            b => b.studentId !== id
        );

    saveData();

    renderStudents();

    populateDropdowns();

    updateDashboard();

}

function renderClasses() {

    const list =
        document.getElementById(
            "classList"
        );

    list.innerHTML = "";

    classes.forEach(cls => {

        const card =
            document.createElement("div");

        card.className =
            "class-card";

        card.innerHTML = `
            <strong>
                ${cls.name}
            </strong>

            <br><br>

            <button
                onclick="
                deleteClass(
                ${cls.id}
                )">
                Delete
            </button>
        `;

        list.appendChild(card);

    });

}

```javascript
async function addClass() {

    const input =
        document.getElementById("className");

    const name =
        input.value.trim();

    if(!name) return;

    await supabase
        .from("classes")
        .insert([
            {
                name: name
            }
        ]);

    await loadCloudData();

    renderClasses();
    populateDropdowns();
    updateDashboard();

    input.value = "";

}
```


    const input =
        document.getElementById(
            "className"
        );

    const name =
        input.value.trim();

    if(!name){
        return;
    }

    classes.push({

        id: generateId(),

        name: name

    });

    input.value = "";

    saveData();

    renderClasses();

    populateDropdowns();

    updateDashboard();

}

document
.getElementById(
    "addClassBtn"
)
.addEventListener(
    "click",
    addClass
);

function deleteClass(id) {

    if(
        !confirm(
            "Delete this class?"
        )
    ){
        return;
    }

    classes =
        classes.filter(
            c => c.id !== id
        );

    students.forEach(student => {

        student.classes =
            student.classes.filter(
                classId =>
                classId !== id
            );

    });

    behaviours =
        behaviours.filter(
            b => b.classId !== id
        );

    saveData();

    renderClasses();

    renderStudents();

    populateDropdowns();

    updateDashboard();

}

function assignClass(
    studentId
) {

    if(
        classes.length === 0
    ){
        alert(
            "Create a class first."
        );
        return;
    }

    const student =
        students.find(
            s => s.id === studentId
        );

    const options =
        classes.map(c =>
            `${c.id} - ${c.name}`
        ).join("\n");

    const chosen =
        prompt(
            "Enter Class ID:\n\n"
            + options
        );

    if(!chosen){
        return;
    }

    const classId =
        Number(chosen);

    const exists =
        classes.find(
            c => c.id === classId
        );

    if(!exists){
        alert(
            "Invalid Class ID"
        );
        return;
    }

    if(
        !student.classes.includes(
            classId
        )
    ){

        student.classes.push(
            classId
        );

    }

    saveData();

    renderStudents();

}

function populateDropdowns() {

    const studentSelect =
        document.getElementById(
            "behaviourStudent"
        );

    const classSelect =
        document.getElementById(
            "behaviourClass"
        );

    studentSelect.innerHTML = "";
    classSelect.innerHTML = "";

    students.forEach(student => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            student.id;

        option.textContent =
            student.name;

        studentSelect.appendChild(
            option
        );

    });

    classes.forEach(cls => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            cls.id;

        option.textContent =
            cls.name;

        classSelect.appendChild(
            option
        );

    });

}
```javascript
async function saveBehaviour() {

    const studentId =
        Number(
            document.getElementById(
                "behaviourStudent"
            ).value
        );

    const classId =
        Number(
            document.getElementById(
                "behaviourClass"
            ).value
        );

    const type =
        document.getElementById(
            "behaviourType"
        ).value;

    const description =
        document.getElementById(
            "behaviourDescription"
        ).value.trim();

    let points =
        Number(
            document.getElementById(
                "behaviourPoints"
            ).value
        );

    if(type === "negative") {
        points = -Math.abs(points);
    }

    await supabase
        .from("behaviours")
        .insert([
            {
                studentid: studentId,
                classid: classId,
                type: type,
                description: description,
                points: points
            }
        ]);

    await loadCloudData();

    updateDashboard();
    generateReport();

    document.getElementById(
        "behaviourDescription"
    ).value = "";

    alert("Behaviour saved.");

}
```


    if(
        students.length === 0
    ){
        alert(
            "No students found."
        );
        return;
    }

    if(
        classes.length === 0
    ){
        alert(
            "No classes found."
        );
        return;
    }

    const studentId =
        Number(
            document.getElementById(
                "behaviourStudent"
            ).value
        );

    const classId =
        Number(
            document.getElementById(
                "behaviourClass"
            ).value
        );

    const type =
        document.getElementById(
            "behaviourType"
        ).value;

    const description =
        document.getElementById(
            "behaviourDescription"
        ).value.trim();

    let points =
        Number(
            document.getElementById(
                "behaviourPoints"
            ).value
        );

    if(type === "negative"){

        points =
            -Math.abs(points);

    }

    behaviours.push({

        id: generateId(),

        studentId,

        classId,

        type,

        description,

        points,

        timestamp:
            new Date()
            .toISOString()

    });

    saveData();

    updateDashboard();

    document.getElementById(
        "behaviourDescription"
    ).value = "";

    alert(
        "Behaviour saved."
    );

}

document
.getElementById(
    "saveBehaviourBtn"
)
.addEventListener(
    "click",
    saveBehaviour
);

```javascript id="e8gk5m"
function generateReport() {

    const tbody =
        document.querySelector(
            "#reportTable tbody"
        );

    tbody.innerHTML = "";

    const period =
        document.getElementById(
            "reportPeriod"
        ).value;

    let filtered =
        [...behaviours];

    const now =
        new Date();

    if(period === "today"){

        filtered =
            filtered.filter(b => {

                const d =
                    new Date(
                        b.timestamp
                    );

                return (
                    d.toDateString()
                    ===
                    now.toDateString()
                );

            });

    }

    else if(period === "week"){

        const weekAgo =
            new Date();

        weekAgo.setDate(
            now.getDate() - 7
        );

        filtered =
            filtered.filter(b =>
                new Date(
                    b.timestamp
                ) >= weekAgo
            );

    }

    else if(period === "month"){

        const monthAgo =
            new Date();

        monthAgo.setMonth(
            now.getMonth() - 1
        );

        filtered =
            filtered.filter(b =>
                new Date(
                    b.timestamp
                ) >= monthAgo
            );

    }

    else if(period === "custom"){

        const from =
            document.getElementById(
                "fromDate"
            ).value;

        const to =
            document.getElementById(
                "toDate"
            ).value;

        if(from && to){

            const fromDate =
                new Date(from);

            const toDate =
                new Date(to);

            toDate.setHours(
                23,59,59,999
            );

            filtered =
                filtered.filter(b => {

                    const d =
                        new Date(
                            b.timestamp
                        );

                    return (
                        d >= fromDate
                        &&
                        d <= toDate
                    );

                });

        }

    }

    filtered
    .sort(
        (a,b) =>
        new Date(b.timestamp)
        -
        new Date(a.timestamp)
    )
    .forEach(record => {

        const student =
            students.find(
                s =>
                s.id ===
                record.studentId
            );

        const cls =
            classes.find(
                c =>
                c.id ===
                record.classId
            );

        const tr =
            document.createElement(
                "tr"
            );

        const date =
            new Date(
                record.timestamp
            );

        tr.innerHTML = `
            <td>
                ${date.toLocaleDateString()}
            </td>

            <td>
                ${date.toLocaleTimeString()}
            </td>

            <td>
                ${
                    student
                    ?
                    student.name
                    :
                    "Unknown"
                }
            </td>

            <td>
                ${
                    cls
                    ?
                    cls.name
                    :
                    "Unknown"
                }
            </td>

            <td>
                ${record.type}
            </td>

            <td>
                ${record.description}
            </td>

            <td class="${
                record.points >= 0
                ?
                "positive"
                :
                "negative"
            }">
                ${
                    record.points > 0
                    ? "+"
                    : ""
                }
                ${record.points}
            </td>
        `;

        tbody.appendChild(tr);

    });

}

document
.getElementById(
    "generateReportBtn"
)
.addEventListener(
    "click",
    generateReport
);

document
.getElementById(
    "printReportBtn"
)
.addEventListener(
    "click",
    () => window.print()
);

document
.getElementById(
    "reportPeriod"
)
.addEventListener(
    "change",
    function(){

        const custom =
            document.getElementById(
                "customDates"
            );

        if(
            this.value ===
            "custom"
        ){
            custom.style.display =
                "block";
        }
        else{
            custom.style.display =
                "none";
        }

    }
);

document
.querySelectorAll(
    ".tab-btn"
)
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            document
            .querySelectorAll(
                ".tab-btn"
            )
            .forEach(btn =>
                btn.classList.remove(
                    "active"
                )
            );

            document
            .querySelectorAll(
                ".tab"
            )
            .forEach(tab =>
                tab.classList.remove(
                    "active"
                )
            );

            button.classList.add(
                "active"
            );

            document
            .getElementById(
                button.dataset.tab
            )
            .classList.add(
                "active"
            );

        }
    );

});

function initialise() {

    renderStudents();

    renderClasses();

    populateDropdowns();

    updateDashboard();

    generateReport();

    document
    .getElementById(
        "customDates"
    )
    .style.display =
        "none";

}

async function initialise() {

    await loadCloudData();

    renderStudents();
    renderClasses();
    populateDropdowns();
    updateDashboard();
    generateReport();

    document
        .getElementById("customDates")
        .style.display = "none";

}

initialise();