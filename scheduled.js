import "./utils/consts.js";

function formatDateLong(date) {
  try {
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + " " + monthNames[monthIndex] + ", " + year;
  } catch (e) {
    return "Err";
    function populateScheduledTable() {
      chrome.storage.local.get("favorites", function (result) {
        var favorites = result.favorites;
        if (!Array.isArray(favorites)) {
          // for safety only
          favorites = [];
        }
        chrome.storage.local.get("scheduled", function (result) {
          var scheduled = result.scheduled;
          if (!Array.isArray(scheduled)) {
            // for safety only
            scheduled = [];
          }

          if (scheduled.length < 1)
            $("#scheduledTable").html(
              "<tr><td colspan='5' style='text-align: center;'>Nothing has been scheduled yet!</td></tr>"
            );
          else $("#scheduledTable").html("");

          for (var i = 0; i < scheduled.length; i++) {
            var repeat = "Never";
            if (scheduled[i].repeat == 1) repeat = "Every Minute";
            if (scheduled[i].repeat == 5) repeat = "Every 5 Minutes";
            if (scheduled[i].repeat == 15) repeat = "Every 15 Minutes";
            if (scheduled[i].repeat == 30) repeat = "Every 30 Minutes";
            if (scheduled[i].repeat == 60) repeat = "Every Hour";
            if (scheduled[i].repeat == 240) repeat = "Every 4 Hours";
            if (scheduled[i].repeat == 1440) repeat = "Every 24 Hours";

            var workflowname =
              "<a href='/workfloweditor.html'>Current Workflow</a>";
            if (scheduled[i].workflow > -1)
              workflowname = favorites[scheduled[i].workflow].name;

            var monthNames = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ];
            var schDate = new Date(scheduled[i].date);
            schDate =
              monthNames[schDate.getMonth()] +
              " " +
              schDate.getDate() +
              ", " +
              schDate.getFullYear() +
              " @ " +
              (((schDate.getHours() + 11) % 12) + 1) +
              ":" +
              (schDate.getMinutes() > 9
                ? schDate.getMinutes()
                : "0" + schDate.getMinutes()) +
              " " +
              (schDate.getHours() >= 12 ? "PM" : "AM");

            if (
              scheduled[i].sunday === false ||
              scheduled[i].monday === false ||
              scheduled[i].tuesday === false ||
              scheduled[i].wednesday === false ||
              scheduled[i].thursday === false ||
              scheduled[i].friday === false ||
              scheduled[i].saturday === false
            ) {
              var runOnDays = [];
              if (scheduled[i].sunday) runOnDays.push("Sunday");
              if (scheduled[i].monday) runOnDays.push("Monday");
              if (scheduled[i].tuesday) runOnDays.push("Tuesday");
              if (scheduled[i].wednesday) runOnDays.push("Wednesday");
              if (scheduled[i].thursday) runOnDays.push("Thursday");
              if (scheduled[i].friday) runOnDays.push("Friday");
              if (scheduled[i].saturday) runOnDays.push("Saturday");

              schDate +=
                ' <span class="hint-circle grey" data-toggle="tooltip" data-placement="top" title="" data-original-title="Only run on ' +
                runOnDays.join(", ") +
                '">?</span>';
            }

            var innerHTML =
              '<tr id="scheduledRow' +
              (i + 1) +
              '">' +
              "    <td>" +
              workflowname +
              "</td>" +
              "    <td>" +
              schDate +
              "</td>" +
              "    <td>" +
              repeat +
              "</td>" +
              "    <td>Local Machine</td>" +
              "    <td>" +
              '        <a href="#" id="deleteschedule' +
              (i + 1) +
              '">Delete</a>' +
              "    </td>" +
              "</tr>";

            $("#scheduledTable").append(innerHTML);
            $("#deleteschedule" + (i + 1)).click(i, function (evt) {
              swal(
                {
                  title: "Are you sure?",
                  text: "This schedule will be deleted.",
                  type: "warning",
                  showCancelButton: true,
                  cancelButtonClass: "btn-default",
                  confirmButtonClass: "btn-danger",
                  confirmButtonText: "Delete",
                  closeOnConfirm: true,
                },
                function (resp) {
                  if (!resp) return;
                  chrome.storage.local.get("scheduled", function (result) {
                    var scheduled = result.scheduled;
                    scheduled.splice(evt.data, 1);
                    chrome.storage.local.set(
                      { scheduled: scheduled },
                      function () {
                        populateScheduledTable();
                        calculateUsage();
                      }
                    );
                  });
                }
              );
            });
          }
        });
      });
    }
  }
}

function formatDate(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return formatDateLong(date);
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days ago";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours ago";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 2) {
    return interval + " minutes ago";
  }
  if (interval > 0.85) {
    return "a minute ago";
  }
  return "just now";
}

$(".datetimepicker-1").datetimepicker({
  widgetPositioning: {
    horizontal: "right",
  },
  debug: false,
});

function populateScheduledTable() {
  chrome.storage.local.get("favorites", function (result) {
    var favorites = result.favorites;
    if (!Array.isArray(favorites)) {
      // for safety only
      favorites = [];
    }
    chrome.storage.local.get("scheduled", function (result) {
      var scheduled = result.scheduled;
      if (!Array.isArray(scheduled)) {
        // for safety only
        scheduled = [];
      }

      if (scheduled.length < 1)
        $("#scheduledTable").html(
          "<tr><td colspan='5' style='text-align: center;'>Nothing has been scheduled yet!</td></tr>"
        );
      else $("#scheduledTable").html("");

      for (var i = 0; i < scheduled.length; i++) {
        var repeat = "Never";
        if (scheduled[i].repeat == 1) repeat = "Every Minute";
        if (scheduled[i].repeat == 5) repeat = "Every 5 Minutes";
        if (scheduled[i].repeat == 15) repeat = "Every 15 Minutes";
        if (scheduled[i].repeat == 30) repeat = "Every 30 Minutes";
        if (scheduled[i].repeat == 60) repeat = "Every Hour";
        if (scheduled[i].repeat == 240) repeat = "Every 4 Hours";
        if (scheduled[i].repeat == 1440) repeat = "Every 24 Hours";

        var workflowname =
          "<a href='/workfloweditor.html'>Current Workflow</a>";
        if (scheduled[i].workflow > -1)
          workflowname = favorites[scheduled[i].workflow].name;

        var monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        var schDate = new Date(scheduled[i].date);
        schDate =
          monthNames[schDate.getMonth()] +
          " " +
          schDate.getDate() +
          ", " +
          schDate.getFullYear() +
          " @ " +
          (((schDate.getHours() + 11) % 12) + 1) +
          ":" +
          (schDate.getMinutes() > 9
            ? schDate.getMinutes()
            : "0" + schDate.getMinutes()) +
          " " +
          (schDate.getHours() >= 12 ? "PM" : "AM");

        if (
          scheduled[i].sunday === false ||
          scheduled[i].monday === false ||
          scheduled[i].tuesday === false ||
          scheduled[i].wednesday === false ||
          scheduled[i].thursday === false ||
          scheduled[i].friday === false ||
          scheduled[i].saturday === false
        ) {
          var runOnDays = [];
          if (scheduled[i].sunday) runOnDays.push("Sunday");
          if (scheduled[i].monday) runOnDays.push("Monday");
          if (scheduled[i].tuesday) runOnDays.push("Tuesday");
          if (scheduled[i].wednesday) runOnDays.push("Wednesday");
          if (scheduled[i].thursday) runOnDays.push("Thursday");
          if (scheduled[i].friday) runOnDays.push("Friday");
          if (scheduled[i].saturday) runOnDays.push("Saturday");

          schDate +=
            ' <span class="hint-circle grey" data-toggle="tooltip" data-placement="top" title="" data-original-title="Only run on ' +
            runOnDays.join(", ") +
            '">?</span>';
        }

        var innerHTML =
          '<tr id="scheduledRow' +
          (i + 1) +
          '">' +
          "    <td>" +
          workflowname +
          "</td>" +
          "    <td>" +
          schDate +
          "</td>" +
          "    <td>" +
          repeat +
          "</td>" +
          "    <td>Local Machine</td>" +
          "    <td>" +
          '        <a href="#" id="deleteschedule' +
          (i + 1) +
          '">Delete</a>' +
          "    </td>" +
          "</tr>";

        $("#scheduledTable").append(innerHTML);
        $("#deleteschedule" + (i + 1)).click(i, function (evt) {
          swal(
            {
              title: "Are you sure?",
              text: "This schedule will be deleted.",
              type: "warning",
              showCancelButton: true,
              cancelButtonClass: "btn-default",
              confirmButtonClass: "btn-danger",
              confirmButtonText: "Delete",
              closeOnConfirm: true,
            },
            function (resp) {
              if (!resp) return;
              chrome.storage.local.get("scheduled", function (result) {
                var scheduled = result.scheduled;
                scheduled.splice(evt.data, 1);
                chrome.storage.local.set({ scheduled: scheduled }, function () {
                  populateScheduledTable();
                  calculateUsage();
                });
              });
            }
          );
        });
      }
    });
  });
}

populateScheduledTable();

$("#addScheduledSim").click(function () {
  $("#sundaySchedule").attr("checked", "");
  $("#sundaySchedule").parent().addClass("active");
  $("#mondaySchedule").attr("checked", "");
  $("#mondaySchedule").parent().addClass("active");
  $("#tuesdaySchedule").attr("checked", "");
  $("#tuesdaySchedule").parent().addClass("active");
  $("#wednesdaySchedule").attr("checked", "");
  $("#wednesdaySchedule").parent().addClass("active");
  $("#thursdaySchedule").attr("checked", "");
  $("#thursdaySchedule").parent().addClass("active");
  $("#fridaySchedule").attr("checked", "");
  $("#fridaySchedule").parent().addClass("active");
  $("#saturdaySchedule").attr("checked", "");
  $("#saturdaySchedule").parent().addClass("active");
});

$("#addScheduleSubmitButton").click(function () {
  if ($("#scheduleDateTime").val() == "") {
    swal("Error", "You must set the Date / Time of Simulation field", "error");
    return;
  }

  // TODO - Validate this
  var date_split_1 = $("#scheduleDateTime").val().split(" ");
  var date_split_2 = date_split_1[0].split("/");
  var date_split_3 = date_split_1[1].split(":");
  var hours = date_split_3[0] % 12;
  if (date_split_1[2] == "PM") hours += 12;
  var date = new Date(
    parseInt(date_split_2[2]),
    parseInt(date_split_2[0]) - 1,
    parseInt(date_split_2[1]),
    parseInt(hours),
    parseInt(date_split_3[1])
  );

  chrome.storage.local.get("scheduled", function (result) {
    var scheduled = result.scheduled;
    if (!Array.isArray(scheduled)) {
      // for safety only
      scheduled = [];
    }

    scheduled.push({
      workflow: $("#scheduleWorkflow").val(),
      date: date.getTime(),
      repeat: $("#scheduleRepeat").val(),
      created: Date.now(),
      sunday: $("#sundaySchedule").prop("checked"),
      monday: $("#mondaySchedule").prop("checked"),
      tuesday: $("#tuesdaySchedule").prop("checked"),
      wednesday: $("#wednesdaySchedule").prop("checked"),
      thursday: $("#thursdaySchedule").prop("checked"),
      friday: $("#fridaySchedule").prop("checked"),
      saturday: $("#saturdaySchedule").prop("checked"),
    });
    chrome.storage.local.set({ scheduled: scheduled }, function () {
      $("#scheduleWorkflow").val("-1");
      $("#scheduleDateTime").val("");
      $("#scheduleRepeat").val("0");
      $(".modal").modal("toggle");

      swal("Success", "You have successfully added a schedule", "success");

      populateScheduledTable();
    });
  });
});
