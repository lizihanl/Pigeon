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
        }
    });
}
//sayHello();

var currentUser;
var userReminders;

// This function populates user info for settings page.
function populateInfo() {
    firebase.auth().onAuthStateChanged((user) => {
        // Check if user is signed in:
        if (user) {
            //go to the correct user document by referencing to the user uid
            currentUser = db.collection("users").doc(user.uid);
            //get the document for current user.
            currentUser.get().then((userDoc) => {
                //get the data fields of the user
                var userName = userDoc.data().name;
                var userWork = userDoc.data().work;

                //if the data fields are not empty, then write them in to the form.
                if (userName != null) {
                    document.getElementById("nameInput").value = userName;
                }
                if (userWork != null) {
                    document.getElementById("workInput").value = userWork;
                }
            });
        } else {
            console.log("no user logged in.");
        }
    });
}
// populateInfo();

function editUserInfo() {
    //Enable the form fields
    document.getElementById("personalInfoFields").disabled = false;
}

function saveUserInfo() {
    userName = document.getElementById("nameInput").value;
    userWork = document.getElementById("workInput").value;

    currentUser
        .update({
            name: userName,
            work: userWork,
        })
        .then(() => {
            console.log(userWork);
            console.log("Document successfully updated!");
        });

    //Enable the form fields
    document.getElementById("personalInfoFields").disabled = true;
}
