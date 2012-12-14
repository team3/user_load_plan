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

open_activity_edit_view = function(activity_id) {
  window.open('/usersloadplan/user_plan_activities/' + activity_id, 300, 600);
}

draw_graph = function() {
  $.get('/usersloadplan/user_plan_activities.json', function(data) {
    var kf = 0.0005; // 1 second = 0.0005px
    var containerHeight = 35;
    var legendHeight = 80;
    var deltaY = 15;

    // ---- styles ---
    path_opacity_style = {fill: "#000", stroke: "#666", "fill-opacity": 0.5}
    path_style = {fill: "#000", stroke: "#666", "fill-opacity": 1.0}
    dashed_style = {fill: "#3C0", stroke: "#666", "fill-opacity": 0.9};
    // ---------------

    console.log(data);
    min_date = parseInt(data.start); // in seconds
    max_date = parseInt(data.end); // in seconds

    // calculating plot start
    plot_start = min_date - 3 * 60 * 60 * 24; // minus 3 days, in seconds
    plot_end = max_date + 3 * 60 * 60 * 24 // plus 3 days, in seconds

    // calculating the width of the canvas
    plot_width = (plot_end - plot_start) * kf // in pixels
    if (plot_width > 10000) {
      kf *= 0.5;
      plot_width *= 0.5;
    }

    // calculating the height of the canvar
    plot_heigth = legendHeight + parseInt(data.plans.length) * (containerHeight + deltaY) + 40;

    // initialization of the Raphael's canvas
    r = Raphael("holder", plot_width, plot_heigth);

    // drawing the header of the graph
    // top horizontal line
    draw_svg_line(r, 1, 1, plot_width - 1, 1, path_style);
    // bottom horizonal line
    draw_svg_line(r, 1, plot_heigth, plot_width, plot_heigth, path_style);
    // left vertical line
    draw_svg_line(r, 1, 1, 1, plot_heigth, path_style);
    // right vertical line
    draw_svg_line(r, plot_width - 1, 0, plot_width - 1, plot_heigth, path_style);

    // count of the days between maximum date and minimum date
    days_count = (plot_end - plot_start) / (60 * 60 * 24);

    for (i = 1; i < days_count; i++) {
      cur_date = new Date((plot_start + i * 24 * 60 * 60) * 1000);
      // one week before current date in loop (for printing the legend)
      old_date = new Date((plot_start + (i - 7) * 24 * 60 * 60) * 1000);
      day_delta = 24 * 60 * 60 * kf // pixels
      x1 = i * day_delta; // pixels
      // if current day is monday
      if (cur_date.getDay() % 7 == 0) {
        // big vertical separator for weeks
        draw_svg_line(r, x1, 0, x1, plot_heigth, path_opacity_style);
        date_formatted = old_date.getDate() + "." + old_date.getMonth() + "." + old_date.getFullYear() + 
                          " - " + cur_date.getDate()+ "." +cur_date.getMonth()+ "." +cur_date.getFullYear()
        r.text(x1 - (day_delta * 7) / 2, 10, date_formatted);
      }
      else
        // small vertacal separator for days
        draw_svg_line(r, x1, 30, x1, plot_heigth, path_opacity_style);
      // draw week's marker
      r.text(x1 - 20, legendHeight - 10, getWeekNumber(cur_date));
    }
    // legend top horizontal line
    draw_svg_line(r, 1, 30, plot_width, 30, path_style);
    // legend bottom horizontal line
    draw_svg_line(r, 1, legendHeight, plot_width, legendHeight, path_style);

    plans_count = data.plans.length;
    activities_start_y = legendHeight;
    $("tr#legend").css("height", activities_start_y);
    
    y = activities_start_y;
    $(data.plans).each(function(i, plan){
      
      console.log(plan);
      // changing the sizes of the html containers
      $("td#user_" + plan.user).css("height", containerHeight);
      $("td#user_" + plan.user).parent().after($("<tr></tr>").css("height", deltaY).html("<td>&nbsp;</td>"))
      $("div#holder").parent().attr("rowspan", $("div#holder").parent().attr("rowspan") + plans_count);
      $("div#holder").css("height", $("div#holder").css("height") + containerHeight + deltaY);
      
      // draw horizontal line for users activities
      // TODO: styles of the lines!
      draw_svg_line(r, 1, y, plot_width, y, path_style);
      draw_svg_line(r, 1, y + containerHeight, plot_width, y + containerHeight, path_style);

      // drawing activities
      $(plan.activities).each(function(j, activity) { 
        x1 = parseInt(activity[0]);
        x2 = parseInt(activity[1]);
        load = parseInt(activity[2]);
        aid = activity[3];

        y1 = y + (containerHeight - (containerHeight * (load / 100)));
        y2 = (containerHeight * (load / 100));

        // draw the rectangle for the current activity
        t = r.rect((x1 - plot_start) * kf, y1, (x2 - x1) * kf, y2).attr(dashed_style);
        // add onclick listener for the activity rectangle
        t.click(function() {open_activity_edit_view(aid)});
      });
      y += containerHeight + deltaY;
    });
  });
}

draw_svg_line = function(r, x1, y1, x2, y2, style) {
  r.path("M " + x1 + " " + y1 + "L" + x2 + " " + y2).attr(style);
}

open_activity_edit_view = function(activity_id) {
  window.open('/usersloadplan/user_plan_activities/' + activity_id, 'width=400, height=600');
}