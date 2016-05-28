var Exchanges = Exchanges || {};
var Data = [];

"use strict";

Exchanges.init = function() {
    Data = Exchanges.rates.getData();
    Exchanges.filterData();
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
            dd = date.getDate(),
            mm = ((date.getMonth()+1)<10) ? '0'+date.getMonth():date.getMonth().toString(), //getMonth retorna jan = 0, fix 0 a esquerda nos meses de digito unico, jan = 01.
            yyyy = date.getFullYear(),
            period = 7,

            removeObjectProperties = function(obj, props) { //remove propriedades não utilizadas do obj retornado no json.
                for(var i = 0; i < props.length; i++) {
                    if(obj.hasOwnProperty(props[i])) {
                        delete obj[props[i]];
                    }
                }
            },
            result = {};

        result = {"0":{"date":"2016-04-28","timestamp":1461887999,"quotes":{"USDBRL":3.482103,"USDEUR":0.880631,"USDARS":14.24595}},"1":{"date":"2016-04-27","timestamp":1461801599,"quotes":{"USDBRL":3.52505,"USDEUR":0.882768,"USDARS":14.24395}},"2":{"date":"2016-04-26","timestamp":1461715199,"quotes":{"USDBRL":3.524401,"USDEUR":0.885269,"USDARS":14.31895}},"3":{"date":"2016-04-25","timestamp":1461628799,"quotes":{"USDBRL":3.552603,"USDEUR":0.887469,"USDARS":14.32095}},"4":{"date":"2016-04-24","timestamp":1461542399,"quotes":{"USDBRL":3.568201,"USDEUR":0.890234,"USDARS":14.32095}},"5":{"date":"2016-04-23","timestamp":1461455999,"quotes":{"USDBRL":3.568204,"USDEUR":0.890988,"USDARS":14.32095}},"6":{"date":"2016-04-22","timestamp":1461369599,"quotes":{"USDBRL":3.568204,"USDEUR":0.890988,"USDARS":14.32095}}};

        /*
        for (var i = period - 1; i >= 0; i--) {
            var dateString = yyyy + '-' + mm + '-' + (dd - i);
            
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
        */

        return result;   
    }
}

Exchanges.filterData = function(filter) {
    var filter = typeof filter !== 'undefined' ? filter : "USDBRL",
        data = Exchanges.rates.data();
        var arrChart = [];
        var arrTable = [];
        for (var i = Object.keys(data).length - 1; i >= 0; i--) {
            arrChart.push([data[i].timestamp * 1000, data[i].quotes[filter]]);
            arrTable[i] ={data :data[i].date , rates: data[i].quotes[filter]};
        }
        
        Exchanges.renderChart("#container-chart",filter,arrChart);
        Exchanges.renderTable("#container-table",arrTable);
}

Exchanges.renderTable = function(container, data) {
    $(container).dynatable({
      dataset: {
        records: data
      }
    });
}

Exchanges.renderChart = function(container, name, data) {
    $(container).highcharts( {
        chart: {
            type: "column"
        },
        xAxis: {
            type: 'datetime',
            tickInterval:24 * 3600 * 1000,
            startOnTick: true,
            dateTimeLabelFormats: {
                day: '%e/%b'
            }
        },
        title: {
            text: name
        },
        tooltip: {
            dateTimeLabelFormats: {
                day: '%e/%b'
            }
        },
        series: [{
                name : name,
                data : data,
                marker : {
                    enabled : true,
                    radius : 5
                },
        }]
    });
}