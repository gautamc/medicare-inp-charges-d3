var marion = (function(){
    
    var map = function(args){

	this.args = {}
	this.svg = null, this.regions = null, this.projection = null, this.path  = null
	this.centered = null, this.context = null, this.brightness_scale = null

	this.init = function(args){
	    this.args = args
	    var my = this
    
	    my.svg = d3.select(my.args.e).append("svg")
		.attr("width", my.args.width)
		.attr("height", my.args.height)

	    my.regions = my.svg.append("g")
		.attr("id", "regions")

	    my.regions.append("rect")
		.attr("class", "background")
		.attr("width", my.args.width)
		.attr("height", my.args.height)
		/*.on("click", function(d,i){ my.click_handler(this, d, i) })*/

	    my.projection = d3.geo.albers()
		.scale(30000 * (my.args.width/710))
		.translate([my.args.width/2, my.args.height/2])
		.rotate([82, -0.026, 0])
		.center([0, 29.2248])
	    /*.scale(1000)
	      .translate([width/2,height/2])
	      .rotate([96, 0, 0])
	      .center([0, 38])*/

	    my.path = d3.geo.path()
		.projection(my.projection)

	    d3.json("./json/marion_zipcodes_topo.json", function(error, fl_topo_json){
		var subunits = topojson.feature(
		    fl_topo_json, fl_topo_json.objects.marion_zipcodes_geo
		)

		my.regions.selectAll("path")
		    .data(subunits.features)
		    .enter().append("path")
		    .attr("class", "region")
		    .style("fill", function(d,i){
			return "#FFF"
		    })
		    .attr("id", function(d){ return "Z" + d.id })
		    .attr("d", my.path)
		    .on("click", function(d,i){ my.click_handler(this, d, i) })
		    .on("mouseover", function(d,i){
			var x, y
			if (d3.event.pageX != undefined && d3.event.pageY != undefined) {
			    x = d3.event.pageX
			    y = d3.event.pageY
			} else {
			    x = d3.event.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft
			    y = d3.event.clientY + document.body.scrollTop +
				document.documentElement.scrollTop
			}
			x = x + 20, y = y - 20
			$("#plot_overlay").css('top', y + 'px').css('left', x + 'px')
			var offenders_list = _.find(my.args.offenders_lists, function(offenders_list){
			    return offenders_list.zip == d.id.replace(/^Z/,'')
			})
			$("#plot_overlay").html(
			    _.template(
				$("#plot_overlay_template").html(), {
				    zip_code: d.id.replace(/^Z/,''),
				    region_name: d.properties.name,
				    offenders_count: offenders_list.offenders.length
				}
			    )
			)
			$("#plot_overlay").show()
	    	    }).on("mouseout", function(d,i){
			$("#plot_overlay").hide()
		    })

		my.args.on_render(my)
	    })

	    return this
	}

	this.click_handler = function(clicked_obj, d, i){
	    var my = this
	    var x, y, k

	    if (d && my.centered !== d) {
		/*var centroid = my.path.centroid(d)
		x = centroid[0]
		y = centroid[1]
		k = 1.5*/
		my.centered = d
	    } else {
		/*x = my.args.width / 2
		y = my.args.height / 2
		k = 1*/
		my.centered = null
	    }

	    my.regions.selectAll("path.active").style("fill", function(d,i){
		var offenders_list = _.find(my.args.offenders_lists, function(offenders_list){
		    return offenders_list.zip == d.id.replace(/^Z/,'')
		})
		if( offenders_list.offenders.length == 0 ) {
		    return "#FFFFFF"
		} else {
		    // 225,45,240
		    return d3.rgb(46,15,50).brighter(
			my.brightness_scale(offenders_list.offenders.length)
		    ).toString()
		}
	    })
	    my.regions.selectAll("path")
		.classed("active", my.centered && function(d,i) {
		    if ( d === my.centered ) {
			this.style.fill = "#0033CC"
		    }
		    return d === my.centered
		})

	    /*my.regions.transition()
		.duration(1000)
		.attr(
		    "transform",
		    "translate(" + my.args.width / 2 + "," + my.args.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")"
		)
		.style("stroke-width", 1.0 / k + "px")*/
	    
	    my.args.after_click(my, d, i)
	}

	this.render_data = function() {
	    var my = this, max_offenders, min_offenders

	    min_offenders_count = _.min(
		my.args.offenders_lists, function(offenders_list){
		    return offenders_list.offenders.length
		}
	    ).offenders.length
	    max_offenders_count = _.max(
		my.args.offenders_lists, function(offenders_list){
		    return offenders_list.offenders.length
		}
	    ).offenders.length
	    
	    my.brightness_scale = d3.scale.linear()
		.domain([min_offenders_count, max_offenders_count]).range([5.3, 0.0])
	    my.regions.selectAll("path.region")
		.style("fill", function(d,i){
		    var offenders_list = _.find(my.args.offenders_lists, function(offenders_list){
			return offenders_list.zip == d.id.replace(/^Z/,'')
		    })
		    if( offenders_list.offenders.length == 0 ) {
			return "#FFFFFF"
		    } else {
			// 225,45,240
			return d3.rgb(46,15,50).brighter(
			    my.brightness_scale(offenders_list.offenders.length)
			).toString()
		    }
		})
	}

	this.select_region = function(zip_code){
	    var my = this
	    var path_for_zip = my.regions.select("path#Z" + zip_code + ".region" ).each(
		function(d,i){ my.click_handler(this, d, i) }
	    )
	}
	
	return this.init(args)
    }
    
    return { map: map }
})()

OffendersListingView = Backbone.View.extend({
    initialize: function(){
        this.render()
    },
    render: function(){
	var variables = {
	    offenders_list: this.options.offenders_list,
	    zip_code: this.options.zip_code,
	    area_name: this.options.area_name
	}
	var template = _.template( $("#offenders_list_template").html(), variables )
	this.$el.html( template )
    }
})

$(document).ready(function(){

    var map, offenders_lists, load_progress = 0

    d3.json(
	"./json/zip_based_offenders_list.json",
	function(err_status, data){
	    if( err_status == null ) {
		offenders_lists = data
		var width = $("div#map").width()
		var height = width / 2.3
		map = marion.map({
		    e: "#map", width: width, height: height, offenders_lists: offenders_lists,
		    after_click: function(map_obj, d, i) {
			if( d ) {
			    $("select#zip_selector").val( d.id.replace(/^Z/, '') )
			    var Offenders_listing_view = new OffendersListingView({
				el: $("#offenders_listing"),
				offenders_list: _.find(
				    map_obj.args.offenders_lists,
				    function(offenders_list){
					return offenders_list.zip == d.id.replace(/^Z/,'')
				    }
				),
				zip_code: d.id.replace(/^Z/,''),
				area_name: d.properties.name
			    })
			    $.scrollTo( '#select_zip', height, {easing:'elasout'} )
			}
		    }, on_render: function(map_obj) {
			map_obj.render_data()
		    }
		})
	    }
	}
    )

    d3.json(
	"./json/marion_zip_codes_list.json",
	function(err_status, zip_list){
	    $("select#zip_selector")
		.append(
		    _.reduce(
			zip_list, function(memo, zip_tuple) {
			    return memo + _.template(
				"<option value='<%= zip_tuple[0] %>'><%= zip_tuple[0] %> - <%= zip_tuple[1] %></option>", {zip_tuple: zip_tuple}
			    )
			}, "<option value=''>Select a ZIP code</option>"
		    )
		).change(function(event){
		    var opt = $("select#zip_selector option:selected")
		    map.select_region( opt.val() )
		})
	}
    )
})
