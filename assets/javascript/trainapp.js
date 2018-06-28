
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
  $("#trainFirstStart").html("hh:mm");
  
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
    // clears all the text-boxes
    $("#trainNum").val("");
    $("#trainName").val("");
    $("#trainDestination").val("");
    $("#trainFirstStart").val("");
    $("#trainFrequency").val("");
    return false;
  });
  
  
  //  Created a firebase event listner for adding trains to database and a row in the html when the user adds an entry
  database.ref().on("child_added", function(childSnapshot) {

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
    if (isNaN(firstTrain) || firstTrain === ""){
      return false;
    }
    return true;
  }

  // HTML Input Type="time" was not yielding military format. Therefore following function was required to format text input for military time
  function formatTime(evt, fld){
    var key = window.event ? event.keyCode : event.which; 
    if (key === 8 || key === 16 || key === 37 || key === 39 || key ===46){
      return true;
    }
    else{
      if (key >= 48 && key <= 57){
        var fldLength = fld.value.length;
        if (fldLength ===2){
          var firsttwo = fld.value.substr(0,2);
          var firstone = fld.value.substr(0,1);
          if (parseInt(firstone) > 2){
            fld.value = "0" + firsttwo.substr(0,1);
          }
        }
        if (fldLength >= 3){
          var firstthree = fld.value;
          if (firstthree.substr(2,1) != ":"){
            firstthree = firstthree.substr(0,2) + ":";
            fld.value = firstthree;

          }
        }
        if (fldLength === 4){
          var firstfour = fld.value;
          if (parseInt(firstfour.substr(3,1)) > 5){
            firstfour = firstfour.substr(0,3) + "";
            fld.value = firstfour;
          }
        }
        if (fldLength === 5){
          var firstfive = fld.value;
          if ((parseInt(firstfive.substr(0,2)) === 24) && (parseInt(firstfive.substr(3,2)) > 0)){
            firstfive = "";
            fld.value = firstfive;
          }
        }
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
    var vld = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    var chr = fld.value;
    console.log("key=" + key + "-" + "chr=" + chr + " Indx=" + vld.indexOf(chr));
    if (key === 8 || key === 16 || key === 37 || key === 39 || key ===46){
      return true;
    }
    else{
      if ((key >= 48 && key <= 57) || (key >= 65 && key <= 90)){
        return true;
      }
      else{
        var fldLength = fld.value.length;
        fld.value = fld.value.substring(0, fldLength-1);
        return false;
      }
    }
};
    
  
  





















