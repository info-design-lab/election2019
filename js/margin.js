var margin_mode = "votes";

queue()
    .defer(d3.json, 'data/margin/margin.json')
    .defer(d3.json, 'data/partyColors.json')
    .await(makeMargin);

function makeMargin(error, data, partyColors){
	var map_width = $('#margin').width();
    var map_height = 400;

	var margin_svg = d3.select("#margin").append("svg")
        .attr("width", map_width)
        .attr("height", map_height);
    var state = "MAHARASHTRA";

    for(var i in yearList){
    	margin_svg.append('text')
    		.attr('x', 10)
    		.attr('y', 300 - 50*i)
    		.style("font-size", "20px")
    		.text(yearList[i]);
    }

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

	var margin_circles = {};
    for(var i in yearList){
	    margin_circles[yearList[i]] = margin.append('circle')
	    	.attr("cx", function(d){
	    		if(d["value"][yearList[i]]){
	    			return scales[yearList[i]](d["value"][yearList[i]].Margin);
	    		}
	    		return 0;
	    	})
	    	.attr("cy", 292 - i*50)
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
	    	});
    }

    $('.margin-switch').on('change', function(d){
    	margin_mode = ((this.checked) ? "percentage" : "votes");
    	getMarginScales();

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
	    	scales[yearList[i]] = d3.scaleLinear().domain(domain).range([0, 1000]);
	    }

    }
}