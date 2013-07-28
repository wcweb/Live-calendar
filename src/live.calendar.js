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
            currentday:null,
            events: null
        },
					// .aweek.btn-group>operator+date_id
        timeline_template = tmpl(
            '<div class=" timeline ">' +
            '<div class="operator"><ul class="nav nav-pills">' +
            '<li class="fast pre">' +
            '<a href="#" class="">上一周</a>' +
            '</li>' +
            '<li class="pre">' +
            '<a href="#" class="">&lt</a>' +
            '</li>' +
            '<li class="next">' +
            '<a href="#" class="">&gt</a>' +
            '</li>' +
            '<li class="fast next">' +
            '<a href="#" class="">下一周</a>' +
            '</li></ul></div></div>'),
			 days_template = tmpl(
						'<ul class="nav nav-tabs" id="days_tabs">'+
             '<% for (var i = 0, length = seven_day.length; i < length; i ++) { %>' +
              '<li class="select_day select_by_<%= seven_day[i].format("D") %>" >' +
              '<a href="#d<%= seven_day[i].format("D") %>"  data-toggle="tab"><%= seven_day[i].format("dddd") %><br/> <%= seven_day[i].format("MM-DD") %></a>' +
              '</li>' +
              '<% } %>' +
						'</ul>'+

            '</ul>' ),

       
        events_list_template = '<div class="tab-content" id="accordion_event_table" >' +

        '<% for (var ix = 0, lengthx = seven_day_events.length; ix < lengthx; ix ++) { %>' +
            '<div class="tab-pane" id="d<%= r_days[ix].format("D") %>">' +
            '<% if (seven_day_events[ix].length>0){ %>' +
							'<table class="table live_table">'+
							'<thead><tr><th>课程名称</th><th>授课老师</th><th>授课时间</th><th>授课地点</th><th>状态</th><th>操作</th></tr></thead><tbody>'+
	        			'<% for (var jx = 0 ,sde=seven_day_events[ix][0], lengthy = seven_day_events[ix][0].LiveInfo.length; jx < lengthy; jx ++) { %>' +
		            	' <tr class="event">' +
			            '<td class="event_course"><%= sde.LiveInfo[jx].course %></td>' +
			            '<td class="event_title">' +
			            '<a href="<%= sde.LiveInfo[jx].url %>"><%= sde.LiveInfo[jx].title.substring(0,10) %></a>' +
			            '</td>'+
									'<td class="event_time"><%= sde.LiveInfo[jx].time%></td>' +
			            '<td class="event_classroom"><%= sde.LiveInfo[jx].classroom%></td>' +
			            	' <% if( sde.LiveInfo[jx].status !=null ){ %>'+
				            ' <td style="background-color:<%= sde.LiveInfo[jx].color %>;">' +
				            ' <%= sde.LiveInfo[jx].status %>' +
				            ' </td>' +
				            '<td><a href="#">直播/回放</a></td>' +
				            '<% } %>' +
			            ' </tr>' +
		            '<% } %>' +
							'</tbody></table>' +
						//'no data'+
						'<% } else { %>'+'当天没有直播信息！'+'<% }%>'+ 
						'</div>'+ //end if
						'<% } %>',// end for
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
        var now = moment();
        this.weekStart = this.options.weekStart || 1;

        this.url = this.options.url;

        this.currentday = this.options.currentday ? this.options.currentday: now;


        

        console.log(this.currentday);
        this.renderCalendar(getSevenDays(this.currentday));
        $("#days_tabs .select_by_"+moment(this.currentday).format("D")+" a").tab("show");

    };

    Plugin.prototype.renderCalendar = function (daylist) {
		$(this.element).contents().remove();

        var that = this;
        var elt = tmpl(events_list_template);
        this.calendar = $(days_template({
            seven_day: daylist
        })).appendTo(this.element);
				this.timeline = $(timeline_template({})).appendTo(this.element).on({
                click: $.proxy(this.click, this)
            });
				this.calendar.on({click:$.proxy(this.click,this)});
				
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
            //console.log(results);
			if(typeof results == "object"){
				var res_dates= results.result;
                if (res_dates == undefined){return false;}
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
              //console.log(v);
              $(elt(v)).appendTo(that.element)

            }
						
            
						
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
                    this.currentday = moment(this.currentday).subtract('d', 7);
                    this.renderCalendar(getSevenDays(this.currentday));
                } else {
                    this.currentday = moment(this.currentday).subtract('d', 1);
                    this.renderCalendar(getSevenDays(this.currentday));
                }
            } else if (target.is('.next')) {

                if (target.is('.fast')) {
                    this.currentday = moment(this.currentday).add('d', 7);
                    this.renderCalendar(getSevenDays(this.currentday));
                } else {
                    this.currentday = moment(this.currentday).add('d', 1);
                    this.renderCalendar(getSevenDays(this.currentday));
                }

            } else if(target.is('.select_day')){
										$(target).children('a').tab("show");
									
										$($(target).children('a').attr("href")).children('.live_table').dataTable( {
																													//$('.live_table').dataTable( {
											"bRetrieve":true,
											"sDom": "<'row'<'span4'l><'span5 pull-right'f>r>t<'row'<'span4'i><'span5 pull-right'p>>",
											"sPaginationType": "bootstrap",
											"oLanguage": {
												"sLengthMenu": "_MENU_ 条记录 每一页"
											}
										} );
						}
        }


    };

    var getSevenDays = function (middleDay) {

        var daylist = new Array();
        var startDay = moment(middleDay).subtract('d', 4);
        _(7).times(function (n) {
            var ss = startDay.add('d', 1);// 
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
