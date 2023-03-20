$("#setting-flush-simulation-log").click(function (e) {
  e.preventDefault();
  $(this).attr("disabled", "disabled");
  chrome.storage.local.set({ simulations: [] }, function () {
    calculateUsage();
  });
});
$("#setting-flush-favorites").click(function (e) {
  e.preventDefault();
  $(this).attr("disabled", "disabled");
  chrome.storage.local.set({ favorites: [] }, function () {
    chrome.storage.local.get("scheduled", function (result) {
      var scheduled = result.scheduled;
      if (!Array.isArray(scheduled)) {
        // for safety only
        scheduled = [];
      }
      for (var i = 0; i < scheduled.length; i++) {
        if (scheduled[i].workflow != -1) {
          scheduled.splice(i, 1);
          i--;
        }
      }
      chrome.storage.local.set({ scheduled: scheduled }, function () {
        // populateFavoritesTable();
        // populateScheduledTable();
        calculateUsage();
      });
    });
  });
});
$("#setting-flush-event-log-workflow").click(function (e) {
  e.preventDefault();
  $(this).attr("disabled", "disabled");
  chrome.storage.local.remove("workflow", function () {
    chrome.storage.local.remove("events", function () {
      calculateUsage();
    });
  });
});
$("#setting-reset-wildfire").click(function (e) {
  e.preventDefault();
  chrome.storage.local.clear(function () {
    chrome.runtime.reload();
  });
});

function bytesReadable(bytes) {
    if (bytes > 1024*1024*1024)
        return (bytes/(1024*1024*1024)).toFixed(2) + " GB";
    if (bytes > 1024*1024)
        return (bytes/(1024*1024)).toFixed(2) + " MB";
    if (bytes > 1024)
        return (bytes/1024).toFixed(2) + " KB";
    return bytes + " B";
}

function calculateUsage() {
  chrome.storage.local.getBytesInUse("workflow", function (workflow_usage) {
    $("#workflow-editor-usage").text(bytesReadable(workflow_usage));
    chrome.storage.local.getBytesInUse("events", function (events_usage) {
      $("#event-log-usage").text(bytesReadable(events_usage));
      chrome.storage.local.getBytesInUse(
        "simulations",
        function (simulations_usage) {
          $("#simulation-log-usage").text(bytesReadable(simulations_usage));
          chrome.storage.local.getBytesInUse(
            "favorites",
            function (favorites_usage) {
              $("#favorites-usage").text(bytesReadable(favorites_usage));
              chrome.storage.local.getBytesInUse(
                ["settings", "recording", "simulating", "scheduled"],
                function (metadata_usage) {
                  $("#metadata-usage").text(bytesReadable(metadata_usage));

                  $("#total-usage").text(
                    bytesReadable(
                      workflow_usage +
                        events_usage +
                        simulations_usage +
                        favorites_usage +
                        metadata_usage
                    )
                  );

                  $("#usage-chart").html(""); // clear chart if already exists

                  c3.generate({
                    bindto: "#usage-chart",
                    data: {
                      columns: [
                        ["Workflow", workflow_usage],
                        ["Events", events_usage],
                        ["Simulations", simulations_usage],
                        ["Favorites", favorites_usage],
                        ["Metadata", metadata_usage],
                      ],
                      colors: {
                        Workflow: "#fa424a",
                        Events: "#46c35f",
                        Simulations: "#fdad2a",
                        Favorites: "#00a8ff",
                        Metadata: "#ac6bec",
                      },
                      type: "pie",
                    },
                    size: {
                      width: 156,
                      height: 180,
                    },
                    label: {
                      show: false,
                    },
                    legend: {
                      hide: true,
                    },
                  });
                }
              );
            }
          );
        }
      );
    });
  });
}

calculateUsage();
