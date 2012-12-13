draw_plan_canvas = function(graph_container, r, start_date_sec, end_date_sec, pxc, plot_heigth) {
  var FONT_STYLE = {font: '16px "Helvetica Neue", Arial', fill: "#666"}
  var plot_width = (60 * 60 * 24 * 1000 * 7+ end_date_sec  - start_date_sec) / 1000;
  var days_count = (end_date_sec - start_date_sec) / (60 * 60 * 24);

  // draw the canvas' borders
  r.path("M0 1L" + plot_width + " 1");
  r.path("M0 50L" + plot_width + " 50");
  r.path("M1 " + (plot_heigth - 2) + " L" + plot_width + " " + (plot_heigth - 2));
  r.path("M1 1L1 50");
  r.path("M" + plot_width + " 1L " + plot_width + " " + plot_heigth);

  // setting recalculated sizes for the container
  r.setSize(plot_width, plot_heigth)
  // if canwar horizonal or vertical size less then holder's initial size - reduce holder's size
  if (plot_width < parseInt($(graph_container).css("width"))) {
    $(graph_container).css("width", plot_width + 20);
    $(graph_container).css("overflow-x", "auto");
  }

  if (plot_heigth < parseInt($(graph_container).css("width"))) {
    $(graph_container).css("height", plot_heigth + 20);
    $(graph_container).css("overflow-y", "auto");
  }

  // calculating the distance between weeks on the graph in pixels
  var delta = (60 * 60 * 24) / pxc;

  // variable i uses for pixels calculations, 
  // variable j uses for days calculations
  for (i = 0,j = 0; i < plot_width, j < days_count; i+= delta, j++) {
    // calculating new date (old date plus one day)
    date = new Date((parseInt(start_date_sec) + (60 * 60 * 24) * j) * 1000);
    // draw marker for the week`s number
    r.text(i + 30, 80, getWeekNumber(date)[1]).attr(FONT_STYLE);
    // if it's Monday - draw horizontal line-separator and draw dates
    if (date.getDay() == 1) {
      r.path("M" + i + " 0L" + i + " 50");
      newdate = new Date(date + 7);
      var dates_label = date.getDate() + "-" + date.getMonth()+ "-" +date.getFullYear() + "-" + newdate.getDate()+ "-" +newdate.getMonth()+ "-" +newdate.getFullYear();
      r.text((i - delta * 2) + 30, 20, dates_label).attr(FONT_STYLE);
    }
    // draw VERTICAL line for separating the weeks
    r.path("M" + i + " 50L" + i + " " + plot_heigth);
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

draw_plan_activity = function(r, pos_x, pos_y, width, height, activity_id) {
  dashed = {fill: "#3C0", stroke: "#666", "stroke-dasharray": "- "};
  t = r.rect(pos_x, pos_y, width, height).attr(dashed);
  t.click(function() {open_activity_edit_view(activity_id)});
}

open_activity_edit_view = function(activity_id) {
  window.open('/usersloadplan/user_plan_activities/' + activity_id, 300, 600);
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
        draw_plan_canvas($("div#holder"), r, xmin, xmax, PXC, containerHeight * data.plans.length + 400);
        $("td#user_" + plan.user).css("height", containerHeight);
        $("td#user_" + plan.user).parent().after($("<tr></tr>").css("height", deltaY).html("<td>&nbsp;</td>"))
        $("div#holder").parent().attr("rowspan", $("div#holder").parent().attr("rowspan") + 2);
        $("div#holder").css("height", $("div#holder").css("height") + containerHeight + deltaY);
        $(plan.activities).each(function(j, activity) {

          var x1 = activity[0];
          var x2 = activity[1];
          var load = activity[2];
          var aid = activity[3];

          r.path("M 0 " + y + " l " + chart_limit + " 0");
          var y1 = y + (containerHeight - (containerHeight * (load / 100)));
          var y2 = (containerHeight * (load / 100));
          
          dashed = {fill: "#3C0", stroke: "#666", "stroke-dasharray": "- ", "stroke-opacity": 10};

          r.path("M 0 " + (y + containerHeight) + " l " + chart_limit + " 0");

          draw_plan_activity(r, (x1 - xmin) / PXC, y1, (x2 - x1) / PXC, y2, aid);
        });
        y += containerHeight;
      });
      
      r.setSize(chart_limit, y + 10);
      //r.setViewBox(10, 10, 100, 100);
    })
}
