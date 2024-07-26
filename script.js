const width = 960;
const height = 600;
const margin = { top: 50, right: 90, bottom: 100, left: 60 };

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

d3.csv("./netflix_titles.csv").then(data => {
    const genreCounts = {};
    data.forEach(d => {
        d.listed_in.split(',').forEach(genre => {
            genre = genre.trim();
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
    });
    const genreData = Object.keys(genreCounts).map(key => ({ genre: key, count: genreCounts[key] })).slice(0, 10);

  
    showBarChart(genreData);


    window.genreData = genreData;
    window.rawData = data;
});

function showBarChart(data) {
    svg.selectAll("*").remove();
    d3.select("#chart-title").text("Genre Bar Chart: Top 10 Genres");

    const x = d3.scaleBand().range([margin.left, width - margin.right]).padding(0.1);
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    x.domain(data.map(d => d.genre));
    y.domain([0, d3.max(data, d => d.count)]);

    svg.append("g")
        .selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.count))
        .attr("fill", "#e50914")
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("fill", "orange");
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`${d.genre}: ${d.count}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).transition().duration(200).attr("fill", "#e50914");
            tooltip.transition().duration(200).style("opacity", 0);
        });

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

function showScatterPlot(data) {
    svg.selectAll("*").remove();
    d3.select("#chart-title").text("Scatter Plot: Duration vs. Release Year");

    const x = d3.scaleLinear().range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    const durationData = data.map(d => {
        const duration = parseInt(d.duration.split(' ')[0]);
        return { year: +d.release_year, duration: duration, type: d.type };
    }).filter(d => !isNaN(d.duration) && d.duration !== "");

    x.domain(d3.extent(durationData, d => d.year));
    y.domain(d3.extent(durationData, d => d.duration));

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.selectAll(".dot")
        .data(durationData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.duration))
        .attr("r", 5)
        .attr("fill", d => d.type === "Movie" ? "#e50914" : "orange")
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("fill", "yellow");
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Year: ${d.year}<br>Duration: ${d.duration} mins<br>Type: ${d.type}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).transition().duration(200).attr("fill", d => d.type === "Movie" ? "#e50914" : "orange");
            tooltip.transition().duration(200).style("opacity", 0);
        });
}

function showPieChart(data) {
    svg.selectAll("*").remove();
    d3.select("#chart-title").text("Genre Distribution: Pie Chart");

    const radius = Math.min(width, height) / 2 - margin.top;
    const pieGroup = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().outerRadius(radius).innerRadius(0);

    const pieData = pie(data);

    pieGroup.selectAll(".arc")
        .data(pieData)
        .enter().append("path")
        .attr("class", "arc")
        .attr("d", arc)
        .attr("fill", d => color(d.data.genre))
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("fill", "orange");
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`${d.data.genre}: ${d.data.count}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).transition().duration(200).attr("fill", d => color(d.data.genre));
            tooltip.transition().duration(200).style("opacity", 0);
        });

    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 100},${margin.top})`);

    legend.selectAll(".legend-item")
        .data(pieData)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.selectAll(".legend-item")
        .append("rect")
        .attr("width", 25)
        .attr("height", 18)
        .attr("fill", d => color(d.data.genre));

    legend.selectAll(".legend-item")
        .append("text")
        .attr("x", 30)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d.data.genre)
        .style("fill", "white");
}

function showStackedBarChart(data) {
    svg.selectAll("*").remove();
    d3.select("#chart-title").text("Stacked Bar Chart: Movie vs TV Show Count by Genre");

    const genreCounts = {};
    data.forEach(d => {
        d.listed_in.split(',').forEach(genre => {
            genre = genre.trim();
            if (!genreCounts[genre]) {
                genreCounts[genre] = { Movie: 0, "TV Show": 0 };
            }
            genreCounts[genre][d.type]++;
        });
    });

    const stackedData = Object.keys(genreCounts).map(key => ({ genre: key, ...genreCounts[key] }));

    const x = d3.scaleBand().range([margin.left, width - margin.right]).padding(0.1);
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);
    const color = d3.scaleOrdinal().range(["#e50914", "orange"]);

    x.domain(stackedData.map(d => d.genre));
    y.domain([0, d3.max(stackedData, d => d.Movie + d["TV Show"])]);

    const keys = ["Movie", "TV Show"];

    const stackedSeries = d3.stack().keys(keys)(stackedData);

    svg.append("g")
        .selectAll(".bar")
        .data(stackedSeries)
        .enter().append("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", d => x(d.data.genre))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("fill", "yellow");
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`${d.data.genre}<br>${d3.select(this.parentNode).datum().key}: ${d[1] - d[0]}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).transition().duration(200).attr("fill", d => color(d3.select(this.parentNode).datum().key));
            tooltip.transition().duration(200).style("opacity", 0);
        });

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 100},${margin.top})`);

    legend.selectAll(".legend-item")
        .data(keys)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.selectAll(".legend-item")
        .append("rect")
        .attr("width", 25)
        .attr("height", 18)
        .attr("fill", color);

    legend.selectAll(".legend-item")
        .append("text")
        .attr("x", 30)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d)
        .style("fill", "white");
}

document.getElementById("bar-chart-btn").addEventListener("click", () => showBarChart(window.genreData));
document.getElementById("scatter-plot-btn").addEventListener("click", () => showScatterPlot(window.rawData));
document.getElementById("pie-chart-btn").addEventListener("click", () => showPieChart(window.genreData));
document.getElementById("stacked-bar-chart-btn").addEventListener("click", () => showStackedBarChart(window.rawData));
