var india_svg, india_legend_svg, india_yearSliderSVG, india_tooltip_svg;
var india_mode = "cartogram";

india_tooltip = d3.select("#india")
    .append("div")
    .attr('class', 'd3-tip')
    .attr("id", "india-tooltip");

function createIndiaVis(s){
    if(india_svg){
        india_svg.remove();
    }
    if(india_legend_svg){
        india_legend_svg.remove();
    }

    $('.india-switch').off('change');
    queue()
        .defer(d3.json, 'data/india/india2014.json')
        .defer(d3.json, 'data/india/india2019.json')
        .defer(d3.json, 'data/frontColors.json')
        .defer(d3.json, 'map/india/cartogram.json')
        .defer(d3.json, 'map/india/india.json')
        .await(makeIndiaVis);
}

function makeIndiaVis(error, data2014, data2019, frontColors, mapCarto, mapSatellite){
  	if(error){
  		console.log(error);
  	}

    $('#india-switch-div').css('display', 'block');

    // In your Javascript (external .js resource or <script> tag)
    $('.dropdown').select2();

    var uncheckedParties = [];
    // Create Map
    var india_width = 0.4*document.body.clientWidth;
    var india_height = india_width*0.8;

    var MapGeoObj = topojson.feature(mapSatellite, mapSatellite.objects.state);
    var projectionMap = d3.geoMercator()
        .fitSize([india_width, india_height], MapGeoObj);

    var path = d3.geoPath().projection(projectionMap);

    var cartoMargin = {
    	x: 0,
    	y: 0,
    }

    var legend_data2014 = {};
    var legend_data2019 = {};
    for(i in frontColors){
        legend_data2014[i] = 0;
        legend_data2019[i] = 0;
    }

    var screenScaleX = d3.scaleLinear().domain([0, 2560]).range([0, document.body.clientWidth]);
    var screenScaleY = function(d){ return d*document.body.clientWidth/2560 };

    // set scale according to the size of window
    var CartoScale = 0.0005*document.body.clientWidth - 0.0046;
    updateCartoMargin(mapCarto.features, CartoScale);

    var CartoLineFunction = d3.line()
        .x(function(d) { return (india_width/2 - cartoMargin.x) + d[0]*CartoScale; })
        .y(function(d) { return (india_height/2 - cartoMargin.y) + d[1]*CartoScale; });

    india_svg = d3.select("#india").append("svg")
        .attr("width", document.body.clientWidth)
        .attr("height", document.body.clientWidth*0.32);

    var india1 = india_svg.append("g");
    var india2 = india_svg.append("g").attr("transform", "translate(" + (0.5*document.body.clientWidth) + ", 0)")

    // Add year name
    india1.append("text")
        .attr("x", 0.0391*document.body.clientWidth)
        .attr("y", 100)
        .attr('font-size', Math.round(0.0195*document.body.clientWidth) + "px")
        .attr('fill', '#585858')
        .text("2014")

    india2.append("text")
        .attr("x", 0.0391*document.body.clientWidth)
        .attr("y", 100)
        .attr('font-size', Math.round(0.0195*document.body.clientWidth) + "px")
        .attr('fill', '#585858')
        .text("2019")

    // Create maps
    var map1 = india1.selectAll("path")
        .data(
            ((india_mode === "map") ? MapGeoObj.features : mapCarto.features)
            )
        .enter()
        .append("path")
        .attr("d", function(d){
                    if((india_mode === "map")){
                        return path(d);
                    }
                    var array = d.geometry.coordinates[0];
                    array.push(array[0]);
                    return CartoLineFunction(array);
                }
            )
        .attr("class", function(d){
            return d.id
        })
        .style('fill', function(d) {
            if(india_mode == "map"){
                var ST_CODE = d.properties.ST_CODE;
                var PC_CODE = d.properties.PC_CODE;

            } else{
                var ST_CODE = d.id.split('-')[0];
                var PC_CODE = parseInt(d.id.split('-')[1]);
            }

            if(data2014[ST_CODE]){
                if(frontColors[data2014[ST_CODE][PC_CODE]["Front"]]){
                    legend_data2014[data2014[ST_CODE][PC_CODE]["Front"]] += 1;
                    return frontColors[data2014[ST_CODE][PC_CODE]["Front"]]
                }
            }

            return unknownColor;
        })
        .attr('stroke-width', '0.3px')
        .style('stroke', 'black')
        .on('mouseover', function(d){
            d3.selectAll('.' + this.className.baseVal).attr("stroke-width", "2px");
            if(india_mode == "map"){
                var ST_CODE = d.properties.ST_CODE;
                var PC_CODE = d.properties.PC_CODE;

            } else{
                var ST_CODE = d.id.split('-')[0];
                var PC_CODE = parseInt(d.id.split('-')[1]);
            }

            if(data2014[ST_CODE]){
                if(data2014[ST_CODE][PC_CODE]["Front"]){
                    createSimpleTooltip(data2014[ST_CODE][PC_CODE]);
                    india_tooltip.style("visibility", "visible");
                }
            }
        })
        .on("mousemove", function(d) {
            mouse = d3.mouse(this);
            return india_tooltip.style("top", (mouse[1] + 0) + "px").style("left", (mouse[0] + 30) + "px");
        })
        .on('mouseout', function(d){
            d3.selectAll('.' + this.className.baseVal).attr("stroke-width", "0.3px");
            india_tooltip.style("visibility", "hidden");
        });

    var map2 = india2.selectAll("path")
        .data(
            ((india_mode === "map") ? MapGeoObj.features : mapCarto.features)
            )
        .enter()
        .append("path")
        .attr("d", function(d){
                    if((india_mode === "map")){
                        return path(d);
                    }
                    var array = d.geometry.coordinates[0];
                    array.push(array[0]);
                    return CartoLineFunction(array);
                }
            )
        .attr("class", function(d){
            return d.id
        })
        .style('fill', function(d) {
            if(india_mode == "map"){
                var ST_CODE = d.properties.ST_CODE;
                var PC_CODE = d.properties.PC_CODE;
            } else{
                var ST_CODE = d.id.split('-')[0];
                var PC_CODE = parseInt(d.id.split('-')[1]);
            }

            if(data2019[ST_CODE]){
                if(frontColors[data2019[ST_CODE][PC_CODE]["Front"]]){
                    legend_data2019[data2019[ST_CODE][PC_CODE]["Front"]] += 1;
                    return frontColors[data2019[ST_CODE][PC_CODE]["Front"]]
                }
            }

            return unknownColor;
        })
        .attr('stroke-width', '0.3px')
        .style('stroke', 'black')
        .on('mouseover', function(d){
            d3.selectAll('.' + this.className.baseVal).attr("stroke-width", "2px");
            if(india_mode == "map"){
                var ST_CODE = d.properties.ST_CODE;
                var PC_CODE = d.properties.PC_CODE;

            } else{
                var ST_CODE = d.id.split('-')[0];
                var PC_CODE = parseInt(d.id.split('-')[1]);
            }

            if(data2019[ST_CODE]){
                if(data2019[ST_CODE][PC_CODE]["Front"]){
                    createSimpleTooltip(data2019[ST_CODE][PC_CODE]);
                    india_tooltip.style("visibility", "visible");
                }
            }
        })
        .on("mousemove", function(d) {
            mouse = d3.mouse(this);
            return india_tooltip.style("top", (mouse[1] + 0) + "px").style("left", (mouse[0] + 30 + 0.5*document.body.clientWidth) + "px");
        })
        .on('mouseout', function(d){
            d3.selectAll('.' + this.className.baseVal).attr("stroke-width", "0.3px");
            india_tooltip.style("visibility", "hidden");
        });

    var legend_width = 4/12*document.body.clientWidth;//$('#india-legend').width();
    var legend_height = 500;
    var legend_margin = {
        left: 100,
        top: 30
    }

    india_legend_svg = d3.select("#india-legend").append("svg")
        .attr("width", legend_width)
        .attr("height", legend_height);

    india_legend = india_legend_svg.append('g')
        .attr("transform", "translate("+ legend_margin.left +", "+ legend_margin.top +")");

    createPartyLegend();

    function createPartyLegend(){
        var fronts = Object.keys(legend_data2014)
        
        const h = 40;
        let font = 25

        var legend2014 = india1.append('g');
        for(i in fronts){
            legend2014.append("rect")
                .attr('x', screenScaleX(550 -  10))
                .attr('y', screenScaleY(50 + i*h))
                .attr('width', screenScaleX(150))
                .attr('fill', frontColors[fronts[i]])
                .attr('height', screenScaleY(h))

            legend2014.append("rect")
                .attr('x', screenScaleX(550 -  10))
                .attr('y', screenScaleY(50 + i*h))
                .attr('width', screenScaleX(150))
                .attr('fill', frontColors[fronts[i]])
                .attr('height', screenScaleY(h))

            legend2014.append("text")
                .attr('x', screenScaleX(550))
                .attr('y', screenScaleY(50 + i*h + h*0.5))
                .style('alignment-baseline', "middle")
                .style('dominant-baseline', 'middle')
                .style("fill", "white")
                .style("font-size", screenScaleY(font) + "px")
                .text(fronts[i])

            legend2014.append("text")
                .attr('x', screenScaleX(700))
                .attr('y', screenScaleY(50 + i*h + h*0.5))
                .style('alignment-baseline', "middle")
                .style('dominant-baseline', 'middle')
                .style("font-size", screenScaleY(font) + "px")
                .text(legend_data2014[fronts[i]])

            legend2014.append("rect")
                .attr('x', screenScaleX(550 -  10))
                .attr('y', screenScaleY(50 + i*h))
                .attr('width', screenScaleX(150))
                .attr('fill', "transparent")
                .attr('stroke', "#585858")
                .attr('stroke-width', "2px")
                .attr('height', screenScaleY(h))

            legend2014.append("rect")
                .attr('x', screenScaleX(550 -  10 + 150))
                .attr('y', screenScaleY(50 + i*h))
                .attr('width', screenScaleX(60))
                .attr('fill', "transparent")
                .attr('stroke', "#585858")
                .attr('stroke-width', "2px")
                .attr('height', screenScaleY(h))
        }
        
        var legend2019 = india2.append('g');
        for(i in fronts){
            legend2019.append("rect")
                .attr('x', screenScaleX(550 -  10))
                .attr('y', screenScaleY(50 + i*h))
                .attr('width', screenScaleX(150))
                .attr('fill', frontColors[fronts[i]])
                .attr('height', screenScaleY(h))

            legend2019.append("rect")
                .attr('x', screenScaleX(550 -  10))
                .attr('y', screenScaleY(50 + i*h))
                .attr('width', screenScaleX(150))
                .attr('fill', frontColors[fronts[i]])
                .attr('height', screenScaleY(h))

            legend2019.append("text")
                .attr('x', screenScaleX(550))
                .attr('y', screenScaleY(50 + i*h + h*0.5))
                .style('alignment-baseline', "middle")
                .style('dominant-baseline', 'middle')
                .style("fill", "white")
                .style("font-size", screenScaleY(font) + "px")
                .text(fronts[i])

            legend2019.append("text")
                .attr('x', screenScaleX(700))
                .attr('y', screenScaleY(50 + i*h + h*0.5))
                .style('alignment-baseline', "middle")
                .style('dominant-baseline', 'middle')
                .style("font-size", screenScaleY(font) + "px")
                .text(legend_data2019[fronts[i]])

            legend2019.append("rect")
                .attr('x', screenScaleX(550 -  10))
                .attr('y', screenScaleY(50 + i*h))
                .attr('width', screenScaleX(150))
                .attr('fill', "transparent")
                .attr('stroke', "#585858")
                .attr('stroke-width', "2px")
                .attr('height', screenScaleY(h))

            legend2019.append("rect")
                .attr('x', screenScaleX(550 -  10 + 150))
                .attr('y', screenScaleY(50 + i*h))
                .attr('width', screenScaleX(60))
                .attr('fill', "transparent")
                .attr('stroke', "#585858")
                .attr('stroke-width', "2px")
                .attr('height', screenScaleY(h))
        }
    }

	function arrayRemoveElement(array, e){
        var index = array.indexOf(e);
        if (index > -1) {
          array.splice(index, 1);
        }
    }

    function createSimpleTooltip(d){
        if(india_tooltip_svg){
            india_tooltip_svg.remove();
            india_tooltip_svg = d3.select("#india-tooltip").append("svg")
                .attr("width", 200)
                .attr("height", 80);
        } else{
            india_tooltip_svg = d3.select("#india-tooltip").append("svg")
                .attr("width", 200)
                .attr("height", 80);
        }

        india_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 20)
            .style("font-size", "10px")
            .style("fill", "black")
            .text('Front');

        india_tooltip_svg.append("text")
            .attr('x', 70)
            .attr('y', 20)
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .attr('fill', function(){
                if(frontColors[d["Front"]]){
                    return frontColors[d["Front"]]
                }
                return "black"
            })
            .text(d["Front"]);

        india_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 35)
            .style("font-size", "10px")
            .style("fill", "black")
            .text('Party');

        india_tooltip_svg.append("text")
            .attr('x', 70)
            .attr('y', 35)
            .style("font-size", "15px")
            .style("fill", "black")
            .text(d["Party"]);

        india_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 50)
            .style("font-size", "10px")
            .style("fill", "black")
            .text('Constituency');

        india_tooltip_svg.append("text")
            .attr('x', 70)
            .attr('y', 50)
            .style("font-size", "15px")
            .style("fill", "black")
            .text(d["Constituency"]);

        india_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 65)
            .style("font-size", "10px")
            .style("fill", "black")
            .text('State');

        india_tooltip_svg.append("text")
            .attr('x', 70)
            .attr('y', 65)
            .style("font-size", "15px")
            .style("fill", "black")
            .text(d["State"]);
    }

    $('.india-switch').on('change', function(d){
        india_mode = ((this.checked) ? "map" : "cartogram");
        //updateMap();
        map1.data(((india_mode === "map") ? MapGeoObj.features : mapCarto.features));
        map2.data(((india_mode === "map") ? MapGeoObj.features : mapCarto.features));
        transtionMap();
    });

    function constName(d){
        if(india_mode === "cartogram"){
            return d.id.toUpperCase();
        } else if(india_mode === "map"){
            return d.properties.PC_NAME.toUpperCase();
        }
    }

    function transtionMap(){
        map1.attr("d", function(d){
                    if((india_mode === "map")){
                        return path(d);
                    }
                    var array = d.geometry.coordinates[0];
                    array.push(array[0]);
                    return CartoLineFunction(array);
                }
            );
        map2.attr("d", function(d){
                    if((india_mode === "map")){
                        return path(d);
                    }
                    var array = d.geometry.coordinates[0];
                    array.push(array[0]);
                    return CartoLineFunction(array);
                }
            );
    }


    function createPath(d, xGap, yGap){
        var result = []
        for(var i in d){
            result.push([xGap*d[i][0], yGap*d[i][1]])
        }
        return result;
    }

    function getPartyColor(party){
        if(frontColors[party]){
            return frontColors[party];
        }
        return "#deebf7";
    }

    function unknownDataTooltip(d){
        if(map_tooltip_svg){
            map_tooltip_svg.remove();
        }

        map_tooltip_svg = d3.select("#india-tooltip").append("svg")
            .attr("width", 150)
            .attr("height", 30);

        map_tooltip_svg.append('text')
            .attr('x', 20)
            .attr('y', 20)
            .attr('font-size', '16px')
            .text('Data Unavailable')
    }

    function updateCartoMargin(data, scale){
    	// Updates the parameters of cartoMargin to centre it in the screen
    	var x = 0;
    	var y = 0;
    	var count = 0;

    	for(var i in data){
    		for(j in data[i].geometry.coordinates[0]){
    			x += data[i].geometry.coordinates[0][j][0]*scale;
    			y += data[i].geometry.coordinates[0][j][1]*scale;
    			count += 1;
    		}
    	}
    	x = x/count;
    	y = y/count;
    	cartoMargin.x = x;
    	cartoMargin.y = y;
    }
}
