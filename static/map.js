const delay = ms => new Promise(res => setTimeout(res, ms));

loadSand = async () => await fetch("static/sand.json")
    .then(response => response.json())
    .then(json => {
        let sands = json.data;
        sands.sort((a, b) => {
            return a.place.countryFR.localeCompare(b.place.countryFR);
        });
        const noCountry = sands.filter(sand => !sand.place.countryFR)
        sands = sands.filter(sand => sand.place.countryFR)
        noCountry.forEach(sand => {
            sands.push(sand);
        });
        return sands
    })

showSelectedSands = (countryName, selected) => {
    const statsDiv = document.getElementById("stats")
    statsDiv.style.display = "block";
    if (selected.length === 0) {
        statsDiv.style.display = "none"; 
    }
    const nbSands = document.getElementById("stat-nb-sands");
    const nbCollectors = document.getElementById("stat-nb-collectors");

    const title = document.getElementById("selected-country");
    title.innerHTML = countryName;
    nbSands.innerHTML = selected.length;
    nbCollectors.innerHTML = new Set(selected.map(sand => sand.giftedBy)).size

    const collection = document.getElementById("collection");
    collection.innerHTML = selected.map(sand => {
        const url = "https://sand-collection.s3.eu-central-1.amazonaws.com/resized_200"
        const year = sand.year?` - ${sand.year}`:''
        return `
            <div class="card cursor-zoom-in">
            <img src='${url}/${sand.picture}' alt="photo">
            <div class="cardText">
            <h4 class="text-lg font-bold">${sand.place.name}</h4>
            <p class="text-sm text-secondary-content">${sand.giftedBy}${year}</p>
            </div>
            </div>
            `;
    }).join("");
    updateModal();
}

function buildMap(highlighted = null) {
    let oldmap = document.getElementById("map-svg")
    if (oldmap) {
        oldmap.remove();
    }

    let [m_width, m_height] = getSizes();
    const map = d3.select('#map').append("svg")
        .attr("id", "map-svg")
        .attr("width", m_width)
        .attr("height", m_height);

    const projection = d3.geoNaturalEarth1()
        .scale(1)
        .translate([0, 0]);

    const path = d3.geoPath()
        .pointRadius(2)
        .projection(projection);

    const cGroup = map.append("g");

    return d3.json("static/world.json")
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
           return loadSand();
        })
        .then((sands) => {
            cGroup.selectAll("path")
                .on("click", function (d) {
                    Array.from(document.getElementsByClassName("highlighted")).forEach(e => e.classList.remove("highlighted"));
                    this.classList.add("highlighted");
                    showSelectedSands(d.properties.name, sands.filter(sand => sand.place.country === d.id));
                });
 
            if (highlighted) {
                highlighted.forEach(e => {
                    const toHighLight = document.getElementById(e.id);
                    if (toHighLight){
                        toHighLight.classList.add("highlighted");
                    }
                });
            }
            new Set(sands.map(s => s.place.country)).forEach(country => {
                const countryPath = document.getElementById(country);
                if (countryPath) {
                    countryPath.classList.add("collected");
                }
            })
            return sands
        })
    .then((sands) => {
        const fr = document.getElementById('FR');
        if (fr) {
            fr.classList.add("highlighted");
        }
        showSelectedSands("France", sands.filter(sand => sand.place.country === "FR"));
    })
}

getSizes = () => {
    let width = Math.min(document.getElementById("map").offsetWidth, 800)*0.9;
    return [width, width * 0.6];
}
buildMap()

onresize = () => {
    let highlighted = Array.from(document.getElementsByClassName("highlighted"))
    buildMap(highlighted)
};


updateModal = () => {
    const zoomImg = document.getElementById("zoom-img");
    const my_modal = document.getElementById("my_modal");
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", () => {
            zoomImg.src = card.getElementsByTagName("img")[0].src.replace("resized_200/", "");
            my_modal.showModal();
        });
    });
}
