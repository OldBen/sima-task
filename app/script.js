$(document).ready(function() {
    var states_row = "<tr><td>$STATE</td><td>$ORDERS</td></tr>"
    var comments_row = "<tr><td comment-id=$ID>$COMMENT</td></tr>"
    prev_id = undefined
    function localizeOrderNo(number) {
        if (number === 1) return " zamówienie";
        switch (number % 10) {
            case 2:
            case 3:
            case 4:
                if (number % 100 < 10 || 20 < number % 100 ) return " zamówienia";
            default:
                return " zamówień";
        }
    }
    function getComments(id) {
        var url = "http://localhost:8080/comments.php";
        if (id !== undefined) url += "?id=" + id;
        $.getJSON(url, function (data) {
            $("#comments-table tr").remove();
            data.forEach(comment => {
                filled_row = comments_row.replace("$ID", comment.id).replace("$COMMENT", comment.content);
                $("#comments-table").append(filled_row);
            })
            if (prev_id !== undefined) $('button#prev').prop('disabled', false);
            if (data.length < 8)  $('button#next').prop('disabled', true); else $('button#next').prop('disabled', false);
        });
    }
    var cities_states = {};
    var states_orders = {};
    $.get("http://localhost:8080/data/wojewodztwa_miasta.csv", function (data) {
        csv = $.csv.toObjects(data, {separator: ';'});
        csv.forEach(entry => {
            if (states_orders[entry["nazwa województwa"]] === undefined) {
                states_orders[entry["nazwa województwa"]] = 0;
            }
            cities_states[entry["nazwa miasta"]] = entry["nazwa województwa"];
        })
    })
    var map = L.map('map').setView([52.4, 17], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    var cities = {};
    $.getJSON("http://localhost:8080/data/geonames.geojson", function(json) {
        json.features.forEach(city => {
            cities[city.properties.name] = {
                lat: city.geometry.coordinates[1],
                lng: city.geometry.coordinates[0],
                orders: 0,
            }
        })
        $.getJSON("http://localhost:8080/orders.php", function(orders) {
            orders.forEach(order => {
                if (cities[order.city] !== undefined) {
                    cities[order.city].orders = order.orders;
                }
                if (cities_states[order.city] !== undefined) {
                    states_orders[cities_states[order.city]] += order.orders;
                }
            });
            Object.entries(cities).filter(([key, value]) => value.orders != 0).forEach(([key, value]) => {
                var point = L.latLng(value.lat, value.lng);
                var msg = value.orders + localizeOrderNo(value.orders)
                var marker = L.marker(point).addTo(map).bindPopup(msg);
            })
            Object.entries(states_orders).forEach(([key, value]) => {
                filled_row = states_row.replace("$STATE", key).replace("$ORDERS", value);
                $("#region-table").append(filled_row);
            })
        })
    });
    
    $("button#submit").on("click", function() {
        var comment = $("#comment").val();
        $.post("http://localhost:8080/comments.php", {'comment': comment}, function() {
            $("#comment").val('');
            getComments();
        })
    })
    $("button#next").on("click", function() {
        prev_id = $("#comments-table td").first().attr('comment-id');
        var next_id = $("#comments-table td").last().attr('comment-id');
        getComments(next_id);
    })
    getComments();
    
    $("button#prev").on("click", function() {
        getComments(prev_id);
    })
    getComments();
})