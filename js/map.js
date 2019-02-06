queue()
    .defer(d3.json, 'data/election/MH.json')
    .defer(d3.json, 'data/partyColors.json')
    .defer(d3.json, 'map/cartogram/MH.json')
    .defer(d3.json, 'map/map/MH.json')
    .await(makeMap);

var map_tooltip = d3.select("#map")
    .append("div")
    .attr('class', 'd3-tip')
    .attr("id", "map-tooltip");
var map_tooltip_svg;

var unknownColor = "#a8a8a8";
var yearList = [1999, 2004, 2009, 2014, 2019];
var yearSliderMap = document.getElementById('year-slider-map');
var year = 2019; // Current Year
var map_legend;
var partyColors;

noUiSlider.create(yearSliderMap, {
    start: [year],
    step: 5,
    range: {
        'min': [1999],
        'max': [2019]
    },
    pips: {
        mode: 'values',
        values: yearList,
        density: 20
    }
});

function makeMap(error, data, partyColors, mapCarto, mapSatellite){
	if(error){
		console.log(error);
	}
    partyColors = partyColors;

    var uncheckedParties = [];
    // Create Map
    var map_width = $('#map').width();
    var map_height = map_width;
    //console.log(mapSatellite);
    var geo_obj = topojson.feature(mapSatellite, mapSatellite.objects.state);
    var projection = d3.geoMercator()
        .fitSize([map_width, map_height], geo_obj);
    var path = d3.geoPath().projection(projection);
    var map_svg = d3.select("#map").append("svg")
        .attr("width", map_width)
        .attr("height", map_height);
    var map = map_svg.selectAll("path")
        .data(geo_obj.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'map-margin-const')
        .attr("id", function(d){
          //console.log(d);
        })
        .style('fill', function(d) {
            if(data[year][d.properties.PC_NAME.toUpperCase()]){
                return partyColors[data[year][d.properties.PC_NAME.toUpperCase()].Party];
            }
            return unknownColor;
        })
        .attr('stroke-width', '0.3px')
        .style('stroke', 'black')
        .on('mouseover', function(d){
            d3.select(this).attr("stroke-width", "2px");
            if(data[year][d.properties.PC_NAME.toUpperCase()]){
                map_tooltip.style("visibility", "visible");
                createSimpleTooltip(d);
            }
        })
        .on("mousemove", function(d) {
            mouse = d3.mouse(this);
            return map_tooltip.style("top", (mouse[1] + 0) + "px").style("left", (mouse[0] + 30) + "px");
        })
        .on('mouseout', function(d){
            d3.select(this).attr("stroke-width", "0.3px"); 
            map_tooltip.style("visibility", "hidden");
        });

    var legend_width = $('#map-legend').width();
    var legend_height = 500;
    var legend_margin = {
        left: 100,
        top: 30
    }
    var legend_svg = d3.select("#map-legend").append("svg")
        .attr("width", legend_width)
        .attr("height", legend_height);

    map_legend = legend_svg.append('g')
        .attr("transform", "translate("+ legend_margin.left +", "+ legend_margin.top +")");

    yearSliderMap.noUiSlider.on('update', function(values, handle) {
        year = parseInt(values);
        updateMap();
        createPartyLegend();
    });

    function createPartyLegend(){
        // Create Party legend
        /*
        legend.append("text")
            .attr("x", 10)
            .attr('y', 10)
            .style("font-size", "40")
            .text("Summary")
        */
        map_legend.remove();
        
        map_legend = legend_svg.append('g')
            .attr("transform", "translate("+ legend_margin.left +", "+ legend_margin.top +")");

        var partiesData = getPartyList(data);  
        var total = 0;
        for(var i in partiesData){
            total = total + partiesData[i][1];
        }

        var legendParties = map_legend.selectAll("circle")
            .data(partiesData)
            .enter();

        legendParties.append("text")
            .attr('x', 10)
            .attr('y', function(d, i){
                return 25*i + 70;
            })
            .style("font-size", "20")
            .attr('fill', "#3f3f3f")
            .text(function(d){
                return d[0];
            });
        legendParties.append('circle')
            .attr('cx', -5)
            .attr("cy", function(d, i){
                return 25*i + 63;
            })
            .attr('r', 10)
            .attr('fill', function(d){
                if(partyColors[d[0]]){
                    return partyColors[d[0]];
                }
                return unknownColor;
            });
        legendParties.append('circle')
            .attr('cx', -5)
            .attr("cy", function(d, i){
                return 25*i + 63;
            })
            .attr('r', 8)
            .attr('fill', "white");
        legendParties.append('circle')
            .attr('cx', -5)
            .attr("cy", function(d, i){
                return 25*i + 63;
            })
            .attr('r', 6)
            .style("cursor", "pointer")
            .attr('fill', function(d){
                if(partyColors[d[0]]){
                    return partyColors[d[0]];
                }
                return unknownColor;
            })
            .on('click', function(d){
                if(uncheckedParties.indexOf(d[0]) < 0){
                    uncheckedParties.push(d[0]);
                    d3.select(this).attr('fill', 'white');
                }
                else{
                    arrayRemoveElement(uncheckedParties, d[0]);
                    if(partyColors[d[0]]){
                        d3.select(this).attr('fill', partyColors[d[0]]);
                    } else{
                        d3.select(this).attr('fill', unknownColor);
                    }
                }
                updateMap();
            });
        legendParties.append("text")
                .attr('x', -20)
                .attr('y', function(d, i){
                    return 25*i + 70;
                })
                .style("font-size", "20")
                .style("text-anchor", "end")
                .text(function(d){
                    return d[1];
                })
        map_legend.append("text")
            .attr('x', 10)
            .attr("y", 30)
            .style("font-size", "35")
            .attr("fill", "#939393")
            .text("Total Seats");
        map_legend.append("text")
            .attr('x', 0)
            .attr("y", 30)
            .style("font-size", "35")
            .style("text-anchor", "end")
            .text(total);    
    }
    function getPartyList(d){
        var list = {};
        for(var i in d[year]){
            if (list[d[year][i].Party]){
                list[d[year][i].Party] = list[d[year][i].Party] + 1;
            }
            else{
                list[d[year][i].Party] = 1;
            }
        }

        var l = []
        for(var i in list){
            l.push([i, list[i]]);
        }

        l.sort(function(a, b){
            return b[1] - a[1];
        })
        return l;
    }
	function arrayRemoveElement(array, e){
        var index = array.indexOf(e);
        if (index > -1) {
          array.splice(index, 1);
        }
    }
    function updateMap(){
        map_svg.selectAll("path").transition().duration(500).style('fill', function(d) {
            if(data[year][d.properties.PC_NAME.toUpperCase()]){
                if(uncheckedParties.indexOf(data[year][d.properties.PC_NAME.toUpperCase()].Party) > -1){
                    return "white";
                }
                return partyColors[data[year][d.properties.PC_NAME.toUpperCase()].Party];
            }
            return unknownColor;
        });
    }
    function createSimpleTooltip(d){
        if(map_tooltip_svg){
            map_tooltip_svg.remove();
        }
        
        map_tooltip_svg = d3.select("#map-tooltip").append("svg")
        .attr("width", 300)
        .attr("height", 200);

        map_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 15)
            .style("font-size", "17px")
            .style("fill", "black")
            .style("font-weight", "bold")
            .text(d.properties.PC_NAME.toUpperCase())
        map_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 30)
            .style("font-size", "15px")
            .text(data[year][d.properties.PC_NAME.toUpperCase()].Name)
        map_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 45)
            .style("font-size", "15px")
            .style("fill", partyColors[data[year][d.properties.PC_NAME.toUpperCase()].Party])
            .text(data[year][d.properties.PC_NAME.toUpperCase()].Party)
        map_tooltip_svg.append("line")
            .attr("y1", 70)
            .attr("y2", 70)
            .attr('x1', 10)
            .attr('x2', 290)
            .attr('stroke', "black")
        map_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 65)
            .style("font-size", "15px")
            .text("Year")
        map_tooltip_svg.append("text")
            .attr('x', 80)
            .attr('y', 65)
            .style("font-size", "15px")
            .text("Winner")
        map_tooltip_svg.append("text")
            .attr('x', 145)
            .attr('y', 65)
            .style("font-size", "15px")
            .text("Margin(%)")
        map_tooltip_svg.append("text")
            .attr('x', 215)
            .attr('y', 65)
            .style("font-size", "15px")
            .text("Runner")

        for(var i in yearList){
            map_tooltip_svg.append("text")
                .attr('x', 10)
                .attr('y', 190 - 25*i)
                .style("font-size", "20px")
                .text(yearList[i])
            map_tooltip_svg.append("text")
                .attr('x', 85)
                .attr('y', 190 - 25*i)
                .style("font-size", "20px") 
                .style("fill", partyColors[data[yearList[i]][d.properties.PC_NAME.toUpperCase()].Party])
                .text(data[yearList[i]][d.properties.PC_NAME.toUpperCase()].Party)
            map_tooltip_svg.append("text")
                .attr('x', 150)
                .attr('y', 190 - 25*i)
                .style("font-size", "20px")
                .text(Math.round(data[yearList[i]][d.properties.PC_NAME.toUpperCase()].Margin/data[year][d.properties.PC_NAME.toUpperCase()]["Total Votes"]*10000)/100)
            map_tooltip_svg.append("text")
                .attr('x', 220)
                .attr('y', 190 - 25*i)
                .style("font-size", "20px")
                .style("fill", partyColors[data[yearList[i]][d.properties.PC_NAME.toUpperCase()].Runner])
                .text(data[yearList[i]][d.properties.PC_NAME.toUpperCase()].Runner)
        }   
    }
}