document.addEventListener("DOMContentLoaded", function () {
  // create the canvas for the user interaction
  //
  var canvas = new draw2d.Canvas("canvas");


  // create and add two nodes which contains Ports (In and OUT)
  //
  var start = new draw2d.shape.node.Start();
  var end = new draw2d.shape.node.End();

  // ...add it to the canvas
  canvas.add(start, 50, 250);
  canvas.add(end, 630, 250);
});
