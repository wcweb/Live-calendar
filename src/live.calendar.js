/*!
 * bootstrap-calendar plugin
 * Original author: @ahmontero
 * Licensed under the MIT license
 *
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */


// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
// ;
(function ($, window, document, undefined) {

    (function () {
        var cache = {};

        this.tmpl = function tmpl(str, data) {
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !/\W/.test(str) ?
                cache[str] = cache[str] ||
                tmpl(document.getElementById(str).innerHTML) :

            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

            // Convert the template into pure JavaScript
            str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'") + "');}return p.join('');");

            // Provide some basic currying to the user
            return data ? fn(data) : fn;
        };
    })();

    var pluginName = 'LiveScheduler',

        defaults = {
            weekStart: 1,
            msg_days: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            msg_months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            msg_today: 'Today',
            msg_events_today: 'Events Today', // when today click.
            url: "",
            events: null
        },
					// .aweek.btn-group>operator+date_id
        timeline_template = tmpl(
            '<ul class="aweek btn-group ">' +
            '<li class="operator"><ul>' +
            '<li class="fast pre">' +
            '<a href="#" class="btn">上一周</a>' +
            '</li>' +
            '<li class="divid"></li>' +
            '<li class="pre">' +
            '<a href="#" class="btn">&lt</a>' +
            '</li>' +
            '<li class="next">' +
            '<a href="#" class="btn">&gt</a>' +
            '</li>' +
            '<li class="fast next">' +
            '<a href="#" class="btn">下一周</a>' +
            '</li></ul></li></ul>'),
			 days_template = tmpl(
						'<ul class="nav nav-tabs" id="days_tabs">'+
             '<% for (var i = 0, length = seven_day.length; i < length; i ++) { %>' +
              '<li class="select_day">' +
              '<a href="#d<%= seven_day[i].format("D") %>"  data-toggle="tab"><%= seven_day[i].format("ddd") %><br/> <%= seven_day[i].format("MMM Do") %></a>' +
              '</li>' +
              '<% } %>' +
						'</ul>'+

            '</ul>' ),

       
        events_list_template = '<div class="tab-content" id="accordion_event_table" >' +

        '<% for (var ix = 0, lengthx = seven_day_events.length; ix < lengthx; ix ++) { %>' +
            '<div class="tab-pane" id="d<%= r_days[ix].format("D") %>">' +
            '<% if (seven_day_events[ix].length>0){ %>' +
						
        '<% for (var jx = 0 ,sde=seven_day_events[ix][0], lengthy = seven_day_events[ix][0].LiveInfo.length; jx < lengthy; jx ++) { %>' +
            ' <ul class="event">' +
            
            '<li class="event_title">' +
            '<a href="<%= sde.LiveInfo[jx].url %>"><%= sde.LiveInfo[jx].title.substring(0,10) %></a>' +
            '<li class="event_time"><%= sde.LiveInfo[jx].time%></li>' +
            '<li class="event_classroom"><%= sde.LiveInfo[jx].classroom%></li>' +
            '<li class="event_course"><%= sde.LiveInfo[jx].course %></li>' +
            '</li>' +
            ' <% if( sde.LiveInfo[jx].status !=null ){ %>'+
            ' <li style="background-color:<%= sde.LiveInfo[jx].color %>;">' +
            ' <%= sde.LiveInfo[jx].status %>' +
            ' </li>' +
            '<% } %>' +
            ' </ul>' +
            '<% } %>' +
					
            '<% } %>' +
            '</div>' +
            '<% } %>',
        daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

        today = new Date();

    // The actual plugin constructor

    function Plugin(element, options) {
        this.element = $(element);

        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and
        // the options via the instance, e.g. this.element
        // and this.options
        this.weekStart = this.options.weekStart || 1;
        this.days = this.options.msg_days;
        this.months = this.options.msg_months;
        this.msg_today = this.options.msg_today;
        this.msg_events_hdr = this.options.msg_events_header;
        this.events = this.options.events;
        this.url = this.options.url;

        this.live_date = new Date();

        var now = moment();
        this.mm = now.month();
        this.yy = now.year();
        this.today = now.date();
        this.middleDay = now;

        this.renderCalendar(getSevenDays(now));

    };

    Plugin.prototype.renderCalendar = function (daylist) {
				$(this.element).contents().remove();

        var that = this;
        var elt = tmpl(events_list_template);
        this.calendar = $(days_template({
            seven_day: daylist
        })).appendTo(this.element);
				this.timeline = $(timeline_template({})).prependTo(this.element).on({
                click: $.proxy(this.click, this)
            });
        $.ajax({
            type: "POST",
            url: this.url,
            data: {
                "days": _.map(daylist, function (k) {
                    return moment(k).utc().format();
                })

            },
            // crossDomain:true,
            dataType: "json",
            jsonp: false

        }).done(function (results) {

						if(typeof results == "object"){
							var res_dates= results.result;
						}
						if(typeof results == "array"){
							var res_dates= results;
						}
							
						if (res_dates.length > 0) {
              var req_days = _.map(daylist, function (k) {
                  return moment(k).utc().format();
              });

              that.events = _.map(req_days, function (req_date) {
                  return _.filter(res_dates, function (res) {
											res.date= moment(res.date);
                      return res.date.date() == moment(req_date).date();
                  }
                      );
									
              });

              var v = {seven_day_events: that.events,r_days:daylist}
              console.log(v);
              $(elt(v)).appendTo(that.element)

            }
						
            $("#days_tabs a:first").tab("show");


        }).fail(function (jqXHR, textStatus, errorThrown) {
            // console.log(textStatus);
        });

    };

    Plugin.prototype.click = function (e) {
        e.stopPropagation();
        e.preventDefault();
        var target = $(e.target).closest('li');
        if (target.length == 1) {
            if (target.is('.pre')) {

                if (target.is('.fast')) {
                    this.middleDay = moment(this.middleDay).subtract('d', 7);
                    this.renderCalendar(getSevenDays(this.middleDay));
                } else {
                    this.middleDay = moment(this.middleDay).subtract('d', 1);
                    this.renderCalendar(getSevenDays(this.middleDay));
                }
            } else if (target.is('.next')) {

                if (target.is('.fast')) {
                    this.middleDay = moment(this.middleDay).add('d', 7);
                    this.renderCalendar(getSevenDays(this.middleDay));
                } else {
                    this.middleDay = moment(this.middleDay).add('d', 1);
                    this.renderCalendar(getSevenDays(this.middleDay));
                }

            } 
        }


    };

    var getSevenDays = function (middleDay) {

        var daylist = new Array();
        var startDay = moment(middleDay).subtract('d', Math.floor(7 / 2));

        _(7).times(function (n) {
            var ss = startDay.add('d', 1);
            daylist.push(moment(ss));

        });
        return daylist;
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin(this, options));
            }
        });
    }

})(jQuery, window, document);
