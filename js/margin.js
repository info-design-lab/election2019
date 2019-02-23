var margin_mode = "votes";
var state = "MAHARASHTRA";
var constituency = "RAMTEK";
var constList = [];

queue()
    .defer(d3.json, 'data/margin/margin.json')
    .defer(d3.json, 'data/partyColors.json')
    .defer(d3.json, 'map/map/MH.json')
    .await(makeMargin);

function makeMargin(error, data, partyColors, mapSatellite){
	var map_width = 10/12*document.body.clientWidth;
    var map_height = 400;
	var margin_svg = d3.select("#margin").append("svg")
        .attr("width", map_width)
        .attr("height", map_height);

    constList = Object.keys(data[state]);
    for(var i in yearList){
    	margin_svg.append('text')
    		.attr('x', 10)
    		.attr('y', 350 - 75*i)
    		.style("font-size", "20px")
    		.text(yearList[i]);
    }

    var MapGeoObj = topojson.feature(mapSatellite, mapSatellite.objects.MH);
    var projectionMap = d3.geoMercator()
        .fitSize([map_width, map_height], MapGeoObj);
    var path = d3.geoPath().projection(projectionMap);
    var map_width = 10/12*document.body.clientWidth;
    var map_height = 500;
    var map_svg = d3.select("#margin-map").append("svg")
        .attr("width", map_width)
        .attr("height", map_height);

    var mapSelectedConst;
    var map = map_svg.selectAll("path")
        .data(MapGeoObj.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'map-margin-const')
        .style('fill', function(d) {
        	return "white";
        })
        .attr('stroke-width', function(d){
        	if(constituency === d.properties.PC_NAME.toUpperCase()){
        		mapSelectedConst = d3.select(this);
        		return "2px";
        	}
        	return '0.3px';
        })
        .style('stroke', 'black')
        .on('mouseover', function(d){
        	mapSelectedConst.attr("stroke-width", "0.3px"); 
        	mapSelectedConst = d3.select(this);
        	mapSelectedConst.attr("stroke-width", "2px");
        	const constName = d.properties.PC_NAME.toUpperCase();
        	if(constList.indexOf(constName) > -1){
        		constituency = constName;
        		updatePath();
	    		updateTooltipText(0);
        	} else{ //hide path

        	}
        });

    // get axis scales
    var scales = {}
    getMarginScales();

    var margin_cards = margin_svg.append('g')
    	.attr('width', map_width)
    	.attr('height', map_width)
    	.attr('transform', "translate(100, 0)");

    var dlist = d3.entries(data[state]);
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
			.attr('class', "runner");
	}

	updateTooltipText(0);

    for(var i in yearList){
	    margin_circles[yearList[i]] = margin.append('circle')
	    	.attr("cx", function(d){
	    		if(d["value"][yearList[i]]){
	    			return scales[yearList[i]](d["value"][yearList[i]].Margin);
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
    });

    function getMarginScales(){
    	 for(var i in yearList){
	    	if(data[state][Object.keys(data[state])[0]][yearList[i]]){
	    		var val = ((margin_mode === "votes") ? 
	    				data[state][Object.keys(data[state])[0]][yearList[i]].Margin : data[state][Object.keys(data[state])[0]][yearList[i]].Margin/data[state][Object.keys(data[state])[0]][yearList[i]]["Total Votes"]);
	   			var domain = [val, val];
	    	}

	    	for(var j in data[state]){
	    		if(data[state][j][yearList[i]]){
	    			var val = ((margin_mode === "votes") ? 
	    				data[state][j][yearList[i]].Margin : data[state][j][yearList[i]].Margin/data[state][j][yearList[i]]["Total Votes"]);
	    			if(domain[0] >= val){
		    			domain[0] = val;
		    		}
		    		if(domain[1] <= val){
		    			domain[1] = val;
		    		}
	    		}
	    	}
	    	scales[yearList[i]] = d3.scaleLinear().domain(domain).range([0, 900]);
	    }
    }

    function create_path(d){
    	var path_array = [];
    	
    	for(var i=0; i < yearList.length; i++){
    		if(data[state][constituency]){
	    		if(data[state][constituency][yearList[i]]){
	    			if(data[state][constituency][yearList[i - 1]]){
		    			if(margin_mode === "votes"){
		    				path_array.push([scales[yearList[i]](data[state][constituency][yearList[i]].Margin), 342 - i*75 + 75/2]);
				    	} else{
		    				path_array.push([scales[yearList[i]](data[state][constituency][yearList[i]].Margin/data[state][constituency][yearList[i]]["Total Votes"]), 342 - i*75 + 75/2]);
				    	}
		    		}

	    			if(margin_mode === "votes"){
	    				path_array.push([scales[yearList[i]](data[state][constituency][yearList[i]].Margin), 342 - i*75]);
			    	} else{
	    				path_array.push([scales[yearList[i]](data[state][constituency][yearList[i]].Margin/data[state][constituency][yearList[i]]["Total Votes"]), 342 - i*75]);
			    	}

		    		if(data[state][constituency][yearList[i + 1]]){
		    			if(margin_mode === "votes"){
		    				path_array.push([scales[yearList[i]](data[state][constituency][yearList[i]].Margin), 342 - i*75 - 75/2]);
				    	} else{
		    				path_array.push([scales[yearList[i]](data[state][constituency][yearList[i]].Margin/data[state][constituency][yearList[i]]["Total Votes"]), 342 - i*75 - 75/2]);
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
    		if(data[state][constituency]){
	    		if(data[state][constituency][yearList[i]]){
	    			present = true;
	    			margin = data[state][constituency][yearList[i]].Margin;
	    			total = data[state][constituency][yearList[i]]["Total Votes"];
	    			if(margin_mode === "votes"){
	    				margin_tooltip[yearList[i]].select(".margin")
	    					.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin) - 7)
		    				.text(margin)
		    			margin_tooltip[yearList[i]].select(".winner")
		    				.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin) + 7)
	    					.style('fill', partyColors[data[state][constituency][yearList[i]].Party])
	    					.text(data[state][constituency][yearList[i]].Party)
	    				margin_tooltip[yearList[i]].select(".runner")
	    					.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin) + 7)
	    					.style('fill', partyColors[data[state][constituency][yearList[i]].Runner])
	    					.text(data[state][constituency][yearList[i]].Runner)
			    	} else{
						margin_tooltip[yearList[i]].select(".margin")
							.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin/total) - 7)
	    					.text(Math.round(margin/total*10000)/100);
	    				margin_tooltip[yearList[i]].select(".winner")
	    					.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin/total) + 7)
	    					.style('fill', partyColors[data[state][constituency][yearList[i]].Party])
	    					.text(data[state][constituency][yearList[i]].Party)
	    				margin_tooltip[yearList[i]].select(".runner")
	    					.transition().duration(t)
	    					.attr('x', scales[yearList[i]](margin/total) + 7)
	    					.style('fill', partyColors[data[state][constituency][yearList[i]].Runner])
	    					.text(data[state][constituency][yearList[i]].Runner)		    	
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
    			if(constituency === d.properties.PC_NAME.toUpperCase()){
    				mapSelectedConst = d3.select(this);
    				return '2px';
    			}
    			return '0.3px';
    		})
    }


}