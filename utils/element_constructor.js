export class ElementContructor {
    static createCard(
        success,
        imgSrc,
        logFrom,
        reason,
        progressValue,
        itemIndex
    ) {
        imgSrc = imgSrc ?? "/icons/noAvailableScreen.png";

        var card = '<div class="col">';
        if (success) {
            card +=
                '<div class="card rounded-3 shadow-sm border-success">\
            <div class="card-header text-bg-success">';
        } else {
            card +=
                '<div class="card rounded-3 shadow-sm border-danger">\
            <div class="card-header text-bg-danger">';
        }

        card += `<h4 class="my-0 fw-normal"></h4>\
        </div>\
        <div class="card-body">\
          <h1 class="card-title text-center">
          <img style="max-height: 110px;" src="${imgSrc}"/>
      </h1>\
        <div>`;

        card += '<div class="h4">' + logFrom + "</div>";

        if (reason) {
            card += '<div class="h5 text-secondary mb-2">' + reason + "</div>";
        } else {
            card +=
                '<div class="h5 text-secondary mb-2">' + "Success" + "</div>";
        }

        card +=
            '<div class="progress" style= "height: 20px;">\
        <div class="progress-bar" role="progressbar" style="width: ' +
            progressValue +
            '%;" aria-valuenow="' +
            progressValue +
            '" aria-valuemin="0" aria-valuemax="100">' +
            progressValue +
            "%</div>\
      </div>";

        card +=
            '</div>\
        </div>\
        <div class="card-footer text-center bg-transparent ">\
            <div class="container-fluid justify-content-around">';

        card +=
            '<a href="simulations.html#' +
            itemIndex +
            '" type="button" class="btn btn-primary">View</a>';
        card +=
            '<button id="deleteSimulationButton' +
            itemIndex +
            '" type="button" class="btn btn-danger" style="margin-left: 15px;">Delete</button>';

        card +=
            "</div>\
        </div>\
      </div>\
    </div>";

        return card;
    }
}
