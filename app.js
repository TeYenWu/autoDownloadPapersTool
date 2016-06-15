var express = require('express');
var shell = require('shelljs');
var http = require('http');
var fs = require('fs');
var app = express();

var getUISTPapers = function (req, res, next) {
  getUISTPDFS(req.params.year, req.params.firstPaperID, req.params.lastPaperId, function () {
    res.sendStatus(200)
    // res.send(data);
  })
}

var getCHIPapers = function (req, res, next) {
    getCHIPDFS(req.params.year, req.params.firstPaperID, req.params.lastPaperId, function () {
        res.sendStatus(200)
        // res.send(data);
      })
}

app.get('/downloadPDF/chi/:year/:firstPaperID/:lastPaperId', getCHIPapers);

app.get('/downloadPDF/uist/:year/:firstPaperID/:lastPaperId', getUISTPapers);


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

var getCHIPDFS = function (year, firstPaperID, lastPaperId,  callback) {

    if (shell.test('-e', 'PDF/' + 'CHI' + year + '/' + firstPaperID))
    {
        callback()
    }
    else{

        var paperId = firstPaperID;
        var request = function(paperId){
            http.get("http://dl.acm.org/ft_gateway.cfm?id=" + paperId, function(redirectHeader) {
                http.get(redirectHeader.headers.location, function(response) {
                    var filename = paperId;
                    var file = fs.createWriteStream("./PDF/"  + 'CHI' + year + '/' + filename + ".pdf");
                    response.pipe(file);    
                    file.on('finish', function() {
                        console.log("./PDF/"  + 'CHI' + year + '/' + filename + ".pdf")
                    });
                }).on('error', function(e) {
                  console.error(e);
                });
            }).on('error', function(e) {
              console.error(e);
            });
        }
        var myInterval = setInterval(function(){
          if (paperId > lastPaperId ) {
            clearInterval(myInterval);
            console.log("Success");
          }
          console.log(paperId);
          request(paperId)
          paperId++;
        }, 30 * 1000); 
        callback();
    }
    
}

var getUISTPDFS =function (year, firstPaperID, lastPaperId, callback) {

    if (shell.test('-e', 'PDF/' + 'UIST' + year + '/'))
    {
        callback()
    }
    else{
        var paperId = firstPaperID;
        var request = function(paperId){
            http.get("http://dl.acm.org/ft_gateway.cfm?id=" + paperId, function(redirectHeader) {
                http.get(redirectHeader.headers.location, function(response) {
                    var filename = response.headers['content-type'].split('/')[1];
                    console.log(response.headers['content-type'])
                    var file = fs.createWriteStream("./PDF/"  + 'UIST' + year + '/' + filename + ".pdf");
                    response.pipe(file);    
                    file.on('finish', function() {
                        console.log("./PDF/"  + 'UIST' + year + '/' + filename + ".pdf")
                    });
                })
                .on('error', function(e) {
                  console.error(e);
                });
            }).on('error', function(e) {
              console.error(e);
            });
        }
        var myInterval = setInterval(function(){
          if (paperId > lastPaperId) {
            clearInterval(myInterval);
            console.log("Success");
          }
          console.log(paperId);
          request(paperId)
          paperId++;
        }, 30 * 1000); 
        callback();

    }
}