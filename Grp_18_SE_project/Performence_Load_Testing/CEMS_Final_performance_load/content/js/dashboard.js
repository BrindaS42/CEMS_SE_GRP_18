/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 90.09661835748793, "KoPercent": 9.903381642512077};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3647342995169082, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.42, 500, 1500, "GET events"], "isController": false}, {"data": [0.5, 500, 1500, "Save Draft Event"], "isController": false}, {"data": [0.6, 500, 1500, "Get Ad Likes"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler-0"], "isController": false}, {"data": [0.275, 500, 1500, "Get Reviews"], "isController": false}, {"data": [0.125, 500, 1500, "student Login"], "isController": false}, {"data": [0.53, 500, 1500, "Get Event Sponsors"], "isController": false}, {"data": [0.5, 500, 1500, "Suspend User"], "isController": false}, {"data": [0.175, 500, 1500, "Get My Events"], "isController": false}, {"data": [0.45, 500, 1500, "Get All Students"], "isController": false}, {"data": [0.4, 500, 1500, "Post Chat Message"], "isController": false}, {"data": [0.19, 500, 1500, "Get Event Details"], "isController": false}, {"data": [1.0, 500, 1500, "Get Event Performance"], "isController": false}, {"data": [0.5, 500, 1500, "Create Ad"], "isController": false}, {"data": [0.325, 500, 1500, "Get Registration Form"], "isController": false}, {"data": [0.1, 500, 1500, "Get All Events"], "isController": false}, {"data": [0.5, 500, 1500, "Get Ad Views"], "isController": false}, {"data": [1.0, 500, 1500, "Login API-0"], "isController": false}, {"data": [0.5, 500, 1500, "Get All Users"], "isController": false}, {"data": [0.3, 500, 1500, "Check Registration Status"], "isController": false}, {"data": [0.1, 500, 1500, "Org Login"], "isController": false}, {"data": [0.55, 500, 1500, "Rate Event"], "isController": false}, {"data": [0.275, 500, 1500, "Get Timeline"], "isController": false}, {"data": [0.5, 500, 1500, "Post Announcement"], "isController": false}, {"data": [0.5, 500, 1500, "Get Dashboard Stats."], "isController": false}, {"data": [0.3, 500, 1500, "Admin Login"], "isController": false}, {"data": [0.5, 500, 1500, "Sponsor Login"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5, 500, 1500, "Create Team"], "isController": false}, {"data": [0.0, 500, 1500, "Submit Registration"], "isController": false}, {"data": [0.0, 500, 1500, "Login API"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 414, 41, 9.903381642512077, 4020.048309178748, 0, 301932, 1002.0, 2130.0, 2515.5, 255825.25000000675, 1.1239615572568822, 8.195616651734811, 0.37334148222430363], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET events", 50, 0, 0.0, 1259.48, 822, 2899, 1099.5, 1997.3999999999996, 2500.2, 2899.0, 4.471472008585226, 38.665132858612054, 0.6943008294580576], "isController": false}, {"data": ["Save Draft Event", 5, 0, 0.0, 1424.2, 1395, 1469, 1425.0, 1469.0, 1469.0, 1469.0, 1.852537977028529, 2.4133649036680254, 1.4147311504260838], "isController": false}, {"data": ["Get Ad Likes", 5, 0, 0.0, 565.4, 489, 658, 563.0, 658.0, 658.0, 658.0, 1.1183180496533214, 0.6618171270409304, 0.5045536513084321], "isController": false}, {"data": ["Debug Sampler-0", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["Get Reviews", 20, 8, 40.0, 30595.2, 16, 300730, 746.5, 270569.40000000066, 300711.55, 300730.0, 0.06476327404255594, 1.4048064873371608, 0.02709432285139743], "isController": false}, {"data": ["student Login", 20, 0, 0.0, 2140.4, 1184, 3084, 2320.0, 2725.2000000000003, 3066.2999999999997, 3084.0, 1.6798252981689903, 3.1135824374265075, 0.562675856710902], "isController": false}, {"data": ["Get Event Sponsors", 50, 0, 0.0, 682.8, 473, 1269, 604.0, 1070.1, 1206.1499999999999, 1269.0, 4.5972784111805804, 3.4928541053696214, 0.861989702096359], "isController": false}, {"data": ["Suspend User", 5, 0, 0.0, 963.4, 734, 1176, 1019.0, 1176.0, 1176.0, 1176.0, 1.9201228878648233, 1.327584965437788, 0.995688724078341], "isController": false}, {"data": ["Get My Events", 20, 0, 0.0, 1769.5500000000002, 1210, 2411, 1918.0, 2216.2000000000003, 2401.45, 2411.0, 1.704593880507969, 29.049675594477115, 0.7840465993352084], "isController": false}, {"data": ["Get All Students", 20, 0, 0.0, 885.15, 534, 1821, 846.0, 1501.2, 1805.0499999999997, 1821.0, 1.834862385321101, 10.215381307339449, 0.8224627293577982], "isController": false}, {"data": ["Post Chat Message", 10, 0, 0.0, 1205.4, 1055, 1680, 1088.0, 1679.4, 1680.0, 1680.0, 1.7911517105498835, 2.0535274493999642, 0.960295204191295], "isController": false}, {"data": ["Get Event Details", 50, 0, 0.0, 1784.8799999999997, 1157, 3450, 1677.0, 2878.2, 3268.099999999999, 3450.0, 4.331254331254331, 46.695066836668396, 0.7740425220893971], "isController": false}, {"data": ["Get Event Performance", 5, 0, 0.0, 310.8, 281, 337, 312.0, 337.0, 337.0, 337.0, 3.1486146095717884, 2.318413491813602, 1.4328656328715363], "isController": false}, {"data": ["Create Ad", 5, 0, 0.0, 532.8, 503, 548, 546.0, 548.0, 548.0, 548.0, 1.1220825852782765, 1.1527645309694792, 0.8503282091561938], "isController": false}, {"data": ["Get Registration Form", 20, 7, 35.0, 15659.45, 17, 301932, 834.5, 888.3000000000001, 286879.8499999998, 301932.0, 0.06484453522679376, 1.3749131184547547, 0.028635448075738416], "isController": false}, {"data": ["Get All Events", 5, 0, 0.0, 1821.0, 1404, 2395, 1677.0, 2395.0, 2395.0, 2395.0, 1.3506212857914641, 81.92098443408968, 0.5856209481361426], "isController": false}, {"data": ["Get Ad Views", 5, 0, 0.0, 623.6, 515, 933, 560.0, 933.0, 933.0, 933.0, 1.1096316023080337, 0.6566765146471372, 0.5006345705725699], "isController": false}, {"data": ["Login API-0", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["Get All Users", 5, 0, 0.0, 1127.6, 985, 1245, 1132.0, 1245.0, 1245.0, 1245.0, 1.957713390759593, 75.56697215152703, 0.8469404610415036], "isController": false}, {"data": ["Check Registration Status", 20, 6, 30.0, 739.5, 0, 3228, 747.0, 2166.0000000000027, 3181.7999999999993, 3228.0, 0.06483108261424858, 0.0813174243259188, 0.022292015809059495], "isController": false}, {"data": ["Org Login", 5, 0, 0.0, 1957.6, 1290, 2258, 2075.0, 2258.0, 2258.0, 2258.0, 1.669449081803005, 2.673727045075125, 0.560830550918197], "isController": false}, {"data": ["Rate Event", 10, 0, 0.0, 632.6, 495, 1140, 543.5, 1115.2, 1140.0, 1140.0, 2.197802197802198, 1.3628949175824177, 1.2040693681318682], "isController": false}, {"data": ["Get Timeline", 20, 0, 0.0, 1463.1500000000003, 958, 2514, 1285.5, 2201.1000000000004, 2498.8999999999996, 2514.0, 1.7479461632581716, 2.2139513415486802, 0.8005729986016431], "isController": false}, {"data": ["Post Announcement", 5, 0, 0.0, 1206.4, 1183, 1237, 1196.0, 1237.0, 1237.0, 1237.0, 2.035002035002035, 3.1637922262922267, 1.357330458892959], "isController": false}, {"data": ["Get Dashboard Stats.", 5, 0, 0.0, 984.6, 964, 1000, 984.0, 1000.0, 1000.0, 1000.0, 2.2123893805309733, 1.3957065818584071, 0.9744019634955753], "isController": false}, {"data": ["Admin Login", 5, 0, 0.0, 1245.6, 967, 1650, 1083.0, 1650.0, 1650.0, 1650.0, 1.531862745098039, 2.845315372242647, 0.5101222617953431], "isController": false}, {"data": ["Sponsor Login", 5, 0, 0.0, 982.8, 959, 1023, 975.0, 1023.0, 1023.0, 1023.0, 1.004217714400482, 1.9142900180759188, 0.3402964325165696], "isController": false}, {"data": ["Debug Sampler", 11, 0, 0.0, 1.5454545454545454, 0, 16, 0.0, 13.00000000000001, 16.0, 16.0, 0.032738387545126896, 0.01065508955437102, 0.0], "isController": false}, {"data": ["Create Team", 5, 0, 0.0, 1076.4, 978, 1231, 1046.0, 1231.0, 1231.0, 1231.0, 2.007226013649137, 1.7406413087113608, 1.132984995985548], "isController": false}, {"data": ["Submit Registration", 20, 20, 100.0, 15942.45, 0, 300393, 974.0, 3409.100000000001, 285546.1499999998, 300393.0, 0.06469142191745374, 0.07320112360913442, 0.024227695610687022], "isController": false}, {"data": ["Login API", 1, 0, 0.0, 1537.0, 1537, 1537, 1537.0, 1537.0, 1537.0, 1537.0, 0.6506180871828238, 2.0033191688353935, 0.1925168754066363], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 13, 31.70731707317073, 3.140096618357488], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: cems-se-grp-18-app-backend.onrender.com:443 failed to respond", 15, 36.58536585365854, 3.6231884057971016], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of chunk coded message body: closing chunk expected", 1, 2.4390243902439024, 0.24154589371980675], "isController": false}, {"data": ["403/Forbidden", 12, 29.26829268292683, 2.898550724637681], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 414, 41, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: cems-se-grp-18-app-backend.onrender.com:443 failed to respond", 15, "400/Bad Request", 13, "403/Forbidden", 12, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of chunk coded message body: closing chunk expected", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Reviews", 20, 8, "403/Forbidden", 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: cems-se-grp-18-app-backend.onrender.com:443 failed to respond", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Registration Form", 20, 7, "403/Forbidden", 6, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of chunk coded message body: closing chunk expected", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Check Registration Status", 20, 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: cems-se-grp-18-app-backend.onrender.com:443 failed to respond", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Submit Registration", 20, 20, "400/Bad Request", 13, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: cems-se-grp-18-app-backend.onrender.com:443 failed to respond", 7, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
