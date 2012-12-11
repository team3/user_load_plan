draw_plan_canvas = function(r, start_date_sec, end_date_sec, pxc, plot_heigth) {
  var chart_limit = (end_date_sec  - start_date_sec) / 1000;

  var start_date = new Date(start_date_sec * 1000);
  var end_date = new Date(end_date_sec * 1000);
  var days_count = (end_date_sec - start_date_sec) / (60 * 60 * 24);
  console.log(days_count);
  // draw markers
  var delta = (60 * 60 * 24) / pxc;
  for (i = 0,j = 0; i < chart_limit, j < days_count; i+= delta, j++) {
    date = new Date((parseInt(start_date_sec) + (60 * 60 * 24) * j) * 1000);
    //console.log(date);
    text = r.text(i+30, 80, getWeekNumber(date)[1] ).
      attr({font: '16px "Helvetica Neue", Arial', fill: "#666"});
  
    r.path("M " + i + " 2 l 0 " + plot_heigth);
  }
}

function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(d);
  d.setHours(0,0,0);
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setDate(d.getDate() + 4 - (d.getDay()||7));
  // Get first day of year
  var yearStart = new Date(d.getFullYear(),0,1);
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
  // Return array of year and week number
  return [d.getFullYear(), weekNo];
}

draw_plan_activity = function(r, pos_x, pos_y, width, height) {
  dashed = {fill: "#3C0", stroke: "#666", "stroke-dasharray": "- "};
  r.rect(pos_x, pos_y, width, height).attr(dashed);
}

draw_plan = function() {
    $.get('/usersloadplan/user_plan_activities.json', function(data) {
      var PXC = 1000;
      var startX = 25;
      var startY = 125;
      var deltaY = 30;
      var containerHeight = 40;
      var xmin = data.start;
      var xmax = data.end;
      var chart_limit = (xmax - xmin) / PXC;
      var r = Raphael("holder", chart_limit, containerHeight * data.plans.length + 400);
      
      var y = startY;

      $("tr#legend").css("height", startY + deltaY);
      // for each user
      $(data.plans).each(function(i, plan) {
        y += deltaY;
        console.log(y);
        draw_plan_canvas(r, xmin, xmax, PXC, containerHeight * data.plans.length + 400);
        $("td#user_" + plan.user).css("height", containerHeight);
        $("td#user_" + plan.user).parent().after($("<tr></tr>").css("height", deltaY).html("<td>&nbsp;</td>"))
        $("div#holder").parent().attr("rowspan", $("div#holder").parent().attr("rowspan") + 2);
        $("div#holder").css("height", $("div#holder").css("height") + containerHeight + deltaY);
        $(plan.activities).each(function(j, activity) {

          var x1 = activity[0];
          var x2 = activity[1];
          var load = activity[2];

          r.path("M 0 " + y + " l " + chart_limit + " 0");
          var y1 = y + (containerHeight - (containerHeight * (load / 100)));
          var y2 = (containerHeight * (load / 100));
          
          dashed = {fill: "#3C0", stroke: "#666", "stroke-dasharray": "- ", "stroke-opacity": 10};

          r.path("M 0 " + (y + containerHeight) + " l " + chart_limit + " 0");

          draw_plan_activity(r, (x1 - xmin) / PXC, y1, (x2 - xmin) / PXC, y2);
        });
        y += containerHeight;
      });
      
    })
}
