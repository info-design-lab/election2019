var state = "JHARKHAND";
var constituency = "RAMTEK";
var unknownColor = "#e4e4e4";
var yearList = [1999, 2004, 2009, 2014, 2019];
var year = 2019; // Current Year
var map_legend;
var partyColors;
var map_mode = 'cartogram';
var map_tooltip = d3.select("#map")
    .append("div")
    .attr('class', 'd3-tip')
    .attr("id", "map-tooltip");
var rankOverlay = false;

var map_svg, map_legend_svg, yearSliderSVG, map_tooltip_svg;

function createMapVis(s){
    if(map_svg){
        map_svg.remove();
    }
    if(map_legend_svg){
        map_legend_svg.remove();
    }

    $('.map-switch').off('change');

    queue()
        .defer(d3.json, 'data/election/' + s + '.json')
        .defer(d3.json, 'data/partyColors.json')
        .defer(d3.json, 'map/cartogram/' + s + '.json')
        .defer(d3.json, 'map/map/' + s + '.json')
        .await(makeMap);
}

function makeMap(error, data, partyColors, mapCarto, mapSatellite){
	if(error){
		console.log(error);
	}

    $('#map-switch-div').css('display', 'block');

    // In your Javascript (external .js resource or <script> tag)
    $('.dropdown').select2();
    
    partyColors = partyColors;

    var uncheckedParties = [];
    // Create Map
    var map_width = 7/12*document.body.clientWidth;
    var map_height = map_width*0.8;

    var CartoGeoObj = topojson.feature(mapCarto, mapCarto.objects.state);
    var MapGeoObj = topojson.feature(mapSatellite, mapSatellite.objects.state);
    var projectionMap = d3.geoMercator()
        .fitSize([map_width, map_height], MapGeoObj);
    var projectionCarto = d3.geoEquirectangular()
        .fitSize([map_width, map_height], CartoGeoObj);
    var projection = ((map_mode === "map") ? projectionMap : projectionCarto);
    var path = d3.geoPath().projection(projection);

    //var map2cart = interpolatedProjection(projectionMap, projectionCarto),
    //   cart2map = interpolatedProjection(projectionCarto, projectionMap);
    map_svg = d3.select("#map").append("svg")
        .attr("width", map_width)
        .attr("height", map_height);

    var map = map_svg.selectAll("path")
        .data(
            ((map_mode === "map") ? MapGeoObj.features : CartoGeoObj.features)
            )
        .enter()
        .append("path")
        .attr("d", path)
        .attr('class', 'map-margin-const')
        .style('fill', function(d) {
            if(data[year][constName(d)]){
                return partyColors[data[year][constName(d)].Party];
            }
            return unknownColor;
        })
        .attr('stroke-width', '0.3px')
        .style('stroke', 'black')
        .on('mouseover', function(d){
            if(!rankOverlay){
                d3.select(this).attr("stroke-width", "2px");
                if(data[year][constName(d)]){
                    map_tooltip.style("visibility", "visible");
                    createSimpleTooltip(d);
                }
                $(".constituency-select").val(constName(d)).change();
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
        })
        .on('click', function(d){
            if(!rankOverlay){
                createRankVis(d);
            } else{
                createSimpleTooltip(d);
            }
            rankOverlay = !rankOverlay;
        });

    var legend_width = 4/12*document.body.clientWidth;//$('#map-legend').width();
    var legend_height = 500;
    var legend_margin = {
        left: 100,
        top: 30
    }

    map_legend_svg = d3.select("#map-legend").append("svg")
        .attr("width", legend_width)
        .attr("height", legend_height);

    map_legend = map_legend_svg.append('g')
        .attr("transform", "translate("+ legend_margin.left +", "+ legend_margin.top +")");

    createYearSlider();
    createPartyLegend();

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
        
        map_legend = map_legend_svg.append('g')
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
            if(data[year][constName(d)]){
                if(uncheckedParties.indexOf(data[year][constName(d)].Party) > -1){
                    return "white";
                }
                return partyColors[data[year][constName(d)].Party];
            }
            return unknownColor;
        });
    }

    function createSimpleTooltip(d){
        if(rankOverlay){
            d3.selectAll('.party-table').remove();
            d3.selectAll('.party-winner-info').remove();
            d3.selectAll('.party-rank-info').remove();
            map_tooltip_svg.transition().duration(500)
                .attr('width', 300);
        }
        else if(map_tooltip_svg){
            map_tooltip_svg.remove();
            map_tooltip_svg = d3.select("#map-tooltip").append("svg")
                .attr("width", 300)
                .attr("height", 200);
        } else{
            map_tooltip_svg = d3.select("#map-tooltip").append("svg")
                .attr("width", 300)
                .attr("height", 200);
        }

        map_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 15)
            .style("font-size", "17px")
            .style("fill", "black")
            .style("font-weight", "bold")
            .attr('class', 'party-winner-info')
            .text(constName(d))
        map_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 30)
            .style("font-size", "15px")
            .attr('class', 'party-winner-info')
            .text(data[year][constName(d)].Name)
        map_tooltip_svg.append("text")
            .attr('x', 10)
            .attr('y', 45)
            .style("font-size", "15px")
            .attr('class', 'party-winner-info')
            .style("fill", partyColors[data[year][constName(d)].Party])
            .text(data[year][constName(d)].Party)
        map_tooltip_svg.append("line")
            .attr("y1", 70)
            .attr("y2", 70)
            .attr('x1', 10)
            .attr('x2', 290)
            .attr('class', 'party-table')
            .attr('stroke', "black")
        map_tooltip_svg.append("text")
            .attr('x', 15)
            .attr('y', 65)
            .style("font-size", "15px")
            .attr('class', 'party-table')
            .text("Year")
        map_tooltip_svg.append("text")
            .attr('x', 80)
            .attr('y', 65)
            .style("font-size", "15px")
            .attr('class', 'party-table')
            .text("Winner")
        map_tooltip_svg.append("text")
            .attr('x', 145)
            .attr('y', 65)
            .style("font-size", "15px")
            .attr('class', 'party-table')
            .text("Margin(%)")
        map_tooltip_svg.append("text")
            .attr('x', 215)
            .attr('y', 65)
            .style("font-size", "15px")
            .attr('class', 'party-table')
            .text("Runner")

        for(var i in yearList){
            if(data[yearList[i]]){
                if(data[yearList[i]][constName(d)]){
                    map_tooltip_svg.append("text")
                        .attr('x', 10)
                        .attr('y', 190 - 25*i)
                        .style("font-size", "20px")
                        .attr('class', 'party-table')
                        .text(yearList[i])
                    map_tooltip_svg.append("text")
                        .attr('x', 85)
                        .attr('y', 190 - 25*i)
                        .style("font-size", "20px") 
                        .attr('class', 'party-table')
                        .style("fill", partyColors[data[yearList[i]][constName(d)].Party])
                        .text(data[yearList[i]][constName(d)].Party)
                    map_tooltip_svg.append("text")
                        .attr('x', 150)
                        .attr('y', 190 - 25*i)
                        .style("font-size", "20px")
                        .attr('class', 'party-table')
                        .text(Math.round(data[yearList[i]][constName(d)].Margin/data[year][constName(d)]["Total Votes"]*10000)/100)
                    map_tooltip_svg.append("text")
                        .attr('x', 220)
                        .attr('y', 190 - 25*i)
                        .style("font-size", "20px")
                        .attr('class', 'party-table')
                        .style("fill", partyColors[data[yearList[i]][constName(d)].Runner])
                        .text(data[yearList[i]][constName(d)].Runner)
                }               
            }
        }   
    }

    $('.map-switch').on('change', function(d){
        map_mode = ((this.checked) ? "map" : "cartogram");
        //updateMap();
        projection = ((this.checked) ? projectionMap : projectionCarto);
        path.projection(projection);
        map.data(((this.checked) ? MapGeoObj.features : CartoGeoObj.features));

        transtionMap(projection);
    });

    function constName(d){
        if(map_mode === "cartogram"){
            return d.id.toUpperCase();
        } else if(map_mode === "map"){
            return d.properties.PC_NAME.toUpperCase();
        }
    }

    function transtionMap(interProj){
        map.transition()
            .duration(500)
            .style('opacity', 0)
            .on('end', function(){
                 map.attr("d", path);
            });

        map.transition()
            .delay(500)
            .duration(500)
            .style('opacity', 1);
    }

    function createYearSlider(){
        if(yearSliderSVG){
            yearSliderSVG.remove();
        }

        yearSliderSVG = d3.select("#year-slider-map").append("svg")
            .attr("width", 110*(yearList.length - 1))
            .attr("height", 50);

        const r = 8;
        const offsetX = 14;
        for(var i in yearList){
            if(i != yearList.length - 1){
                yearSliderSVG.append('line')
                    .attr('x1', offsetX + i*100 + r)
                    .attr('x2', offsetX + (i)*100 + 100 - r)
                    .attr('y1', offsetX)
                    .attr('y2', offsetX)
                    .attr('stroke', '#7e7e7e')
                    .attr('stroke-width', '2px');
            }

            yearSliderSVG.append('text')
                .attr('x', offsetX + i*100)
                .attr('y', 40)
                .attr('font-size', "15px")
                .attr('fill', "#7e7e7e")
                .attr('text-anchor', 'middle')
                .text(yearList[i]);

        }

        yearSliderSVG.selectAll('circle')
            .data(yearList)
            .enter()
            .append('circle')
            .attr('cx', function(d, i){
                return  offsetX + i*100;
            })
            .attr('cy', offsetX)
            .attr('r', r)
            .attr('fill', "transparent")
            .attr('stroke', "#7e7e7e")
            .attr('stroke-width', '2px')
            .on('click', function(d, i){
                year = d;
                selectionCircle
                    .transition().duration(500)
                    .attr('cx', function(){
                        return  offsetX + i*100;
                    });

                updateMap();
                createPartyLegend();
            });  

        var selectionCircle = yearSliderSVG.append('circle')
            .attr('cx', function(){
                const i = yearList.indexOf(year);
                return  offsetX + i*100;
            })
            .attr('cy', offsetX)
            .attr('r', r - 3)
            .attr('fill', "#545454");
    }

    function createRankVis(d){
        d3.selectAll('.party-table').remove();

        const cName = constName(d);
        const numRank = 5;
        var parties = [];
        var rankData = [];
        var rankPath = {};
        var d = [];
        const xGap = 80;
        const yGap = 25;
        var startIndex = null;

        for(var i in yearList){
            if(data[yearList[i]]){
                if(data[yearList[i]][cName]){
                    if(startIndex === null){
                        startIndex = parseInt(i);
                    }

                    d = [];
                    if(data[yearList[i]][cName].Ranks.length > numRank){
                        for(var j = 0; j < numRank; j++){
                            d.push(data[yearList[i]][cName].Ranks[j]);
                        }
                    } else{
                        for(var j = 0; j < data[yearList[i]][cName].Ranks.length; j++){
                            d.push(data[yearList[i]][cName].Ranks[j]);
                        }
                        d = data[yearList[i]][cName].Ranks;
                    }
                    rankData.push(d);

                    for(var j in d){
                        if(parties.indexOf(d[j]) < 0){
                            parties.push(d[j]);
                        }

                        if(!rankPath[d[j]]){
                            rankPath[d[j]] = [];
                        }
                        rankPath[d[j]].push([parseInt(i), parseInt(j)]);
                    }
                }
            }
        }

        map_tooltip_svg.transition().duration(500)
           .attr('width', 100*yearList.length);
        map_tooltip_svg.append('line')
            .attr('x1', 10)
            .attr('y1', 70)
            .attr('x2', 490)
            .attr('y2', 70)
            .attr('class', 'party-table')
            .attr('class', 'party-rank-info')
            .attr('stroke', "black");
        map_tooltip_svg.append('line')
            .attr('x1', 80)
            .attr('y1', 50)
            .attr('x2', 80)
            .attr('y2', 100 + 80*4)
            .attr('class', 'party-table')
            .attr('class', 'party-rank-info')
            .attr('stroke', "black");
        map_tooltip_svg.append('text')
            .attr('x', 50)
            .attr('y', 65)
            .attr('text-anchor', 'middle')
            .attr('class', 'party-rank-info')
            .text('Rank');
 
        for(var i in yearList){
            map_tooltip_svg.append('text')
                .attr('x', 100 + i * xGap)
                .attr('y', 65)
                .attr('font-size', '15px')
                .attr('class', 'party-rank-info')
                .text(yearList[i])
        }

        for(var i = 0; i < numRank; i++){
            map_tooltip_svg.append('text')
                .attr('x', 45)
                .attr('y', 93 + i * yGap)
                .attr('font-size', '20px')
                .attr('class', 'party-rank-info')
                .text(i + 1)
        }

        var g = map_tooltip_svg.append('g')
            .attr("transform", "translate("+ 115 +", "+ 85 +")");

        for(var i in rankData){
            for(var j in rankData[i]){
                g.append('circle')
                    .attr('cx', (parseInt(i) + startIndex)*xGap)
                    .attr('cy', j*yGap)
                    .attr('r', 5)
                    .attr('class', 'party-rank-info')
                    .attr('fill', function(){
                        if(partyColors[rankData[i][j]]){
                            return partyColors[rankData[i][j]];
                        }
                        return unknownColor;
                    });
                g.append('text')
                    .attr('x', (parseInt(i) + startIndex)*xGap)
                    .attr('y', 15 + j*yGap)
                    .attr('font-size', '10px')
                    .attr('text-anchor', 'middle')
                    .attr('class', 'party-rank-info')
                    .text(rankData[i][j])
            }
        }

        for(var i in rankPath){
            if(i != "IND" && i!= "INDEPENDENT"){
                g.append("path")
                    .datum(createPath(rankPath[i], xGap, yGap))
                    .attr("class", "line party-rank-info")
                    .attr("d", d3.line()
                        .curve(d3.curveLinear)
                        .x(function(d) {
                            return d[0];
                        })
                        .y(function(d) {
                            return d[1];
                        })
                    )
                    .style('stroke', function(){
                        if(partyColors[i]){
                            return partyColors[i];
                        }
                        return unknownColor;
                    })
                    .style('stroke-width', "10px")
                    .style('opacity', 0.8);
            }
        }
    }

    function createPath(d, xGap, yGap){
        var result = []
        for(var i in d){
            result.push([xGap*d[i][0], yGap*d[i][1]])
        }
        return result;
    }
}
