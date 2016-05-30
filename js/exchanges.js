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
            dateFormat = dateFormat.getDate() + "/" + dateFormat.getMonth() + "/" + dateFormat.getFullYear();

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
                chartTitle = "Dólar comercial";
                initials = "USD"
                break;
            case "EUR":
                chartTitle = "Euro";
                initials = "EUR"
                break;
            case "ARS":
                chartTitle = "Peso argentino";
                initials = "ARS"
                break
        }

        Exchanges.renderTable("#container-table",objTable);
        Exchanges.renderChart("#container-chart",chartTitle, initials);
        
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

Exchanges.renderChart = function(container, title, initials) {
    $(container).empty();
    Highcharts.setOptions({
        lang: {
            months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
            loading: ['Atualizando o gráfico...aguarde'],
            contextButtonTitle: 'Exportar gráfico',
            decimalPoint: ',',
            thousandsSep: '.',
            downloadJPEG: 'Baixar imagem JPEG',
            downloadPDF: 'Baixar arquivo PDF',
            downloadPNG: 'Baixar imagem PNG',
            downloadSVG: 'Baixar vetor SVG',
            printChart: 'Imprimir gráfico',
            rangeSelectorFrom: 'De',
            rangeSelectorTo: 'Para',
            rangeSelectorZoom: 'Zoom',
            resetZoom: 'Limpar Zoom',
            resetZoomTitle: 'Voltar Zoom para nível 1:1',
        }
    });
    /**
     * Dark theme for Highcharts JS
     * @author Torstein Honsi
     */

    Highcharts.theme = {
        colors: ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart: {
            backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                stops: [
                    [0, '#2a2a2b'],
                    [1, '#3e3e40']
                ]
            },
            style: {
                fontFamily: "Lato"
            },
            plotBorderColor: '#606063'
        },
        title: {
            style: {
                color: '#E0E0E3',
                textTransform: 'uppercase',
                fontSize: '20px'
            }
        },
        subtitle: {
            style: {
                color: '#E0E0E3',
                textTransform: 'uppercase'
            }
        },
        xAxis: {
            gridLineColor: '#707073',
            labels: {
                style: {
                    color: '#E0E0E3'
                }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            title: {
                style: {
                    color: '#A0A0A3'

                }
            }
        },
        yAxis: {
            gridLineColor: '#707073',
            labels: {
                style: {
                    color: '#E0E0E3'
                }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            tickWidth: 1,
            title: {
                style: {
                    color: '#A0A0A3'
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            style: {
                color: '#F0F0F0'
            }
        },
        plotOptions: {
            series: {
                dataLabels: {
                    color: '#B0B0B3'
                },
                marker: {
                    lineColor: '#333'
                }
            },
            boxplot: {
                fillColor: '#505053'
            },
            candlestick: {
                lineColor: 'white'
            },
            errorbar: {
                color: 'white'
            }
        },
        legend: {
            itemStyle: {
                color: '#E0E0E3'
            },
            itemHoverStyle: {
                color: '#FFF'
            },
            itemHiddenStyle: {
                color: '#606063'
            }
        },
        credits: {
            style: {
                color: '#666'
            }
        },
        labels: {
            style: {
                color: '#707073'
            }
        },

        drilldown: {
            activeAxisLabelStyle: {
                color: '#F0F0F3'
            },
            activeDataLabelStyle: {
                color: '#F0F0F3'
            }
        },

        navigation: {
            buttonOptions: {
                symbolStroke: '#DDDDDD',
                theme: {
                    fill: '#505053'
                }
            }
        },

        // scroll charts
        rangeSelector: {
            buttonTheme: {
                fill: '#505053',
                stroke: '#000000',
                style: {
                    color: '#CCC'
                },
                states: {
                    hover: {
                        fill: '#707073',
                        stroke: '#000000',
                        style: {
                            color: 'white'
                        }
                    },
                    select: {
                        fill: '#000003',
                        stroke: '#000000',
                        style: {
                            color: 'white'
                        }
                    }
                }
            },
            inputBoxBorderColor: '#505053',
            inputStyle: {
                backgroundColor: '#333',
                color: 'silver'
            },
            labelStyle: {
                color: 'silver'
            }
        },

        navigator: {
            handles: {
                backgroundColor: '#666',
                borderColor: '#AAA'
            },
            outlineColor: '#CCC',
            maskFill: 'rgba(255,255,255,0.1)',
            series: {
                color: '#7798BF',
                lineColor: '#A6C7ED'
            },
            xAxis: {
                gridLineColor: '#505053'
            }
        },

        scrollbar: {
            barBackgroundColor: '#808083',
            barBorderColor: '#808083',
            buttonArrowColor: '#CCC',
            buttonBackgroundColor: '#606063',
            buttonBorderColor: '#606063',
            rifleColor: '#FFF',
            trackBackgroundColor: '#404043',
            trackBorderColor: '#404043'
        },

        // special colors for some of the
        legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
        background2: '#505053',
        dataLabelsColor: '#B0B0B3',
        textColor: '#C0C0C0',
        contrastTextColor: '#F0F0F3',
        maskColor: 'rgba(255,255,255,0.3)'
    };

    // Apply the theme
    Highcharts.setOptions(Highcharts.theme);

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
                format: '{value:.2f} ' + initials
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