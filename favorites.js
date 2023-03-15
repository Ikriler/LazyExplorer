function populateFavoritesTable() {
    chrome.commands.getAll(function (setcommands) {
        chrome.storage.local.get('favorites', function (result) {
            var favorites = result.favorites;
            if (!Array.isArray(favorites)) { // for safety only
                favorites = [];
            }

            if (favorites.length < 1)
                $('#favoritesTable').html("<tr><td colspan='4' style='text-align: center;'>Nothing has been favorited yet!</td></tr>");
            else
                $('#favoritesTable').html("");
            $('#scheduleWorkflow').html("");
            var default_opt = document.createElement("option");
            default_opt.setAttribute("value", "-1");
            default_opt.innerHTML = "Current Workflow";
            $('#scheduleWorkflow').append(default_opt);

            for (var i=0; i<favorites.length; i++) {
                var innerHTML = "<tr id=\"favoriteRow" + (i+1) + "\">" +
                "    <td>" + favorites[i].name + "</td>" +
                "    <td>" +
                "        <div class=\"checkbox-toggle\" style=\"margin-top: 8px; margin-bottom: 4px; margin-left: 36px;\">" +
                "            <input type=\"checkbox\" id=\"check-toggle-" + (i+1) + "\"";
                if (favorites[i].rightclick)
                    innerHTML += " checked";
                innerHTML += ">" +
                "            <label for=\"check-toggle-" + (i+1) + "\"></label>" +
                "        </div>" +
                "    </td>" +
                "    <td>";
                if (favorites[i].shortcut) {

                    innerHTML += "<button style='margin: 0;' type='button' class='btn btn-sm btn-inline btn-secondary-outline'>" + setcommands[favorites[i].shortcut].shortcut.replace(/\+/g, "</button>&nbsp;&nbsp;<b class='color-blue-grey'>+</b>&nbsp;&nbsp;<button style='margin: 0;' type='button' class='btn btn-sm btn-inline btn-secondary-outline'>") + "</button>";
                } else
                    innerHTML += "&nbsp;<b class='color-blue-grey'>-</b>";
                innerHTML += "</td>" +
                "    <td>" + formatDate(favorites[i].time) + "</td>" +
                "    <td>" +
                "        <a href=\"#\" id=\"renameFavorite" + (i+1) + "\">Rename</a>&nbsp;&nbsp;" +
                "        <a href=\"#\" id=\"restoreFavorite" + (i+1) + "\">Restore</a>&nbsp;&nbsp;" +
                "        <a href=\"#\" id=\"shortcutFavorite" + (i+1) + "\">Set Shortcut</a>&nbsp;&nbsp;" +
                "        <a href=\"#\" id=\"deleteFavorite" + (i+1) + "\">Delete</a>" +
                "    </td>" +
                "</tr>";

                $('#favoritesTable').append(innerHTML);
                $('#check-toggle-' + (i+1)).change(i, function(evt){
                    var checked = this.checked;
                    chrome.storage.local.get('favorites', function (result) {
                        var favorites = result.favorites;
                        favorites[evt.data].rightclick = checked;
                        chrome.storage.local.set({favorites: favorites});
                    });
                });
                $('#shortcutFavorite' + (i+1)).click(i, function(evt){
                    chrome.commands.getAll(function(commands){
                        var htmlmodal = "Pick a key combination for your workflow:<br /><br /><select id='keyCombo'><option value='none'>(No Assignment)</option>";
                        if (commands[1].shortcut != "")
                            htmlmodal += "<option value='1'>" + commands[1].shortcut.replace(/\+/g, " + ") + "</option>";
                        if (commands[2].shortcut != "")
                            htmlmodal += "<option value='2'>" + commands[2].shortcut.replace(/\+/g, " + ") + "</option>";
                        if (commands[3].shortcut != "")
                            htmlmodal += "<option value='3'>" + commands[3].shortcut.replace(/\+/g, " + ") + "</option>";
                        htmlmodal += "</select><br /><br />";
                        swal({
                            title: "Set Shortcut",
                            text: htmlmodal,
                            html: true,
                            showCancelButton: true,
                            closeOnConfirm: false
                        }, function () {
                            var inputValue = $('#keyCombo').val();
                            if (inputValue === false || inputValue === "") {
                                swal("Error", "You need to select a key combination", "error");
                                return false;
                            }
                            chrome.storage.local.get('favorites', function (result) {
                                var favorites = result.favorites;

                                for (var j=0; j<favorites.length; j++) {
                                    if (favorites[j].shortcut == inputValue)
                                        favorites[j].shortcut = false;
                                }
        
                                favorites[evt.data].shortcut = inputValue;
                                if (inputValue == "none")
                                    favorites[evt.data].shortcut = false;
        
                                chrome.storage.local.set({favorites: favorites});
        
                                swal({
                                    title: "Done",
                                    text: "Your workflow shortcut key has been assigned.",
                                    type: "success",
                                    html: true
                                }, function(){
                                    populateFavoritesTable();
                                });
                            });
                        });
                    });
                });
                $('#renameFavorite' + (i+1)).click(i, function(evt){
                    swal({
                        title: "Rename Favorited Workflow",
                        text: "Enter your new workflow name:",
                        type: "input",
                        showCancelButton: true,
                        closeOnConfirm: false,
                        inputPlaceholder: ""
                    }, function (inputValue) {
                        if (inputValue === false || inputValue.trim() === "") {
                            swal("Error", "You need to enter a workflow name", "error");
                            return false;
                        }
                        chrome.storage.local.get('favorites', function (result) {
                            var favorites = result.favorites;

                            favorites[evt.data].name = inputValue.trim();

                            chrome.storage.local.set({favorites: favorites});

                            swal({
                                title: "Done",
                                text: "Your favorited workflow has been renamed.",
                                type: "success",
                                html: true
                            }, function(){
                                populateFavoritesTable();
                            });
                        });
                    });
                });
                $('#restoreFavorite' + (i+1)).click(i, function(evt){
                    chrome.storage.local.get('favorites', function (result) {
                        var favorites = result.favorites;
                        var importedjson = JSON.parse(decrypt(favorites[evt.data].workflow));
                        chrome.storage.local.set({events: importedjson.events});
                        chrome.storage.local.set({workflow: favorites[evt.data].workflow});

                        swal({
                            title: "Done",
                            text: "Your workflow has been restored.",
                            type: "success",
                            html: true
                        });
                    });
                });
                $('#deleteFavorite' + (i+1)).click(i, function(evt){
                    swal({
                        title: "Are you sure?",
                        text: "This workflow will be deleted.",
                        type: "warning",
                        showCancelButton: true,
                        cancelButtonClass: "btn-default",
                        confirmButtonClass: "btn-danger",
                        confirmButtonText: "Delete",
                        closeOnConfirm: true
                    }, function(resp) {
                        if (!resp)
                            return;
                        chrome.storage.local.get('favorites', function (result) {
                            var favorites = result.favorites;
                            favorites.splice(evt.data, 1);
                            chrome.storage.local.set({favorites: favorites});

                            chrome.storage.local.get('scheduled', function (result) {
                                var scheduled = result.scheduled;
                                if (!Array.isArray(scheduled)) { // for safety only
                                    scheduled = [];
                                }
                                for (var j=0; j<scheduled.length; j++) {
                                    if (scheduled[j].workflow == evt.data) {
                                        scheduled.splice(j, 1);
                                        j--;
                                    } else if (scheduled[j].workflow > evt.data) {
                                        scheduled[j].workflow = scheduled[j].workflow - 1;
                                    }
                                }
                                chrome.storage.local.set({scheduled: scheduled},function(){
                                    calculateUsage();
                                });
                            });

                            populateFavoritesTable();
                            populateScheduledTable();
                        });
                    });
                });
                var opt = document.createElement("option");
                opt.setAttribute("value", i);
                opt.innerHTML = favorites[i].name;
                $('#scheduleWorkflow').append(opt);
            }
        });
    });
}

populateFavoritesTable();

if (window.location.hash == "#favorites") {
    setTimeout(function(){
        $('#favoritesTab').click();
    },1);
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