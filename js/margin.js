var margin_mode = "votes";
var constList = [];
var latestYear = 2014;
var marginLegendList = [];
var marginLegendNumber = 8;
var margin_legend;
var margin_colours_percentage = [
	"#e7298a", "#eb53a1", "#ee69ad", "#f07eb8", "#f5a9d0", "#fad4e7"
];
var margin_colours_votes = [
	"#6a51a3", "#7862ac", "#8773b5", "#a596c7", "#c3b9da", "#e1dcec"
];

var margin_svg;
var margin_map_svg;

var marginData; // margin map data

queue()
    .defer(d3.json, 'data/pipeline/margin.json')
    .defer(d3.json, 'data/partyColors.json')
    .await(getMarginData);

function getMarginData(err, d, colors){
	partyColors = colors;
	marginData = d;

	// Add the data to select tool
	var stateData = [];
	for(var i in Object.keys(marginData)){
		stateData.push({
			id: Object.keys(marginData)[i],
			text: Object.keys(marginData)[i]
		})
	}
	$(".state-select").select2({
	  data: stateData
	});
	$(".state-select").val(state).change();

    constList = Object.keys(marginData[state]);
	var constData = []
	for(var i in constList){
		constData.push({
			id: constList[i],
			text: constList[i]
		});
	}

	constituency = constList[0];

	$(".constituency-select").select2({
	  data: constData
	});

	$(".constituency-select").val(constituency).change();

	$(".state-select").on("change", function(d){
		$('#margin-switch-div').css('display', 'none');
		$('#map-switch-div').css('display', 'none');

		state = $(this).val();

		constList = Object.keys(marginData[state]);
		var constData = [];
		for(var i in constList){
			constData.push({
				id: constList[i],
				text: constList[i]
			});
		}

		constituency = constList[0];
		$(".constituency-select").empty();
		$(".constituency-select").select2({
		  data: constData
		});
		$(".constituency-select").val(constituency).change();

		$('.margin-switch').off('change');

		createMarginVis(state);
		createMapVis(state);
	});

	createMarginVis(state);
	createMapVis(state);
	createIndiaVis();
}


function createMarginVis(s){
    if(margin_svg){
        margin_svg.remove();
    }
    if(margin_map_svg){
        margin_map_svg.remove();
    }

    queue()
        .defer(d3.json, 'map/map/' + s + '.json')
        .await(makeMargin);
}

function makeMargin(error, mapSatellite){
	// Create the visualization
	var map_width = 10/12*document.body.clientWidth - 50;
  	var map_height = 400;
	margin_svg = d3.select("#margin").append("svg")
        .attr("width", map_width + 50)
        .attr("height", map_height);

    for(var i in yearList){
    	margin_svg.append('text')
    		.attr('x', 10)
    		.attr('y', 350 - 75*i)
    		.style("font-size", "20px")
    		.text(yearList[i]);
    }

    margin_svg.append('text')
		.attr('x', 10)
		.attr('y', 350 - 75*4)
		.attr('fill', "#D3D3D3")
		.style("font-size", "20px")
		.text(2019);

    var MapGeoObj = topojson.feature(mapSatellite, mapSatellite.objects.state);
    var projectionMap = d3.geoMercator()
        .fitSize([map_width*0.8, map_height], MapGeoObj);
    var path = d3.geoPath().projection(projectionMap);
    var map_width = 10/12*document.body.clientWidth;
    var map_height = 500;
    margin_map_svg = d3.select("#margin-map").append("svg")
        .attr("width", map_width)
        .attr("height", map_height);

    var mapSelectedConst;
    getMarginLegendList();

    var legend_margin = {
        left: map_width*0.8,
        top: 40
    }

    legend_svg = margin_map_svg.append('g')
    	.attr("transform", "translate("+ legend_margin.left +", "+ legend_margin.top +")");
    createLegend();

    var map = margin_map_svg.selectAll("path")
        .data(MapGeoObj.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'map-margin-const')
        .style('fill', function(d) {
        	if(d.properties.PC_NAME){
        		const constName = d.properties.PC_NAME.toUpperCase();
        		if(marginData[state][constName]){
	        		if(marginData[state][constName][latestYear]){
	        			const val = (margin_mode === "votes") ? marginData[state][constName][latestYear].Margin : Math.round(marginData[state][constName][latestYear].Margin/marginData[state][constName][latestYear]["Total Votes"]*10000)/100
	        			return mapColour(val)
	        		}
	        	}
        	}

        	return unknownColor;
        })
        .attr('stroke-width', function(d){
        	if(d.properties.PC_NAME){
        		if(constituency === d.properties.PC_NAME.toUpperCase()){
	        		mapSelectedConst = d3.select(this);
	        		return "2px";
	        	}
        	}
        	return '0.3px';
        })
        .style('stroke', 'black')
        .on('mouseover', function(d){
        	if(d.properties.PC_NAME){
	        	if(mapSelectedConst){
	        		mapSelectedConst.attr("stroke-width", "0.3px");
	        	}
	        	mapSelectedConst = d3.select(this);
	        	mapSelectedConst.attr("stroke-width", "2px");
	        	const constName = d.properties.PC_NAME.toUpperCase();
	        	if(constList.indexOf(constName) > -1){
	        		constituency = constName;
	        		updatePath();
		    		updateTooltipText(0);
		    		$(".constituency-select").val(constituency).change();
	        	} else{ //hide path

	        	}
        	}

        });


	$('#margin-switch-div').css('display', 'block');

    // get axis scales
    var scales = {}
    getMarginScales();

    var margin_cards = margin_svg.append('g')
    	.attr('width', map_width)
    	.attr('height', map_width)
    	.attr('transform', "translate(100, 0)");

    var dlist = d3.entries(marginData[state]);
	var margin = margin_cards.selectAll("circle")
    	.data(dlist)
    	.enter();


    var highlight_line = margin_cards.append("path")
        .datum(create_path(constituency))
        .attr("class", "line")
        .attr("d", d3.line()
            //.curve(d3.curveBundle.beta(1))
            .curve(d3.curveLinear)
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            })
        )
        .style('stroke', '#c0c5ce')
        .style('opacity', 0.8);

	var margin_circles = {};
	var margin_tooltip = {};
	for(var i in yearList){
		margin_tooltip[yearList[i]] = margin_cards.append('g');
		margin_tooltip[yearList[i]].append('text')
			.attr('x', 0)
			.attr('y', 342 - i*75 - 10)
			.text("margin")
			.attr('text-anchor', 'end')
			.style('fill', "#696969")
			.attr('font-size', '20px')
			.attr('class', "margin");
		margin_tooltip[yearList[i]].append('text')
			.attr('x', 0)
			.attr('y', 342 - i*75 - 10)
			.text("winner")
			.attr('text-anchor', 'start')
			.attr('font-size', '20px')
			.attr('class', "winner");
		margin_tooltip[yearList[i]].append('text')
			.attr('x', 0)
			.attr('y', 342 - i*75 + 10)
			.text("runner")
			.attr('text-anchor', 'start')
			.attr('font-size', '20px')
			.attr('alignment-baseline', 'hanging')
			.attr('dominant-baseline', 'hanging')
			.attr('class', "runner");
	}

	updateTooltipText(0);

    for(var i in yearList){
	    margin_circles[yearList[i]] = margin.append('circle')
	    	.attr("cx", function(d){
		    		if(d["value"][yearList[i]]){
		    			if(margin_mode === "votes"){
		    				return scales[yearList[i]](d["value"][yearList[i]].Margin);
		    			} else{
		    				return scales[yearList[i]](d["value"][yearList[i]].Margin / d["value"][yearList[i]]["Total Votes"]);
		    			}
		    		}
		    		return 0;
		    })
	    	.attr("cy", 342 - i*75)
	    	.attr('r', function(d){
				if(d["value"][yearList[i]]){
	    			return 7;
	    		}
				return 0;
	    	})
	    	.attr('opacity', 0.7)
	    	.attr('fill', function(d){
	    		if(d["value"][yearList[i]]){
	    			if(partyColors[d["value"][yearList[i]].Party]){
	    				return partyColors[d["value"][yearList[i]].Party];
	    			}
	    		}
	    		return unknownColor;
	    	})
	    	.on('mouseover', function(d){
	    		constituency = d.key;
	    		updatePath();
	    		updateTooltipText(0);
	    		highlightMapPath();
	    		$(".constituency-select").val(constituency).change();
	    	});
    }

    $('.margin-switch').on('change', function(d){
    	margin_mode = ((this.checked) ? "percentage" : "votes");
    	getMarginScales();
        updateTooltipText(500);

	    for(var i in yearList){
		    margin_circles[yearList[i]]
		    	.transition()
		    	.duration(500)
		    	.attr("cx", function(d){
		    		if(d["value"][yearList[i]]){
		    			if(margin_mode === "votes"){
		    				return scales[yearList[i]](d["value"][yearList[i]].Margin);
		    			} else{
		    				return scales[yearList[i]](d["value"][yearList[i]].Margin / d["value"][yearList[i]]["Total Votes"]);
		    			}
		    		}
		    		return 0;
		    	});
	    }

	    highlight_line.datum(create_path(constituency))
            .transition()
            .duration(500)
            .attr("d", d3.line()
	            .x(function(d) {
	                return d[0];
	            })
	            .y(function(d) {
	                return d[1];
	            })
           	);

       	getMarginLegendList();
	    createLegend();

	    map.transition().duration(500)
	    	.style('fill', function(d) {
        	const constName = d.properties.PC_NAME.toUpperCase();
        	if(marginData[state][constName]){
        		if(marginData[state][constName][latestYear]){
        			const val = (margin_mode === "votes") ? marginData[state][constName][latestYear].Margin : Math.round(marginData[state][constName][latestYear].Margin/marginData[state][constName][latestYear]["Total Votes"]*10000)/100
        			return mapColour(val)
        		}
        	}
        	return unknownColor;
        })
	    });


    $(".constituency-select").on("change", function(d){
    	constituency = $(this).val();
    	updatePath();
	    updateTooltipText(0);
	    highlightMapPath();
    });

    function getMarginScales(){
    	 for(var i in yearList){
	    	if(marginData[state][Object.keys(marginData[state])[0]][yearList[i]]){
	    		var val = ((margin_mode === "votes") ?
	    				marginData[state][Object.keys(marginData[state])[0]][yearList[i]].Margin : marginData[state][Object.keys(marginData[state])[0]][yearList[i]].Margin/marginData[state][Object.keys(marginData[state])[0]][yearList[i]]["Total Votes"]);
	   			var domain = [val, val];
	    	}

	    	for(var j in marginData[state]){
	    		if(marginData[state][j][yearList[i]]){
	    			var val = ((margin_mode === "votes") ?
	    				marginData[state][j][yearList[i]].Margin : marginData[state][j][yearList[i]].Margin/marginData[state][j][yearList[i]]["Total Votes"]);
	    			if(domain[0] >= val){
		    			domain[0] = val;
		    		}
		    		if(domain[1] <= val){
		    			domain[1] = val;
		    		}
	    		}
	    	}

	    	if(domain){
	    		scales[yearList[i]] = d3.scaleLinear().domain(domain).range([0, map_width*0.9]);
	    	} else{
	    		scales[yearList[i]] = d3.scaleLinear().domain([0,0]).range([0, map_width*0.9]);
	    	}
	    }
    }

    function create_path(d){
    	var path_array = [];

    	for(var i=0; i < yearList.length; i++){
    		if(marginData[state][constituency]){
	    		if(marginData[state][constituency][yearList[i]]){
	    			if(marginData[state][constituency][yearList[i - 1]]){
		    			if(margin_mode === "votes"){
		    				path_array.push([scales[yearList[i]](marginData[state][constituency][yearList[i]].Margin), 342 - i*75 + 75/2]);
				    	} else{
		    				path_array.push([scales[yearList[i]](marginData[state][constituency][yearList[i]].Margin/marginData[state][constituency][yearList[i]]["Total Votes"]), 342 - i*75 + 75/2]);
				    	}
		    		}

	    			if(margin_mode === "votes"){
	    				path_array.push([scales[yearList[i]](marginData[state][constituency][yearList[i]].Margin), 342 - i*75]);
			    	} else{
	    				path_array.push([scales[yearList[i]](marginData[state][constituency][yearList[i]].Margin/marginData[state][constituency][yearList[i]]["Total Votes"]), 342 - i*75]);
			    	}

		    		if(marginData[state][constituency][yearList[i + 1]]){
		    			if(margin_mode === "votes"){
		    				path_array.push([scales[yearList[i]](marginData[state][constituency][yearList[i]].Margin), 342 - i*75 - 75/2]);
				    	} else{
		    				path_array.push([scales[yearList[i]](marginData[state][constituency][yearList[i]].Margin/marginData[state][constituency][yearList[i]]["Total Votes"]), 342 - i*75 - 75/2]);
				    	}
		    		}
	    		}
	    	}
    	}
    	return path_array;
    }

    function updateTooltipText(t){
    	var present = false;
    	var margin = 0;
    	var total = 0;
    	for(var i=0; i < yearList.length; i++){
    		present = false;
    		if(marginData[state][constituency]){
	    		if(marginData[state][constituency][yearList[i]]){
	    			present = true;
	    			margin = marginData[state][constituency][yearList[i]].Margin;
	    			total = marginData[state][constituency][yearList[i]]["Total Votes"];
	    			if(margin_mode === "votes"){
	    				margin_tooltip[yearList[i]].select(".margin")
	    					.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin) - 7)
		    				.text(margin.toLocaleString())
		    			margin_tooltip[yearList[i]].select(".winner")
		    				.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin) + 7)
	    					.style('fill', partyColors[marginData[state][constituency][yearList[i]].Party])
	    					.text(marginData[state][constituency][yearList[i]].Party)
	    				margin_tooltip[yearList[i]].select(".runner")
	    					.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin) + 7)
	    					.style('fill', partyColors[marginData[state][constituency][yearList[i]].Runner])
	    					.text(marginData[state][constituency][yearList[i]].Runner)
			    	} else{
						margin_tooltip[yearList[i]].select(".margin")
							.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin/total) - 7)
	    					.text(Math.round(margin/total*10000)/100);
	    				margin_tooltip[yearList[i]].select(".winner")
	    					.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin/total) + 7)
	    					.style('fill', partyColors[marginData[state][constituency][yearList[i]].Party])
	    					.text(marginData[state][constituency][yearList[i]].Party)
	    				margin_tooltip[yearList[i]].select(".runner")
	    					.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin/total) + 7)
	    					.style('fill', partyColors[marginData[state][constituency][yearList[i]].Runner])
	    					.text(marginData[state][constituency][yearList[i]].Runner)
	    			}

	    		}
	    	}
	    	if(!present){
				margin_tooltip[yearList[i]].select(".margin")
					.text("");
				margin_tooltip[yearList[i]].select(".winner")
					.text("");
				margin_tooltip[yearList[i]].select(".runner")
					.text("");
	    	}
    	}
    }

    function updatePath(){
	    highlight_line.datum(create_path(constituency))
            .attr("d", d3.line()
                    .x(function(d) {
                        return d[0];
                    })
                    .y(function(d) {
                        return d[1];
                    })
                );
    }

    function highlightMapPath(){
    	map.transition().duration(0)
    		.attr('stroke-width', function(d){
    			if(d.properties.PC_NAME){
    				if(constituency === d.properties.PC_NAME.toUpperCase()){
	    				mapSelectedConst = d3.select(this);
	    				return '2px';
	    			}
    			}

    			return '0.3px';
    		})
    }

    function getMarginLegendList(){
    	var marginValueList = [];
    	var val = 0;
    	var p = 0;
    	for(var j in marginData[state]){
    		if(marginData[state][j][latestYear]){
    			val = (margin_mode === "votes") ? marginData[state][j][latestYear].Margin : Math.round(marginData[state][j][latestYear].Margin/marginData[state][j][latestYear]["Total Votes"]*10000)/100
    			if(Math.trunc(val).toString().length > 2){
    				p = Math.pow(10, Math.trunc(val).toString().length - 2)
    				val = Math.ceil(val / p) * p;
    			}
    			marginValueList.push(val);
    		}
    	}

    	marginValueList.sort(function(a, b){return b - a});
    	marginLegendList = [];

    	var vals = Math.floor(marginValueList.length/marginLegendNumber);
    	if(vals === 0){
    		vals = 1;
    	}
    	for(var i = 1; i < marginLegendNumber - 1; i++){
    		if(marginValueList[i * vals]){
    			marginLegendList.push(marginValueList[i * vals]);
    		}
    	}
    }

    function createLegend(){
    	legend_svg.remove()

    	legend_svg = margin_map_svg.append('g')
    		.attr("transform", "translate("+ legend_margin.left +", "+ legend_margin.top +")");

    	legend_svg.append('text')
    		.attr('x', 0)
    		.attr('y', 0)
    		.attr('font-size', '30px')
    		.text('Legend')

    	for(var i in marginLegendList){
    		legend_svg.append('circle')
    			.attr('cx', 10)
    			.attr('cy', i * 24 + 30)
    			.attr('r', 10)
    			.attr('fill', function(){
    				if(margin_mode === "votes"){
    					return margin_colours_votes[i];
    				}
    				return margin_colours_percentage[i];
    			});
    		legend_svg.append('text')
    			.attr('x', function(){
    				if(i == 0 || i == marginLegendList.length - 1){
    					return 25;
    				}
    				return 25 + 10;
    			})
    			.attr('y', i * 24 + 35)
    			.attr('font-size', "15px")
    			.text(function(){
    				var str = "";
    				if(i == 0){
    					str += "> "
    				} else if(i == marginLegendList.length - 1){
    					str += "< "
    				}
    				str += marginLegendList[i].toLocaleString();
    				return str;
    			})
    	}
    }

    function mapColour(d){
    	if(d >=  marginLegendList[0]){
			if(margin_mode === "votes"){
					return margin_colours_votes[0];
				}
				return margin_colours_percentage[0];
		}

    	for(var i = 0; i < marginLegendList.length - 1; i++){
    		if(d >=  marginLegendList[i + 1] && d <=  marginLegendList[i]){
    			if(margin_mode === "votes"){
    					return margin_colours_votes[i];
    				}
    				return margin_colours_percentage[i];
    		}
    	}

    	if(margin_mode === "votes"){
			return margin_colours_votes[marginLegendNumber - 3];
		}
    	return margin_colours_percentage[marginLegendNumber - 3];

    }
}
