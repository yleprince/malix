let m_width = document.getElementById("map-container").offsetWidth*.8;
if (m_width > 800) {
    m_width = 800;
}

const m_height = m_width * 0.6;
console.log(m_width, m_height);

const map = d3.select('#map').append("svg")
    .attr("id", "svg")
    .attr("class", "svg")
    .attr("width", m_width)
    .attr("height", m_height);

const projection = d3.geoNaturalEarth1()
    .scale(1)
    .translate([0, 0]);

const path = d3.geoPath()
    .pointRadius(2)
    .projection(projection);

const cGroup = map.append("g");


d3.json("static/world.json")
    .then((geojson) => {
        const b = path.bounds(geojson);
        const s = 1 / Math.max((b[1][0] - b[0][0]) / m_width, (b[1][1] - b[0][1]) / m_height);
        const t = [(m_width - s * (b[1][0] + b[0][0])) / 2, (m_height - s * (b[1][1] + b[0][1])) / 2];

        projection
            .scale(s)
            .translate(t);

        cGroup.selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("id", (d) => d.id)
            .attr("class", "country clickable")
            .on("mouseover", function (d) {
                this.classList.add("highlighted");
                const toHighlight = document.getElementsByClassName(d.id);
                if (toHighlight) {
                    Array.from(toHighlight).forEach(e => e.classList.add("trHighlight"));
                }
            })
            .on("mouseout", function (d) {
                this.classList.remove("highlighted");
                const toHighlight = document.getElementsByClassName(d.id);
                if (toHighlight) {
                    Array.from(toHighlight).forEach(e => e.classList.remove("trHighlight"));
                }
            })
        ;
    });
