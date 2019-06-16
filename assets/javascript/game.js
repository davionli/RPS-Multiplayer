var firebaseConfig = {
    apiKey: "AIzaSyCxonlCD3d4jUHIkDmeuzcSCjt347byiWs",
    authDomain: "prs-online.firebaseapp.com",
    databaseURL: "https://prs-online.firebaseio.com",
    projectId: "prs-online",
    storageBucket: "prs-online.appspot.com",
    messagingSenderId: "282025357587",
    appId: "1:282025357587:web:0f3c8711116e7da4"
};
const rpsTable = [[0, 1, -1],
                  [-1, 0, 1],
                  [1, -1, 0]];
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
var playerActivationRef = database.ref("/playerActivation");
var playerOneRef = database.ref("/playerOne");
var playerTwoRef = database.ref("/playerTwo");
var playerOneDecisionRef = database.ref("/playerOne/decision");
var playerTwoDecisionRef = database.ref("/playerTwo/decision");
var playerNumber;
var playerOneUsername;
var playerTwoUsername;
var playerOneConfirm;
var playerTwoConfirm;
var playerOneDecision = null;
var playerTwoDecision = null;
var userKey;

function checkOneActivate() {
    playerOneRef.once("value").then(function(snapshot) {
        if (snapshot.exists()) {
            var oneKey = snapshot.child("key").val();
            connectionsRef.once("value").then(function(ssnapshot) {
                if (!ssnapshot.child(oneKey).exists()) {
                    playerActivationRef.child("isPlayerOneActivated").set(false);
                    playerOneRef.remove();
                }
            })
        }
        
    });
}
function checkTwoActivate() {
    playerTwoRef.once("value").then(function(snapshot) {
        if (snapshot.exists()) {
            var twoKey = snapshot.child("key").val();
            connectionsRef.once("value").then(function(ssnapshot) {
                if (!ssnapshot.child(twoKey).exists()) {
                    playerActivationRef.child("isPlayerTwoActivated").set(false);
                    playerTwoRef.remove();
                }
            })
        }
        
    });
}

function generatePlayer(player) {
    // paper btn
    var paperButton = $("<div>");
    paperButton.attr("id", `paper${player}`);
    paperButton.attr("data-index", "0");
    paperButton.attr("class", "icon");
    paperButton.text("paper");
    // rock btn
    var rockButton = $("<div>");
    rockButton.attr("id", `rock${player}`);
    rockButton.attr("data-index", "1");
    rockButton.attr("class", "icon");
    rockButton.text("rock");
    // scissors btn
    var scissorsButton = $("<div>");
    scissorsButton.attr("id", `scissors${player}`);
    scissorsButton.attr("data-index", "2");
    scissorsButton.attr("class", "icon");
    scissorsButton.text("scissors");
    // confirm btn
    var confirmButton = $("<div>");
    confirmButton.attr("id", `confirm${player}`);
    confirmButton.text("confirm");
    $(`#player${player}`).append(paperButton);
    $(`#player${player}`).append(rockButton);
    $(`#player${player}`).append(scissorsButton);
    $(`#player${player}`).append(confirmButton);
    playerOneConfirm = false;
}


function judge() {
    var playerOneChoose;
    var playerTwoChoose;
    var playerOneScores;
    var playerTwoScores;
    playerOneRef.once("value").then(function(snapshot) {
        playerOneChoose = parseInt(snapshot.child("decision").val()); 
        playerOneScores = parseInt(snapshot.child("score").val());
        playerTwoRef.once("value").then(function(snapshot) {
            playerTwoChoose = parseInt(snapshot.child("decision").val()); 
            playerTwoScores = parseInt(snapshot.child("score").val());
            // update win/lose
            playerOneRef.child("status").set(rpsTable[playerOneChoose][playerTwoChoose]);
            playerTwoRef.child("status").set(rpsTable[playerTwoChoose][playerOneChoose]);
            // update scores
            playerOneRef.child("score").set(playerOneScores + rpsTable[playerOneChoose][playerTwoChoose]);
            playerTwoRef.child("score").set(playerTwoScores + rpsTable[playerTwoChoose][playerOneChoose]);
            // reset player ready
            playerOneRef.child("ready").set(false);
            playerTwoRef.child("ready").set(false);
            // reset player confirm to false
            playerOneConfirm = false;
            playerTwoConfirm = false;
            // reset player decision to null
            playerOneDecision = null;
            playerTwoDecision = null;

        });
    });
}

// playerOne make decision
$("#playerOne").on("click", ".icon", function() {
    if (!playerOneConfirm) {
        if (playerOneDecision!==null) {
            playerOneDecision.css("border-color", "black");
            playerOneDecision = $(this);
            $(this).css("border-color", "red");
        } else {
            playerOneDecision = $(this);
            $(this).css("border-color", "red");
        }
    }
});
$("#playerOne").on("click", "#confirmOne", function() {
    if (playerOneDecision !== null) {
        playerOneConfirm = true;
        playerOneDecision.css("border-color", "black");
        playerOneRef.child("decision").set(playerOneDecision.attr("data-index"));
        playerOneRef.child("ready").set(playerOneConfirm);
        playerTwoRef.once("value").then(function(snapshot) {
            if (snapshot.child("ready").val()) {
                judge();
            }
            else {
                alert("player two not ready");
            }
        });
    }
});

// playerTwo make decision
$("#playerTwo").on("click", ".icon", function() {
    if (!playerTwoConfirm) {
        if (playerTwoDecision!==null) {
            playerTwoDecision.css("border-color", "black");
            playerTwoDecision = $(this);
            $(this).css("border-color", "red");
        } else {
            playerTwoDecision = $(this);
            $(this).css("border-color", "red");
        }
    }
});
$("#playerTwo").on("click", "#confirmTwo", function() {
    if (playerTwoDecision !== null) {
        playerTwoConfirm = true;
        playerTwoDecision.css("border-color", "black");
        playerTwoRef.child("decision").set(playerTwoDecision.attr("data-index"));
        playerTwoRef.child("ready").set(playerTwoConfirm);
        playerOneRef.once("value").then(function(snapshot) {
            if (snapshot.child("ready").val()) {
                judge();
            }
            else {
                alert("player one not ready");
            }
        });
    }
});







connectedRef.on("value", function(snap) {
    // If they are connected..
    if (snap.val()) {
  
        // Add user to the connections list.
        userKey = connectionsRef.push().key;
        var con = connectionsRef.child(userKey);
        con.set(true);
  
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
        // If player One or Two quit, delete them
        checkOneActivate();
        checkTwoActivate();

    }
});

$("#submit-username").on("click", function() {
    // playerNumber++;
    // check if the two players already exist
    playerActivationRef.once("value").then(function(snapshot) {

        if (!snapshot.val().isPlayerOneActivated || !snapshot.val().isPlayerTwoActivated) {
            // if player one doesn't exist
            if (!snapshot.val().isPlayerOneActivated) {
                //1. update player one exist tag
                playerActivationRef.child("isPlayerOneActivated").set(true);
                //2. save the username 
                playerOneRef.set({
                    username: $("#playerSignIn").val(),
                    key: userKey,
                    score: 0,
                    status: 0,
                    ready: false
                })
                //3. delete sign in box
                $(".signIn").remove();
                //4. generate the game for this user
                generatePlayer("One");
            } else {
                if (!snapshot.val().isPlayerTwoActivated) {
                    //1. update player one exist tag
                    playerActivationRef.child("isPlayerTwoActivated").set(true);
                    //2. save the username 
                    playerTwoRef.set({
                        username: $("#playerSignIn").val(),
                        key: userKey,
                        score: 0,
                        status: 0,
                        ready: false
                    })
                    //3. delete sign in box
                    $(".signIn").remove();
                    //4. generate the game for this user
                    generatePlayer("Two");
                } 
            }
        } 
        else {
            alert("full");
        }

    })

})