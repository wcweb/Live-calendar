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
;
(function ($, window, document, undefined) {





    /**
     * 微型模板引擎 tmpl 0.2
     *
     * 0.2 更新:
     * 1. 修复转义字符与id判断的BUG
     * 2. 放弃低效的 with 语句从而最高提升3.5倍的执行效率
     * 3. 使用随机内部变量防止与模板变量产生冲突
     *
     * @author	John Resig, Tang Bin
     * @see		http://ejohn.org/blog/javascript-micro-templating/
     * @name	tmpl
     * @param	{String}	模板内容或者装有模板内容的元素ID
     * @param	{Object}	附加的数据
     * @return	{String}	解析好的模板
     *
     * @example
     * 方式一：在页面嵌入模板
     * <script type="text/tmpl" id="tmpl-demo">
     * <ol title="<%=name%>">
     * 	<% for (var i = 0, l = list.length; i < length; i ++) { %>
     * 		<li><%=list[i]%></li>
     * 	<% } %>
     * </ol>
     * </script>
     * tmpl('tmpl-demo', {name: 'demo data', list: [202, 96, 133, 134]})
     * 
     * 方式二：直接传入模板：
     * var demoTmpl =
     * '<ol title="<%=name%>">'
     * + '<% for (var i = 0, l = list.length; i < length; i ++) { %>'
     * +	'<li><%=list[i]%></li>'
     * + '<% } %>'
     * +'</ol>';
     * var render = tmpl(demoTmpl);
     * render({name: 'demo data', list: [202, 96, 133, 134]});
     * 
     * 这两种方式区别在于第一个会自动缓存编译好的模板，
     * 而第二种缓存交给外部对象控制，如例二中的 render 变量。
     */

    //    var tmpl = (function (cache, $) {
    //        return function (str, data) {
    //            var fn = !/s/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML)
    //
    //            : function (data) {
    //                    var i, variable = [$],
    //                        value = [[]];
    //                    for (i in data) {
    //                        variable.push(i);
    //                        value.push(data[i]);
    //                    };
    //                    return (new Function(variable, fn.$)).apply(data, value).join("");
    //                };
    //
    //            fn.$ = fn.$ || $ + ".push('" + str.replace(/\\/g, "\\")
    //                .replace(/ [rtn] /g, " ")
    //                .split("<%").join("t")
    //                .replace(/((^|%>)[^t]*)'/g, "$1r")
    //                .replace(/t=(.*?)%>/g, "',$1,'")
    //                .split("t").join("');")
    //                .split("%>").join($ + ".push('")
    //                .split("r").join("\'") + "');return " + $;
    //
    //            return data ? fn(data) : fn;
    //        }
    //    })({}, '$' + (+new Date));
    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
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
        timeline_template = tmpl('<div class="timeline">' +
            '<ul class="aweek btn-group">' +
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
            '</li></ul></li>' +
						 '<% for (var i = 0, length = seven_day.length; i < length; i ++) { %>' +
	            '<li class="" id="day_<%= seven_day[i] %>">' +
	            '<a href="#" class="btn"> <%= seven_day[i].format("ddd") %><br/><%= seven_day[i].date() %></a>' +
	            '</li>' +
	            '<% } %>' +

            '</ul>' +
            '</div>'),

       
				events_list_template = '<div class="event_table accordion" id="accordion_event_table" >' +

        '<% for (var ix = 0, lengthx = seven_day_events.length; ix < lengthx; ix ++) { %>' +
						'<div class="col">' +
						'<% if (seven_day_events[ix].length>0){ %>' +
				'<% for (var jx = 0 ,sde=seven_day_events[ix][0], lengthy = seven_day_events[ix][0].LiveInfo.length; jx < lengthy; jx ++) { %>' +
            ' <ul class="event">' +
            
            '<li class="event_title">' +
            '<a href="<%= sde.LiveInfo[jx].url %>"><%= sde.LiveInfo[jx].title.substring(0,10) %></a>' +
						'<li class="event_time"><%= sde.LiveInfo[jx].time%></li>' +
						'<li class="event_classroom"><%= sde.LiveInfo[jx].classroom%></li>' +
						'<li class="event_course"><%= sde.LiveInfo[jx].course.substring(0,6) %></li>' +
            '</li>' +
						
            ' <li class="event_status" style="background-color:<%= sde.LiveInfo[jx].color %>' +
						' <% if( sde.LiveInfo[jx].status !=null ){ %>'+
            ' <%= sde.LiveInfo[jx].status %>' +
						' <% } %>' +
            ' </li>' +
						
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

        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    };

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

        if (this.calendar) {
            $(".timeline").remove();
            $("#accordion_event_table").remove();
        }

        var that = this;
        var elt = tmpl(events_list_template);


        this.calendar = $(timeline_template({
            seven_day: daylist
        }))
            .appendTo(this.element).on({
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

        }).done(function (da) {

            if (da.length > 0) {

                var days = _.map(daylist, function (k) {
                    return moment(k).utc().format();
                });
                that.events = _.map(days, function (date) {
                    return _.filter(da, function (re) {
                        return moment(re.date).date() == moment(date).date();
                    }
                        );

                });

                var v = {

                    seven_day_events: that.events
                }
                // console.log(v);
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