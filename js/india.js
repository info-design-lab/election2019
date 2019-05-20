var india_svg, india_legend_svg, india_yearSliderSVG, india_tooltip_svg;
var india_mode = "map";

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

function makeIndiaVis(error, data2014, data2019, partyColors, mapCarto, mapSatellite){
  	if(error){
  		console.log(error);
  	}

    $('#india-switch-div').css('display', 'block');

    // In your Javascript (external .js resource or <script> tag)
    $('.dropdown').select2();

    partyColors = partyColors;

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
        .attr("x", 100)
        .attr("y", 100)
        .attr('font-size', "50px")
        .text("2014")

    india2.append("text")
        .attr("x", 100)
        .attr("y", 100)
        .attr('font-size', "50px")
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
        .attr('class', 'india-margin-const')
        .style('fill', function(d) {
            if(india_mode == "map"){
                    if(data2014[d.properties.ST_CODE]){
                        if(partyColors[data2014[d.properties.ST_CODE][d.properties.PC_CODE]["Front"]]){
                            return partyColors[data2014[d.properties.ST_CODE][d.properties.PC_CODE]["Front"]];
                    }
                }
                return unknownColor;
            }

            if(data2014[constName(d)]){
                return getPartyColor(data2014[constName(d)].Party)
            }
            return unknownColor;
        })
        .attr('stroke-width', '0.3px')
        .style('stroke', 'black')
        .on('mouseover', function(d){
            if(!rankOverlay){
                d3.select(this).attr("stroke-width", "2px");
                map_tooltip.style("visibility", "visible");
            }
        })
        .on("mousemove", function(d) {
            mouse = d3.mouse(this);
            return map_tooltip.style("top", (mouse[1] + 0) + "px").style("left", (mouse[0] + 30) + "px");
        })
        .on('mouseout', function(d){
            d3.select(this).attr("stroke-width", "0.3px");
            rankOverlay = false;
            map_tooltip.style("visibility", "hidden");
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
        .attr('class', 'india-margin-const')
        .style('fill', function(d) {
            if(india_mode == "map"){
                    if(data2019[d.properties.ST_CODE]){
                        if(partyColors[data2019[d.properties.ST_CODE][d.properties.PC_CODE]["Front"]]){
                            return partyColors[data2019[d.properties.ST_CODE][d.properties.PC_CODE]["Front"]];
                    }
                }
                return unknownColor;
            }

            if(data2019[constName(d)]){
                return getPartyColor(data2019[constName(d)].Party)
            }
            return unknownColor;
        })
        .attr('stroke-width', '0.3px')
        .style('stroke', 'black')
        .on('mouseover', function(d){
            if(!rankOverlay){
                d3.select(this).attr("stroke-width", "2px");
                map_tooltip.style("visibility", "visible");
            }
        })
        .on("mousemove", function(d) {
            mouse = d3.mouse(this);
            return map_tooltip.style("top", (mouse[1] + 0) + "px").style("left", (mouse[0] + 30) + "px");
        })
        .on('mouseout', function(d){
            d3.select(this).attr("stroke-width", "0.3px");
            rankOverlay = false;
            map_tooltip.style("visibility", "hidden");
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

    //createPartyLegend();


	function arrayRemoveElement(array, e){
        var index = array.indexOf(e);
        if (index > -1) {
          array.splice(index, 1);
        }
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
        if(partyColors[party]){
            return partyColors[party];
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
