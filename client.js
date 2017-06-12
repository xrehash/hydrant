"use strict";

(function ($) {
  "use strict"; // Start of use strict
  // Closes the Responsive Menu on Menu Item Click
  $('.navbar-collapse ul li a:not(.dropdown-toggle)').click(function () {
    $('.navbar-toggle:visible').click();
  });

  // Offset for Main Navigation
  $('#mainNav').affix({
    offset: {
      top: 100
    }
  })
})(jQuery); // End of use strict
var pgModel = new OutageRecordT.OutageRecordViewModel()
ko.applyBindings(pgModel);