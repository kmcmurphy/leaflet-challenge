//https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

  // Create the base layers.
  street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3.5,
    layers: [street]
  });

// Set a URL for data
let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"



// Perform a GET request to the query URL/
d3.json(queryURL).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr> 
    <p> 
    ${new Date(feature.properties.time)}</br>
    <b>Magnitude:</b> ${feature.properties.mag}</br>
    <b>Quake Depth:</b> ${feature.geometry.coordinates[2]}</br>
    <a href = "${feature.properties.url}" target=_blank>More Info...</a>
    </p>`);


  }

  //Specify colors for markers and key

  //let colorArray = ["#8CD47E","#7ABD7E","#F8D66D","#FFB54C","#FF6961","red"]
  let colorArray = ["#43D0AA","#46CED2","#49A7D4","#4C80D6","#4F59D8","purple"]

  function color(feature) {
    //conditionals for quake depth color map
    let depth = feature.geometry.coordinates[2];
    if (depth < 10) {
        this_color = colorArray[0];
      }
      else if (depth < 30) {
        this_color = colorArray[1];
      }
      else if (depth < 50) {
        this_color = colorArray[2];
      }
      else if (depth < 70) {
        this_color = colorArray[3];
      }
      else if (depth < 90) {
        this_color = colorArray[4];
      }
      else {
        this_color = colorArray[5];
      }
    return this_color;
  };

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {

    pointToLayer(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag * 4,
        fillColor: color(feature),
        color: "white",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }, 
    onEachFeature
  }).addTo(myMap);



    //console.log(earthquakeData)
    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
      let div = L.DomUtil.create("div", "info legend");
      let limits = [-10, 10, 30, 50, 70, 90];
      let legcolors = colorArray;
      let labels = [];

      let from, to;

      for (let i = 0; i < limits.length; i++) {
        from = limits[i];
        to = limits[i + 1];
  
        labels.push(`<i style="background:${legcolors[i]}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
      }
      let lengendInfo = "<b>Earthquake Depth (km)</b><hr>";
      div.innerHTML = lengendInfo + labels.join('<br>');
      return div;
    };
  
    legend.addTo(myMap);

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    "Earthquakes": earthquakes
  };


  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}
