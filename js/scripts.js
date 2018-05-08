$(document).ready(function() {
    var counter = 10;

    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    function converttimestamp(timestamp){
        var date = new Date(timestamp * 1000);
        var hours = this.addZero(date.getHours());
        var minutes = this.addZero(date.getMinutes());
        var seconds = this.addZero(date.getSeconds());
        var formattedTime = hours + ':' + minutes;// + ':' + seconds;
        return formattedTime;
    }
    
    /**
     * 
     * Funktion som anropar MRBS Api
     * 
     */
    function getVisitors(){
        var date = new Date();
        date.setDate(date.getDate() - 1);
        var endTime = date.getFullYear() + "-" + (addZero(date.getMonth()+1)) + "-" + date.getDate() + "+23:59:59";
        date.setDate(date.getDate() - 5);
        var startTime = date.getFullYear() + "-" + (addZero(date.getMonth()+1)) + "-" + date.getDate() + "+00:00:00";    
        
        console.log(startTime);
        console.log(endTime);
        //uppdatera html
        $("#header3").html('<h3>Besöksstatistik / Visitor statistics</h3><div><h4>Antal besökare som befinner sig i biblioteket under aktuell timme</h4></div>');
        var currenttimestamp = Math.floor(Date.now() /1000);
        //currenttimestamp = 1521299582;
        var html = '';
        $.ajax({
            url: 'https://api.viametrics.com/api/GetCounterData?counterIds=[507]&endTime=' + endTime + '&includeFineGrained=false&periodType=6&snapToPeriodStart=true&startTime=' + startTime + '&userId=342&userToken=406F610253D6D86800BE28689A63EBCF02F60AFA',
            /*
            success: function(){
            },
            error: function(){
            },
            complete: function() {
          
            }
            */
        });
        //hämta ny data efter x millisekunder
        //setTimeout(function(){ getroomAvailability(area_id) }, 5000);
    }

    //Hämta besökare
    getVisitors();
});

/**
 * Funktion som skapar ett diagram
 * 
 * @param {*} hour 
 * @param {*} nrofvisitors 
 * @param {*} chartname 
 * @param {*} label 
 * 
 */
function createchart(hour, nrofvisitors, chartname, label){
    $("#charts").append('<div class="chartcontainer"><canvas style="" id="' + chartname + '" width="400" height="400"></canvas><div>')
    var chartdata = {
        labels: hour,
        datasets : [
            {
                label: label,
                backgroundColor: 'rgba(200, 200, 200, 0.75)',
                borderColor: 'rgba(200, 200, 200, 0.75)',
                hoverBackgroundColor: 'rgba(200, 200, 200, 1)',
                hoverBorderColor: 'rgba(200, 200, 200, 1)',
                data: nrofvisitors
            }
        ]
    };
    var ctx = $("#" + chartname);

    var barGraph = new Chart(ctx, {
        type: 'bar',
        data: chartdata
    });
}

/**
 * 
 * Funktion för att hantera fel
 * 
 */
$(document).ajaxError(function (event, jqxhr, settings) {
    if (settings.url.indexOf("GetCounterData") != -1) {
          console.log(jqxhr.responseText);
    }
});

/**
 * 
 * Funktion som hanterar svar från API
 * 
 */
$(document).ajaxSuccess(function (event, jqxhr, settings) { 
    if (settings.url.indexOf("GetCounterData") != -1) {
        console.log(jqxhr)
        html = '';
        var dayin = 0;
        var dayout = 0;
        var hour =[];
        var nrofvisitors = [];
        var lastdate = "";
        var onlyoneday = true;
        var chartname = "#"
        var nrofcharts = 1;
        jqxhr.responseJSON.data.counterData.forEach(function(element) {
            //om nytt datum skriv ut diagram
            if( element.datetime.substring(0,10).indexOf(lastdate)===-1){
                //skapa diagram
                createchart(hour, nrofvisitors, "myChart" + nrofcharts, "Besökare: " + lastdate ) 
                //reset variabler
                dayin = 0;
                dayout = 0;
                hour = [];
                nrofvisitors = []
                onlyoneday = false;
                nrofcharts++;
            } 
            lastdate = element.datetime.substring(0,10);
            if ( parseInt(element.datetime.substring(11,13)) > 7 && parseInt(element.datetime.substring(11,13)) < 21 ){
                dayin += parseInt(element.inValue);
                dayout += parseInt(element.outValue);
                hour.push(element.datetime.substring(11,13));
                //Vissa timmar kan vara negativt antal(t ex när personer går ut/in på icke mätbara entréer)
                if ((dayin - dayout) < 0) {
                    nrofvisitors.push(0);    
                } else {
                    nrofvisitors.push(dayin - dayout);
                }
                onlyoneday = true;
            }
        }); 

        //skapa diagram 
        if(onlyoneday){
            createchart(hour, nrofvisitors, "myChart" + nrofcharts, "Besökare: " + lastdate)
        }
    }
});