
// Initialize Firebase
$(document).ready(function(){
  var config = {
    apiKey: "AIzaSyCXYmiPC33RnNfI8Y5wCuLeu424Y1gYyYU",
    authDomain: "fir-trainschedule-84f9d.firebaseapp.com",
    databaseURL: "https://fir-trainschedule-84f9d.firebaseio.com",
    projectId: "fir-trainschedule-84f9d",
    storageBucket: "fir-trainschedule-84f9d.appspot.com",
    messagingSenderId: "1029861737941"
  };
  // Initialize firebase configuration
  firebase.initializeApp(config);
  
  // Define firebase datbase
  var database = firebase.database();
  
  //Setting initial button names
  $("#enterTrainBtn").html("Add");
  $("#trainFirstStart").html("00:01 AM");
  //$("#deleteTrainBtn").css("display", "none");
  $("#updateTrainBtn").attr("disabled", "disabled");
  $("#deleteTrainBtn").attr("disabled", "disabled");

  
  // Enter new Train Data in to the database
  $('#enterTrainBtn').on("click", function(event) {
    event.preventDefault();
    $(".error").remove();
    // Take user input from Form
    var trainNum = $("#trainNum").val().trim();
    var trainName = $("#trainName").val().trim();
    var destination = $("#trainDestination").val().trim();
    var firstTrain = moment($("#trainFirstStart").val().trim());
    var frequency = $("#trainFrequency").val().trim();
    console.log("First Train2 = " + firstTrain);
    console.log("First Train1 = " + firstTrain);
    var firstTrain = moment($("#trainFirstStart").val().trim(), "HH:mm").format("HH:mm");
    if ((trainNum === "") || (trainName === "") || (destination === "") || (firstTrain === "") || (frequency === "")){
      $("#validateMessage").html("Incorrect Time format!!!");
      event.preventDefault();
    }

    // Converting to Title cases
    trainNum = toTitleCase(trainNum);
    trainName = toTitleCase(trainName);
    destination = toTitleCase(destination);

    // Creating local temporary object to hold train data
    var newTrain = {
        num: trainNum,
        name: trainName,
        place: destination,
        ftrain: firstTrain,
        freq: frequency,
        dateadded: firebase.database.ServerValue.TIMESTAMP
      }
      // uploads train data to the database
    database.ref().push(newTrain);
    var rootRef = database.ref();
    console.log("New Train= " + newTrain.name);
    console.log("DB ref=" + rootRef.toString());
    // clears all the text-boxes
    $("#trainNum").val("");
    $("#trainName").val("");
    $("#trainDestination").val("");
    $("#trainFirstStart").val("00:01 AM");
    $("#trainFrequency").val("");
    return false;
  });
  
  
  //  Created a firebase event listner for adding trains to database and a row in the html when the user adds an entry
  database.ref().on("child_added", function(childSnapshot) {
    console.log("Child Snapshot = " + childSnapshot.val());
    // Now we store the childSnapshot values into a variable
    var trainNum = childSnapshot.val().num;
    var trainName = childSnapshot.val().name;
    var destination = childSnapshot.val().place;
    var firstTrain = childSnapshot.val().ftrain;
    var frequency = childSnapshot.val().freq;

    // First Train time input cis converted to Time format.  
    var firstTimeConverted = moment(firstTrain, "HH:mm");
    var currentTime = moment().format("HH:mm");

    // Calculate the difference between currentTime and First Train Time in minutes.
    var timeDiff = moment().diff(moment(firstTimeConverted), "minutes");

    // Find Remainder of the time left after deviding the difference with frequency
    var timeRemainder = timeDiff % frequency;

    // The remainder should be added to current time (or subtract from frequency) to get the time till next time relative to currenttrain,we store it in a variable
    var minToTrain = frequency - timeRemainder;

    //console.log("Remainder=" + timeRemainder + " Frequency=" + frequency + " Minute To Train=" + minToTrain);
    //minToTrain = minToTrain.format("HH:mm");
    // Formatting time to next train in minutes
    var nxTrain = moment().add(minToTrain, "minutes").format("HH:mm");
    //var minToTrain = moment().add(timeRemainder, "minutes").format("HH:mm");

    // Dynamically creating a table
    $("#trainTable>tbody").append("<tr><td class='tnum1'>" + trainNum + "</td><td class='tname1'>" + trainName + "</td><td class='tdest1'>" + destination + "</td><td class='tfreq1'>" + frequency + "</td><td class='tarr1'>" + nxTrain + "</td><td>" + minToTrain + "</td></tr>");
     $("#trainTable>tbody").attr({"class": "tablebody "});
  });
  
 
  // Table row selection
  $(document).click(function(){
    $("#trainTable tbody tr").on("click",function(event){
      event.preventDefault();
      var tableRowData = $(this).children("td").map(function(){
        return $(this).text();
      }).get();
  
      $("#trainNum").val(tableRowData[0]);
      $("#trainName").val(tableRowData[1]);
      $("#trainDestination").val(tableRowData[2]);
      //$("#trainFirstStart").val(tableRowData[3]);
      $("#trainFrequency").val(tableRowData[3]);
      $("#operation").text("Maintain Train Details");
      $("#enterTrainBtn").html("Add");
      $("#trainNum").attr("disabled", "disabled");
      $("#enterTrainBtn").attr("disabled", "disabled");
      $("#updateTrainBtn").prop("disabled", false);
      $("#deleteTrainBtn").prop("disabled", false);
      //$("#deleteTrainBtn").css("display", "block");
    });
  });
  
  //Clear Form data
  $("#clearTrainBtn").on("click",function(){
    // clears all the text-boxes
    $("#trainNum").val("");
    $("#trainName").val("");
    $("#trainDestination").val("");
    $("#trainFirstStart").val("00:01 AM");
    $("#trainFrequency").val("");
    $("#enterTrainBtn").html("Add");
    $("#trainNum").prop("disabled", false);
    $("#enterTrainBtn").prop("disabled", false);
    $("#updateTrainBtn").attr("disabled", "disabled");
    $("#deleteTrainBtn").attr("disabled", "disabled");
    $("#operation").text("Add Train Details");
    //$("#deleteTrainBtn").css("display", "none");
  });
  
  // Converting to Title case
  function toTitleCase(str){

    if (str != ""){
      var word = str.split(" ");
      for (var i=0; i < word.length; i++){
        word[i] = word[i].split('');
        word[i][0] = word[i][0].toUpperCase(); 
        word[i] = word[i].join('');
    }
    return word.join(' ');
    }
  }

  
});

  function validateForm(f1, f2, f3, f4, f5){
    var firstTrain = $("#trainFirstStart").val().trim();
    var firstTrain = moment($("#trainFirstStart").val().trim(), "HH:mm").format("HH:mm");
    console.log("Validate TIme=" + firstTrain);
    if (isNaN(firstTrain) || firstTrain === ""){
      console.log ("Incorrect Time. 00:00 AM/PM format");
      return false;
    }
    return true;
  }

  function formatTime(evt, fld){
    var key = window.event ? event.keyCode : event.which; 
    console.log ("Key Code=" + key);
    if (key === 8 || key === 16 || key === 37 || key === 39 || key ===46){
      return true;
    }
    else{
      if (key >= 48 && key <= 57){
        var fldLength = fld.value.length;
        console.log("Fields Value = " + fld.value + " " + fldLength);
        if (fldLength === 2 || fldLength === 2){
          fld.value = fld.value + ":";
          return true;
        }
        return true;
      }
      else {
        return false;
      }
    }
  };


  function formatTNum(evt, fld){
    var key = window.event ? event.keyCode : event.which; 
    var chr = String.fromCharCode(key);
    var vld = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

    if (vld.indexOf(chr) >= 0){
      return true;
    }
    else{
      var fldLength = fld.value.length;
      fld.value = fld.value.substring(0, fldLength-1);
      return false;
    }
  };
    
  
  





















