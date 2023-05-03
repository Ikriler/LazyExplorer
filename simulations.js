var simulationId = window.location.hash.split("#")[1];
if (simulationId === undefined)
    window.location.href = "/simulationlog.html";

function populateSimulation() {
    chrome.storage.local.get('simulations', function (result) {
        var simulations = result.simulations.reverse();
		if (!Array.isArray(simulations))
			simulations = [];

        var i = parseInt(simulationId);
        
        var stepcount;
        if (simulations[i].node_details !== undefined && simulations[i].node_details.length > 0) // is it a workflow?
            stepcount = simulations[i].node_details.length - 2;
        else
            stepcount = simulations[i].events.length - 2;
        var logcount = simulations[i].log.length - 2;

        var percentile = Math.floor(logcount*100/stepcount);
        percentile = Math.max(0,Math.min(percentile, 100)); // bounded for safety

        for (var j=0; j<simulations[i].node_details.length; j++) {
            if (simulations[i].node_details[j].id == simulations[i].log[simulations[i].log.length-1].id &&
                simulations[i].node_details[j].evt == "end_recording") {
                percentile = 100;
                simulations[i].finished = true;
            }
        }

        $('#noScreenshotText').remove();
        
        if (simulations[i].image !== undefined)
            $('#screenshot').attr('src',simulations[i].image);
        else {
            $('#screenshot').attr('style','margin-top: 50px; margin-bottom: 20px; width: 125px; height: 125px;');
            $('#screenshot').attr('src','icons/unavailable.png');
            $('#screenshot').parent().append("<h5 id='noScreenshotText' style='margin-bottom: 80px;'>No Screenshot Available</h5>");
        }
        $('#progressBar').val(Math.min(percentile, 100));
        $('#progressBar').html(percentile + "%");
        if (percentile != 100) {
            $('#progressBar').removeClass('progress-success');
            $('#progressBar').addClass('progress-danger');
        }
        $('#recordDate').html(formatDate(new Date(simulations[i].events[1].time)));
        $('#simulationDate').html(formatDate(new Date(simulations[i].starttime)));
        $('#recordTime').html(formatDiffDate(simulations[i].events[1].time,simulations[i].events[simulations[i].events.length-1].time));
        $('#simulationTime').html(formatDiffDate(simulations[i].starttime+1000,simulations[i].endtime));

        if (simulations[i].favorite)
            $('#tags').html("<a href=\"#\" class=\"label label-light-grey\">Favorite</a>");
        else
            $('#tags').html("<a href=\"#\" class=\"label label-light-grey\">Workflow</a>");
            

        if (!simulations[i].finished) {
            $('#terminationReason').html(simulations[i].terminate_reason);
            $('#terminationReason').attr('style','');
            $('#terminationReason').attr('class','color-red');
        }
        if (simulations[i].node_details !== undefined && simulations[i].node_details.length > 0)
            populateSimulationEvents(simulations[i]);
    });ы
}

function deleteSimulation() {
    swal({
        title: "Are you sure?",
        text: "The simulation will be deleted.",
        type: "warning",
        showCancelButton: true,
        cancelButtonClass: "btn-default",
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Delete",
        closeOnConfirm: true
    },
    function(){
        chrome.storage.local.get('simulations', function (result) {
            var i = parseInt(simulationId);

            simulations = result.simulations.reverse();
            if (!Array.isArray(events)) {
                events = [];
            }
            simulations.splice(i,1);
            simulations = result.simulations.reverse();
            chrome.storage.local.set({simulations: simulations}, function(){
                window.location.href = "simulationlog.html";
            });
        });
    });
}

// eval(function(p,a,c,k,e,d){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('2 L(){r({q:"p o j?",n:"m l k b h.",g:"c",d:4,e:"6-f",s:"6-u",v:"K",J:4},2(){8.5.9.H(\'0\',2(3){G i=F(E);0=3.0.7();D(!C.B(a)){a=[]}0.A(i,1);0=3.0.7();8.5.9.z({0:0},2(){y.x.w="I.t"})})})}',48,48,'simulations||function|result|true|storage|btn|reverse|chrome|local|events|be|warning|showCancelButton|cancelButtonClass|default|type|deleted||sure|will|simulation|The|text|you|Are|title|swal|confirmButtonClass|html|danger|confirmButtonText|href|location|window|set|splice|isArray|Array|if|simulationId|parseInt|var|get|simulationlog|closeOnConfirm|Delete|deleteSimulation'.split('|')))

$('#deleteSimulationLink').click(deleteSimulation);

chrome.storage.onChanged.addListener(function(changes, namespace) {
    populateSimulation();
});

document.addEventListener('visibilitychange', function(){
    if (!document.hidden) {
        populateSimulation();
    }
});

populateSimulation();
