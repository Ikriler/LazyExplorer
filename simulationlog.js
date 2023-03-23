import { ElementContructor } from "./utils/element_constructor.js";

function formatDateLong(date) {
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

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + " " + monthNames[monthIndex] + ", " + year;
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

function populateSimulations() {
    chrome.storage.local.get("simulations", function (result) {
        if (result.simulations !== undefined)
            var simulations = result.simulations.reverse();
        else simulations = [];

        document.getElementById("simulationGrid").innerHTML = "";

        var cards = [];

        for (var i = 0; i < simulations.length; i++) {
            var stepcount;
            if (
                simulations[i].node_details !== undefined &&
                simulations[i].node_details.length > 0
            )
                // is it a workflow?
                stepcount = simulations[i].node_details.length - 2;
            else stepcount = simulations[i].events.length - 2;
            var logcount = simulations[i].log.length - 2;

            var percentile = Math.floor((logcount * 100) / stepcount);
            percentile = Math.max(0, Math.min(percentile, 100)); // bounded for safety

            for (var j = 0; j < simulations[i].node_details.length; j++) {
                if (
                    simulations[i].node_details[j].id ==
                        simulations[i].log[simulations[i].log.length - 1].id &&
                    simulations[i].node_details[j].evt == "end_recording"
                ) {
                    percentile = 100;
                    simulations[i].finished = true;
                }
            }
            var success = simulations[i].finished;
            var imgSrc = simulations[i].image;
            var starttime = new Date(simulations[i].starttime);
            starttime = formatDate(starttime);
            var logFrom = "Simulation Log from " + starttime;
            var reason = simulations[i].terminate_reason;
            var card = ElementContructor.createCard(
                success,
                imgSrc,
                logFrom,
                reason,
                percentile,
                i
            );
            document.getElementById("simulationGrid").innerHTML += card;
        }
        for (var i = 0; i < simulations.length; i++)
            $("#deleteSimulationButton" + i).click(deleteSimulation);
    });
}

function deleteSimulation() {
    var i = parseInt($(this).attr("id").replace("deleteSimulationButton", ""));

    swal(
        {
            title: "Are you sure?",
            text: "The simulation will be deleted.",
            type: "warning",
            showCancelButton: true,
            cancelButtonClass: "btn-default",
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Delete",
            closeOnConfirm: true,
        },
        function () {
            chrome.storage.local.get("simulations", function (result) {
                var simulations = result.simulations.reverse();
                if (!Array.isArray(events)) {
                    // for safety only
                    events = [];
                }
                simulations.splice(i, 1);
                simulations = result.simulations.reverse();
                chrome.storage.local.set(
                    { simulations: simulations },
                    function () {
                        location.reload();
                    }
                );
            });
        }
    );
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
    populateSimulations();
});

populateSimulations();
