var phantom = require('phantom');
var cheerio = require('cheerio');
var http = require('http');
var fs = require('fs');
var path = require('path');
var _this = this;
var ConferenceWithPaperPage = ['UIST12', 'UIST13', 'UIST14', 'UIST15', 'CHI16', 'CHI15', 'CHI14', 'CHI13', 'CHI12','CHI11']

exports.getCHIList = function(query, callback) {

    var sitepage_chi = null;
    var phInstance_chi = null;
    var papers = [];
    phantom.create(['--load-images=no'])
        .then(instance => {
            phInstance_chi = instance;     
            return instance.createPage();
        })
        .then(page => {
            sitepage_chi = page;
            return page.open('http://dl.acm.org/results.cfm?query='+query+'&filtered=series%2EseriesAbbr=CHI');
        })
        .then(status => {
            console.log(status);
            return sitepage_chi.property('content');
        })
        .then(content => {
            
            $ = cheerio.load(content);
            $('.details').each(function(i, elem) {
                var dictPaper = {}
                dictPaper['title'] = $(this).find('.title > a').text();
                dictPaper['paperID'] = $(this).find('.title > a').attr('href').split('=')[1].split('&')[0];
                dictPaper['abstract'] = $(this).find('.abstract').text().trim();
                dictPaper['year'] = $(this).find('.source').find('span').first().text().trim()
                dictPaper['source'] = $(this).find('.source').find('span').last().text().trim().split(":")[0]
                dictPaper['keyword'] = $(this).find('.kw').text().slice(30).trim();
                papers.push(dictPaper)
            });
            sitepage_chi.close();
            phInstance_chi.exit();
            callback(papers);
        })
        .catch(error => {
            console.log(error);
            phInstance_chi.exit();
            callback(papers);
        });
}

exports.getUISTList = function(query, callback) {
    var sitepage_uist = null;
    var phInstance_uist = null;
    var papers = [];
    phantom.create(['--load-images=no'])
        .then(instance => {
            phInstance_uist = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage_uist = page;
            return page.open('http://dl.acm.org/results.cfm?query='+ query +'&filtered=series%2EseriesAbbr=UIST');
        })
        .then(status => {
            console.log(status);
            return sitepage_uist.property('content');
        })
        .then(content => {
            // console.log(content);
            $ = cheerio.load(content);
            $('.details').each(function(i, elem) {
                var dictPaper = {}
                dictPaper['title'] = $(this).find('.title > a').text();
                dictPaper['paperID'] = $(this).find('.title > a').attr('href').split('=')[1].split('&')[0];
                dictPaper['abstract'] = $(this).find('.abstract').text().trim();
                dictPaper['year'] = $(this).find('.source').find('span').first().text().trim()
                dictPaper['source'] = $(this).find('.source').find('span').last().text().trim().split(":")[0]
                dictPaper['keyword'] = $(this).find('.kw').text().slice(30).trim();
                papers.push(dictPaper)
            });
            
            sitepage_uist.close();
            phInstance_uist.exit();
            callback(papers);
        })
        .catch(error => {
            console.log(error);
            phInstance_uist.exit();
            callback(papers);
        });
}


// http://dl.acm.org/tab_abstract.cfm?id=2858436

// http://dl.acm.org/tab_citings.cfm?id=2702572

// http://dl.acm.org/tab_references.cfm?id=2702572

exports.getPaperAbstractByID = function(ID, callback) {
    var sitepage_paper = null;
    var phInstance_paper = null;
    // console.log(ID)

    phantom.create(['--load-images=no'])
        .then(instance => {
            phInstance_paper = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage_paper = page;
            return page.open('http://dl.acm.org/tab_abstract.cfm?id=' + ID);
        })
        .then(status => {
            console.log(status);
            return sitepage_paper.property('content');
        })
        .then(content => {
            // console.log(content);
            $ = cheerio.load(content);
            // console.log(content);
            var abs = $('p').text();
            var video = $('iframe').attr('src');
            sitepage_paper.close();
            phInstance_paper.exit();

            callback(abs, video);
        })
        .catch(error => {
            console.log(error);
            phInstance_paper.exit();
            callback("","");
        });
}


exports.getPaperTitleAndAuthorsByID = function(ID, callback) {
    var sitepage_paper = null;
    var phInstance_paper = null;
    var papers = [];

    phantom.create(['--load-images=no'])
        .then(instance => {
            phInstance_paper = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage_paper = page;
            return page.open('http://dl.acm.org/citation.cfm?id=' + ID);
        })
        .then(status => {
            console.log(status);
            return sitepage_paper.property('content');
        })
        .then(content => {
            $ = cheerio.load(content);
            
            var title = $('h1 > strong').first().text();
            var conferenceName = $('a.link-text[title="Conference Website"]').text();
            var authors = []

            $('a[title="Author Profile Page"]').each(function(i, elem) {
                authors.push($(this).text().trim());
            })

            authors = authors.join(', ')
            
            sitepage_paper.close();
            phInstance_paper.exit();
            callback(title, authors, conferenceName);
        })
        .catch(error => {
            console.log(error);
            phInstance_paper.exit();
            callback("", "", "");
        });
}


exports.getPaperConferenceAndPageStartNumber = function(ID, callback) {
    var sitepage_paper = null;
    var phInstance_paper = null;
    var papers = [];

    phantom.create(['--load-images=no'])
        .then(instance => {
            phInstance_paper = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage_paper = page;
            return page.open('http://dl.acm.org/citation.cfm?id=' + ID);
        })
        .then(status => {
            console.log(status);
            return sitepage_paper.property('content');
        })
        .then(content => {
            $ = cheerio.load(content);
    
            var pageNumber = $('#divmain').find('td:contains("Pages")')[1].children[0]["data"].split(' ')[3].split('-')[0]
            var conferenceName = $('a.link-text[title="Conference Website"]').text();

            if (pageNumber == "") {
                pageNumber = ID
            }

            
            sitepage_paper.close();
            phInstance_paper.exit();
            callback(conferenceName, pageNumber);
        })
        .catch(error => {
            console.log(error);
            phInstance_paper.exit();
            callback("", "");
        });
}

exports.getPaperReferenceByID = function(ID, callback) {
    var sitepage_paper = null;
    var phInstance_paper = null;
    var papers = [];

    phantom.create(['--load-images=no'])
        .then(instance => {
            phInstance_paper = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage_paper = page;
            return page.open('http://dl.acm.org/tab_references.cfm?id=' + ID);
        })
        .then(status => {
            // console.log(status);
            return sitepage_paper.property('content');
        })
        .then(content => {
            // console.log(content);
            $ = cheerio.load(content);
            
            $('tr > td:nth-child(3) > div').each(function(i, elem){
                
                var dictPaper = {}

                if ($(this).children('a:first-child').attr('href') != undefined)
                {
                    dictPaper['content'] = $(this).children('a:first-child').text().trim();
                    if ($(this).children('a:first-child').attr('href').split('=')[1])
                    {
                        dictPaper['paperID'] = $(this).children('a:first-child').attr('href').split('=')[1].split('&')[0];    
                    
                    }    
                }
                else{
                    dictPaper['content'] = $(this).text().trim();
                    dictPaper['paperID'] = "None"
                }
                
                
                papers.push(dictPaper)
            });

            sitepage_paper.close();
            phInstance_paper.exit();
            callback(papers);
        })
        .catch(error => {
            console.log(error);
            phInstance_paper.exit();
            callback(papers);
        });
}


exports.getPaperCitationByID = function(ID, callback) {
    var sitepage_paper = null;
    var phInstance_paper = null;
    var papers = [];

    phantom.create(['--load-images=no'])
        .then(instance => {
            phInstance_paper = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage_paper = page;
            return page.open('http://dl.acm.org/tab_citings.cfm?id=' + ID);
        })
        .then(status => {
            console.log(status);
            return sitepage_paper.property('content');
        })
        .then(content => {
            // console.log(content);
            $ = cheerio.load(content);
            

            $('td > div > a:first-child').each(function(i, elem) {
                var dictPaper = {}
                dictPaper['content'] = $(this).text().trim();
                if ($(this).attr('href').split('=')[1])
                {
                    dictPaper['paperID'] = $(this).attr('href').split('=')[1].split('&')[0];    
                }
                papers.push(dictPaper)
            })

            sitepage_paper.close();
            phInstance_paper.exit();

            callback(papers);
        })
        .catch(error => {
            console.log(error);
            phInstance_paper.exit();
            callback(papers);
        });
}

var shell = require('shelljs');

exports.downloadPDF = function (paperId, callback) {

    _this.getPaperFileNameById(paperId, function (filename) {
        if (shell.test('-e', 'PDF/' + filename + '.pdf'))
        {
            callback(filename)
        }
        else{
            // var file = fs.createWriteStream("./PDF/" + filename + ".pdf");
            // http.get("http://dl.acm.org/ft_gateway.cfm?id=" + paperId, function(redirectHeader) {
                
            //     http.get(redirectHeader.headers.location, function(response) {
            //         response.pipe(file);    
            //         file.on('finish', function() {
            //             callback(filename)
            //         });
            //     })
            // });
            callback(filename)
        }

    })
}

var jsonfile = require('jsonfile')
var file = __dirname+ '/id_to_file.json'
var id_to_file
jsonfile.readFile(file, function(err, obj) {
    id_to_file = obj    
})

// exports.getPaperFileNameById = function(paperId, callback)
// {
//     var filename = paperId;
//      if (shell.test('-e', 'PDF/' + filename + '.pdf'))
//     {
//         callback(filename)
//     }

//     filename = id_to_file[paperId];
    
//     if (filename) {
//         callback(filename)
//     }
//     else
//     {
//          _this.getPaperConferenceAndPageStartNumber(paperId, function(conferenceName, pageNumber){
           
//             filename = paperId

//             if(conferenceName && conferenceName != "")
//             {
//                 var conferenceNames = conferenceName.split(' \'')
//                 var dir = conferenceNames[0] + conferenceNames[1]
//                 filename = dir + '/p' + pageNumber;
//             }
            
//             id_to_file[paperId] = filename
            
//             jsonfile.writeFile(file, id_to_file, function (err) {
//               console.error(err)
//             })
//             callback(filename)
//          });
//     }
// }
// Usage...
// 2702572
// _this.getCiteNumByNameAndPaperId("Daniel Ashbrook , Patrick Baudisch , Sean White, Nenya: subtle and eyes-free mobile input with a magnetically-tracked finger ring, Proceedings of the SIGCHI Conference on Human Factors in Computing Systems, May 07-12, 2011, Vancouver, BC, Canada",2702572, function (num) {
//     console.log(num);
// });
exports.getCiteNumInPaperId = function (citedByPaperID, showingPaperID, callback) {
    _this.getPaperReferenceByID(citedByPaperID, function (data) {
        var numID = undefined;
        for (var i = 0; i < data.length; i++) {
            if(data[i]['paperID'] != 'None')
            {
                if (showingPaperID == parseInt(data[i]['paperID']))
                {
                    numID = i + 1
                    break;
                }
            }
        }
        callback(citedByPaperID,numID);
    });
}


exports.getParagraph = function (paperId, citeNum, callback) {
    // Download PDF is not exist.
    _this.getPaperFileNameById(paperId, function (filename) {
        if (shell.test('-e', 'PDF/' + filename + '.pdf'))
        {
            
            shell.exec('python find_cite.py ' + paperId +' ' + citeNum + ' PDF/'+ filename +'.pdf', {silent:true}, function(code, stdout, stderr) {
                // console.log(stdout)
                console.log('citenum-results-json/'+paperId+ '_' + citeNum+'.json')
                fs.readFile('citenum-results-json/'+paperId+ '_' + citeNum+'.json', function(err, contents) {
                    if (err) 
                    {
                        callback([]);
                    }
                    else
                    {
                        var jsonContent = JSON.parse(contents);
                        console.log("getParagraph success")
                        callback(jsonContent)
                    }
                    
                });
            })
        }
        else{
            console.log("file not exits in database");
            callback([]);
        }

    });
}

exports.getTitleAndParagraph = function (paperId, citeNum, callback){
    var paper = id_to_file[paperId];
    var getParagraph = function(paperId,citeNum,filename, title, callback){
        if (shell.test('-e', 'PDF/' + filename + '.pdf'))
        {
            
            shell.exec('python find_cite.py ' + paperId +' ' + citeNum + ' PDF/'+ filename +'.pdf', {silent:true}, function(code, stdout, stderr) {
                // console.log(stdout)
                console.log('citenum-results-json/'+paperId+ '_' + citeNum+'.json')
                fs.readFile('citenum-results-json/'+paperId+ '_' + citeNum+'.json', function(err, contents) {
                    if (err) 
                    {
                        callback(title, []);
                    }
                    else
                    {
                        var jsonContent = JSON.parse(contents);
                        console.log("getParagraph success")
                        callback(title, jsonContent)
                    }
                    
                });
            })
        }
        else{
            console.log("file not exits in database");
            callback(title,[]);
        }
    }
    if (paper) {
        getParagraph(paperId, citeNum, paper["filename"], paper["title"], callback)
    }
    else
    {
         _this.getPaperTitleAndFileName(paperId, function (title, filename) {
            var paper = {"title": title, "filename":filename}
            id_to_file[paperId] = paper
            
            jsonfile.writeFile(file, id_to_file, function (err) {
              console.error(err)
            })

            getParagraph(paperId, citeNum, filename, title, callback)
        });
    }
}

exports.getPaperTitleAndFileName = function(paperID, callback){
var sitepage_paper = null;
    var phInstance_paper = null;
    var papers = [];

    phantom.create(['--load-images=no'])
        .then(instance => {
            phInstance_paper = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage_paper = page;
            return page.open('http://dl.acm.org/citation.cfm?id=' + paperID);
        })
        .then(status => {
            console.log(status);
            return sitepage_paper.property('content');
        })
        .then(content => {
            $ = cheerio.load(content);
            
            var pageNumber =""
            try{
                // console.log($('a.small-link-text[title="ACM"]').parent()[0].children[0].data.split(' '))
                // console.log($('a.small-link-text[title="ACM"]').parent().innerHTML)
                pageNumber = $('a.small-link-text[title="ACM"]').parent()[0].children[0].data.split(' ')[3].split('-')[0]
            }
            catch(err)
            {
                console.log("found page failed")
                console.log(err)
                pageNumber = paperID
            }
            var conferenceName = $('a.link-text[title="Conference Website"]').text();
            var title = $('h1 > strong').first().text();
            var authors = []

            $('a[title="Author Profile Page"]').each(function(i, elem) {
                authors.push($(this).text().trim());
            })

            sitepage_paper.close();
            phInstance_paper.exit();

            var filename = ""
            if(conferenceName && conferenceName != "")
            {
                var conferenceNames = conferenceName.split(' \'')
                var dir = conferenceNames[0] + conferenceNames[1]
                if (ConferenceWithPaperPage.indexOf(dir) != -1)
                {
                    filename = dir + '/p' + pageNumber;
                    console.log('PDF/' + filename + '.pdf' + "found")
                    callback(title, authors, conferenceName, filename);
                }
                else
                {
                    console.log('PDF/' + filename + '.pdf' + "not found")
                    filename = dir +'/'+ paperID;
                    callback(title, authors, conferenceName, filename);
                }
            }
            else{
                callback(title, "");
            }
            
           
        })
        .catch(error => {
            console.log(error);
            phInstance_paper.exit();
            callback("", "");
        });
}

// exports.get

exports.getVisualizationDataByPaperId = function (paperID, callback){
   var list = []
   var paperJsonFile = 'JSON/' + paperID
   if (shell.test('-e', paperJsonFile))
   {
      callback(paperJsonFile)
   }
   else
   {    

        var rootCallback = function(){
            var results = []
            for(var i = 0; i < list.length; i++){
                //console.log(list[i]);
                results.push(list[i]);
            }
            var json = JSON.stringify(results);
            fs.writeFile(paperJsonFile, json, 'utf8', function(err){
                if (err) { 
                    callback('./JSON/null')
                }
                else {
                    callback(paperJsonFile);
                }
            }); 
        }

        var citationCallback = function(data){
            for(var i = 0; i < data.length; i++){
                !function outer(data, ii){
                    if(data[ii]['paperID'] && data[ii]['paperID'] != 'None'){
                        _this.getCiteNumInPaperId(data[ii]['paperID'], paperID, function(citedByPaperID, numID){
                            if(numID && citedByPaperID && citedByPaperID != 'None')
                            {
                                var obj = {}
                                obj["paperID"] = citedByPaperID
                                obj["referID"] = numID
                                obj["type"] = "citation"
                                obj["polarity"] = 0
                                _this.getTitleAndParagraph(citedByPaperID, numID, function(title,comment){
                                    obj["comment"] = comment;
                                    obj["name"] = title;
                                    if(ii == data.length - 1){
                                        console.log("Citation out");
                                        rootCallback();
                                    }
                                });
                                list.push(obj)
                            }
                            else
                            {
                                if(ii == data.length - 1){
                                    console.log("Citation out")
                                    rootCallback()
                                }
                            }
                        });  
                    }else{
                        if(ii == data.length - 1){
                            console.log("Citation out")
                            rootCallback()
                        }
                    }
                    
                }(data, i)
            }
        }
        _this.getPaperReferenceByID(paperID, function (data) {
            // console.log("getPaperReferenceByID")
            for(var i = 0; i < data.length; i++){
                !function outer(data, ii){
                    if(data[ii]['paperID'] && data[ii]['paperID'] != 'None')
                    {
                        var obj = {}
                        obj["paperID"] = data[ii]['paperID']
                        obj["referID"] = ii + 1
                        obj["type"] = "reference"
                        obj["polarity"] = 0;

                        _this.getTitleAndParagraph(paperID, ii + 1, function(title, comment){
                            obj["comments"] = comment;
                            _this.getPaperTitleAndAuthorsByID(obj["paperID"], function(title, authors, conferenceName) {
                                obj["name"] = title
                                if(ii == data.length - 1){
                                    console.log("reference out")
                                    _this.getPaperCitationByID(paperID, citationCallback);
                                }
                            })
                        });
                        
                        list.push(obj)
                        
                    }
                    else{
                        if(ii == data.length - 1){
                            console.log("reference out")
                            _this.getPaperCitationByID(paperID, citationCallback);
                        }
                    }
                }(data, i)
            }
        })
    }
}