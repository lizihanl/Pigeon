function sayHello() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            // Do something for the user here.
            console.log(user.uid);
            db.collection("users")
                .doc(user.uid)
                .get()
                .then(function (doc) {
                    var n = doc.data().name;
                    console.log(n);
                    //$("#username").text(n);
                    document.getElementById("username").innerText = n;
                });
        } else {
            // No user is signed in.
            //console.log("not signed in")
        }
    });
}

// The function where it will be called when the web is loaded
window.onload = () => {
    const checkInput = document.querySelector("#todo-input");
    const inputSumbitBtn = document.querySelector("#submit-button");
    const todos = document.querySelector("#todos");
    const removeCheckedBtn = document.querySelector("#removeAllChecked");
    const removeAll = document.querySelector("#removeAll");

    // todo related data store
    let inputValue;
    let todoListData = [];

    // let todo = [];

    function databaseTask() {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                db.collection("users")
                    .doc(user.uid)
                    .collection("reminders")
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            todoListData.push(doc.data().task);
                        });
                        if (todoListData === undefined || todoListData == 0) {
                            console.log("no task yet");
                            todoListData = todoListData.filter(function (element) {
                                return element !== undefined;
                            });
                        } else {
                            todoListData = todoListData.filter(function (element) {
                                return element !== undefined;
                            });
                            console.log(todoListData);
                            makeList(todos, todoListData);
                            let todo = document.querySelectorAll(".todo");
                            todoClickEvent(todo, todoListData);
                            //console.log("it worked");
                        }
                    });
            }
        });
    }
    databaseTask();

    // the add function, user can either click or press enter to add the data.
    checkInput.addEventListener("keyup", function (event) {
        if (event.code == "Enter") {
            inputSumbitBtn.onclick();
        } else {
            inputValue = this.value;
        }
    });

    //When the reminder is created and it is not empty, it will add the data to the firestore.
    inputSumbitBtn.onclick = function () {
        if (inputValue == undefined || inputValue.trim() == "") {
            alert("ERROR, Cannot enter the task blank!");
        } else {
            console.log(inputValue);
            firebase.auth().onAuthStateChanged(function (user) {
                console.log(user.uid);
                db.collection("users").doc(user.uid).collection("reminders").add({
                    task: inputValue,
                });
            });
            todoListData.push(inputValue);
            checkInput.value = "";
            makeList(todos, todoListData);
            let todo = document.querySelectorAll(".todo");
            todoClickEvent(todo, todoListData);
        }
    };

    // function of removing only checked off reminders. It will remove data from firestore as well.
    removeCheckedBtn.addEventListener("click", function () {
        //console.log(todoListData);
        let allTodos = document.querySelectorAll(".todo");
        for (let i = 0; i < todoListData.length; i++) {
            if (allTodos[i].classList.value.indexOf("checked") > -1) {
                allTodos[i].remove();
            }
            firebase.auth().onAuthStateChanged(function (user) {
                db.collection("users")
                    .doc(user.uid)
                    .collection("reminders")
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            if (!todoListData.includes(doc.data().task)) {
                                doc.ref.delete();
                            }
                        });
                    });
            });
        }

        todoListData = [];
        const aliveTodos = document.querySelectorAll(".todo");

        for (let setData of aliveTodos) {
            todoListData.push(setData.childNodes[3].innerHTML);
        }
    });

    // Removing all tasks from web app. Removes the data from firestore as well.
    removeAll.onclick = function () {
        let allTodos = document.querySelectorAll(".todo");
        for (let i = 0; i < todoListData.length; i++) {
            allTodos[i].remove();
        }
        todoListData = [];
        firebase.auth().onAuthStateChanged(function (user) {
            db.collection("users")
                .doc(user.uid)
                .collection("reminders")
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        doc.ref.delete();
                    });
                });
        });
    };

    // Creation of list template. Creating list html when the function is called.
    function makeList(target, data) {
        let targetChild = document.querySelectorAll(".todo");
        for (let child of targetChild) {
            target.removeChild(child);
        }

        for (let i = 0; i < data.length; i++) {
            let template = `<li class="todo list-group-item col-xs-12" style="width:100%">
      <input type="checkbox" class="checkbox-inline" style="margin:0;">
      <b>${data[i]}</b>
      <span class="delete">Remove</span>
      <span class="edit">Edit</span>
      </li>`;
            target.innerHTML += template;
        }
    }

    // The style changed after the check boxes are clicked.
    function todoClickEvent(target, data) {
        for (let i = 0; i < target.length; i++) {
            // console.log(target[i].childNodes)
            //Style change if the check box is clicked or not.
            target[i].childNodes[1].addEventListener("click", function () {
                if (this.parentNode.classList.value.indexOf("checked") >= 0) {
                    this.parentNode.classList.remove("checked");
                    this.parentNode.style.color = "#000";
                    this.parentNode.style.textDecoration = "none";
                } else {
                    this.parentNode.classList.add("checked");
                    this.parentNode.style.color = "red";
                    this.parentNode.style.textDecoration = "line-through";
                    const ding = new Audio("./audio/ding.wav");
                    ding.play();
                }
            });

            // Reminder delete function, Could not update the firestore...
            target[i].childNodes[5].addEventListener("click", function () {
                this.parentNode.remove();
                data.splice(i, 1);
                target = document.querySelectorAll(".todo");

                //     firebase.auth().onAuthStateChanged(function (user) {
                //         db.collection("users")
                //             .doc(user.uid)
                //             .collection("reminders")
                //             .get()
                //             .then(function (querySnapshot) {
                //                 querySnapshot.forEach(function (doc) {
                //                     if (doc.data().task == todoListData[i]) {
                //                         doc.ref.delete();
                //                     }
                //                 });
                //             });
                //     });
            });

            // Reminder Edit function, the data is updated in the firestore as well.
            target[i].childNodes[7].addEventListener("click", function () {
                var prompt = window.prompt("Please input your edited task.");
                if (prompt.length > 0) {
                    this.parentNode.childNodes[3].innerHTML = prompt;
                    //data[i] = prompt;

                    firebase.auth().onAuthStateChanged(function (user) {
                        db.collection("users")
                            .doc(user.uid)
                            .collection("reminders")
                            .get()
                            .then(function (querySnapshot) {
                                querySnapshot.forEach(function (doc) {
                                    if (doc.data().task == todoListData[i]) {
                                        todoListData.push(doc.ref.update({ task: prompt }));
                                    }
                                });
                            });
                    });
                }
            });
        }
    }

    //   var currentUser;
    //   var userReminders;

    //   // This function populates user info for settings page.
    //   function populateInfo() {
    //     firebase.auth().onAuthStateChanged((user) => {
    //       // Check if user is signed in:
    //       if (user) {
    //         //go to the correct user document by referencing to the user uid
    //         currentUser = db.collection("users").doc(user.uid);
    //         userReminders = db.collection("reminders").doc(user.uid);
    //         console.log(userReminders);
    //         //get the document for current user.
    //         currentUser.get().then((userDoc) => {
    //           //get the data fields of the user
    //           var userName = userDoc.data().name;
    //           var userWork = userDoc.data().work;

    //           //if the data fields are not empty, then write them in to the form.
    //           if (userName != null) {
    //             document.getElementById("nameInput").value = userName;
    //           }
    //           if (userWork != null) {
    //             document.getElementById("workInput").value = userWork;
    //           }
    //         });
    //       } else {
    //         console.log("no user logged in.");
    //       }
    //     });
    //   }
    //   // populateInfo();

    //   function editUserInfo() {
    //     //Enable the form fields
    //     document.getElementById("personalInfoFields").disabled = false;
    //   }

    //   function saveUserInfo() {
    //     userName = document.getElementById("nameInput").value;
    //     userWork = document.getElementById("workInput").value;

    //     currentUser
    //       .update({
    //         name: userName,
    //         work: userWork,
    //       })
    //       .then(() => {
    //         console.log("Document successfully updated!");
    //       });

    //     //Enable the form fields
    //     document.getElementById("personalInfoFields").disabled = true;
    //   }
};
