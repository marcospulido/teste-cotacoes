var Exchanges = Exchanges || {};
var Data = [];

"use strict";

Exchanges.init = function() {
    Data = Exchanges.rates.getData();
    Exchanges.filterData();

    $(".nav li").click(function(e){
        e.preventDefault();
        $(".nav li").removeClass("active");
        $(this).addClass("active");

        Exchanges.filterData($(this).data("filter"));
    });
}

Exchanges.rates = {
    data : function(json) {
        Data = Data || Exchanges.rates.getData();
        return Data;
    },
    getData: function(date) {
        var endpoint = 'historical',
            access_key = 'd75b3783c0e1c2c46e612f64825676c3',
            date = typeof date !== 'undefined' ? date : new Date(),
            period = 7,

            removeObjectProperties = function(obj, props) { //remove propriedades não utilizadas do obj retornado no json.
                for(var i = 0; i < props.length; i++) {
                    if(obj.hasOwnProperty(props[i])) {
                        delete obj[props[i]];
                    }
                }
            },
            result = {},
            getDateAgo = function(currDate, daysAgo){
                var dateAgo = new Date(currDate);
                dateAgo.setDate(dateAgo.getDate()-daysAgo);
                return dateAgo;
            };

        
        for (var i = period - 1; i >= 0; i--) {
            var dateAgo = getDateAgo(date, i + 1);
            dd= dateAgo.getDate();
            mm = ((dateAgo.getMonth()+1)<10) ? '0'+(dateAgo.getMonth()+1):(dateAgo.getMonth()+1).toString(), //getMonth retorna jan = 0, fix 0 a esquerda nos meses de digito unico, jan = 01.
            yyyy = dateAgo.getFullYear(),
            dateString = yyyy + '-' + mm + '-' + dd;
            $.ajax({
                url: 'http://apilayer.net/api/' + endpoint + '?access_key=' + access_key + '&date=' + dateString + '&currencies=BRL,EUR,ARS&format=1',
                type: 'get',
                dataType: 'json',
                async: false,
                success: function(data) {
                    removeObjectProperties(data, ["success", "terms","privacy","historical","source"]);
                    result[i] = data;
                }
            });                  
        }
        

        return result;   
    }
}

Exchanges.filterData = function(filter) {
    var filter = (typeof filter !== 'undefined') ? filter : "USDBRL",
        data = Exchanges.rates.data();
        var objTable = [];
        for (var i = Object.keys(data).length - 1; i >= 0; i--) {
            //Formata data para exibição
            var dateFormat = new Date(data[i].timestamp * 1000);
            dateFormat = dateFormat.getDate() + "/" + (dateFormat.getMonth()+1) + "/" + dateFormat.getFullYear();

            //Converte as cotações do EUR e ARS baseadas no USD
            var convertedRate = data[i].quotes[filter];
            if (filter != "USDBRL") {
                var brlRate = data[i].quotes["USDBRL"],
                    convertedRate = brlRate / convertedRate;
            }
            objTable[i] ={data: dateFormat , cotação: convertedRate.toFixed(3)};
        }

        var chartTitle = filter.substring(3,6),
            initials = "";
        switch (chartTitle) {
            case "BRL":
                chartTitle = "Dólar comercial (USD)";
                break;
            case "EUR":
                chartTitle = "Euro (EUR)";
                break;
            case "ARS":
                chartTitle = "Peso argentino (ARS)";
                break
        }

        Exchanges.renderTable("#container-table",objTable);
        Exchanges.renderChart("#container-chart",chartTitle);
        
}

Exchanges.renderTable = function(container, data) {
    $(container).empty()
                .append("<table class=\"table table-striped table-bordered\"><thead><th>Data</th><th>Cotação</th></thead><tbody></tbody></table>");

    $(container + " table").dynatable({
      dataset: {
        records: data
      },
      features: {
        paginate: false,
        search: false,
        recordCount: false,
      },
    });
}

Exchanges.renderChart = function(container, title) {
    $(container).empty();
    
    $(container).highcharts( {
        data: {
            table: 'container-table'
        },
        chart: {
            type: "line"
        },
        xAxis: {
            type: 'datetime',
            tickInterval:24 * 3600 * 1000,
            dateTimeLabelFormats: {
                day: '%e/%b'
            }
        },
        yAxis: {
            labels: {
                format: '{value:.2f} BRL'
            }
        },
        title: {
            text: title
        },
        tooltip: {
            pointFormat: "{series.name}: {point.y:.2f}"
        }
    });
}