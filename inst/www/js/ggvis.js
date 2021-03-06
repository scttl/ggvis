/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
    strict:false, undef:true, unused:true, browser:true, jquery:true, maxerr:50,
    curly:false, multistr:true */
/*global vg*/
var ggvis = window.ggvis = window.ggvis || {};  // If already defined, just extend it

// Keep track of information about all plots: contains GgvisPlot objects
ggvis.plots = {};
ggvis.renderer = null; // "canvas" or "svg"

ggvis.getPlot = function(plotId) {
  // Get the GgvisPlot object (and create if needed)
  if (!this.plots[plotId]) {
    this.plots[plotId] = new GgvisPlot(plotId);
  }
  return this.plots[plotId];
};

// Given the name of a plot and an <a> element, set the href of that element
// to the canvas content of the plot converted to PNG. This will set the href
// when the link is clicked; the download happens when it is released.
ggvis.updateDownloadLink = function(plotId, el) {
  var plot = $("#" + plotId + ".ggvis-output .marks")[0];
  var imageUrl;

  if (this.renderer === "svg") {
    // Extract the svg code and add needed xmlns attribute
    var svg = $(plot).clone().attr("xmlns", "http://www.w3.org/2000/svg");
    // Convert to string
    svg = $('<div>').append(svg).html();
    imageUrl = "data:image/octet-stream;base64,\n" + btoa(svg);

  } else if (this.renderer === "canvas") {
    imageUrl = plot.toDataURL("image/png").replace("image/png", "image/octet-stream");
  }

  // Set download filename and data URL
  var ext = "";
  if      (this.renderer === "svg")    ext = ".svg";
  else if (this.renderer === "canvas") ext = ".png";
  el.setAttribute("download", plotId + ext);
  el.setAttribute("href", imageUrl);
};

// Change the renderer and update all plots
ggvis.setRenderer = function(renderer) {
  this.renderer = renderer;

  for (var plotId in this.plots) {
    if (this.plots.hasOwnProperty(plotId))
      this.plots[plotId].chart.renderer(renderer).update();
  }
};

// Set the value of the renderer selector, if present
ggvis.setRendererChooser = function(renderer) {
  var $el = $("#ggvis_renderer");
  if ($el) {
    $el.val(renderer);
  }
};

ggvis.updateDownloadButtonText = function() {
  var $el = $("#ggvis_download");
  if ($el) {
    var filetype = "";
    if      (this.renderer === "svg")    filetype = "SVG";
    else if (this.renderer === "canvas") filetype = "PNG";

    $el.text("Download " + filetype);
  }
};

// GgvisPlot objects ----------------------------------------------------------
// Constructor for GgvisPlot objects
var GgvisPlot = function(plotId) {
  this.plotId = plotId;
  this.pendingData = {}; // Data objects that have been received but not yet used
  this.chart = null;     // Vega chart object on the page
  this.spec = null;      // Vega spec for this plot
  this.initialized = false; // Has update() or enter() been run?
};

GgvisPlot.prototype = {
  parseSpec: function(spec, renderer) {
    var self = this;
    renderer = renderer || "svg";
    self.spec = spec; // Save the spec
    self.initialized = false;

    vg.parse.spec(spec, function(chart) {
      var selector = ".ggvis-output#" + self.plotId;
      var $el = $(selector);

      chart = chart({ el: selector, renderer: renderer });
      // Save the chart object
      self.chart = chart;
      $el.data("ggvis-chart", chart);

      // If the data arrived earlier, use it.
      if (self.pendingData) {
        chart.data(self.pendingData);
        delete self.pendingData;
      }

      // When done resizing, update with new width and height
      $el.resizable({
        helper: "ui-resizable-helper",
        grid: [10, 10],
        stop: function() {
          var padding = chart.padding();
          chart.width($el.width() - padding.left - padding.right);
          chart.height($el.height() - padding.top - padding.bottom);
          chart.update({duration: 250});
        }
      });

      if (self.data_ready()) {
        chart.update();
        self.updateGgvisDivSize();
        self.initialized = true;
      }
    });
  },

  // Sets height and width of wrapper div to contain the plot area.
  // This is so that the resize handle will be put in the right spot.
  updateGgvisDivSize: function() {
    var $el = $(".ggvis-output#" + this.plotId);
    var $plotarea = $el.find("div.vega > .marks");

    $el.width($plotarea.width());
    $el.height($plotarea.height());
  },

  // Returns true if all data objects for a spec have been registered, using
  // this.chart.data(dataset)
  data_ready: function() {
    var existing_data = Object.keys(this.chart.data());
    var expected_data = this.spec.data.map(function (x) {
      return x.name ;
    });

    return this.arrays_equal(existing_data, expected_data);
  },

  // Returns true if arrays have same contents (in any order), false otherwise.
  arrays_equal: function(a, b) {
    return $(a).not(b).length === 0 && $(b).not(a).length === 0;
  }
};


$(function(){ //DOM Ready
  var $el;

  // Attach event handlers to buttons
  $el = $("button#quit");
  if ($el) {
    $el.on("click", function() { window.close(); });
  }

  $el = $("#ggvis_download");
  if ($el) {
    $el.on("click", function() {
      var plotId = $(this).data("plot-id");
      ggvis.updateDownloadLink(plotId, this);
    });
  }

  $el = $("#ggvis_renderer");
  if ($el) {
    $el.on("change", function() {
      ggvis.setRenderer(this.value);
      ggvis.updateDownloadButtonText();
    });
  }
});
