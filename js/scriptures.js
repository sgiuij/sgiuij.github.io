/* global window */
/* jslint browser: true */
const Scriptures = (function (){
 "use strict";
//constants

// private variables
let books = {};
let volumes = [];
// AIzaSyBVrFz6pyVtooI7emyrRWUDVi3tcCJMysY
// private method declarations
let ajax;
let bookChapterValid;
let cacheBooks;
let init;
let navigateBook;
let navigateChapter;
let navigateHome;
let onHashChanged;


// private methods
    ajax = function (url, successCallback, failureCallback){
        let request = new XMLHttpRequest();
        request.open("GET", url, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
            // Success!
            let data = JSON.parse(request.responseText);

            if (typeof successCallback === "function"){
                successCallback(data);
            }else{
                if (typeof failureCallback === "function"){
                failureCallback(data);
                }
            }
        } else {
            failureCallback(request);
            // We reached our target server, but it returned an error
            }
        };

        request.onerror = failureCallback;

        request.send();
    };

    bookChapterValid = function(bookId, chapter){
    	let book = books[bookId];
    	if (book === undefined || chapter <0 || chapter>book.numChapters){
    		return false;
    	}
    	if (chapter === 0 && book.numChapters>0){
    		return false;
    	}
    	return true;
    };

    cacheBooks = function (callback){
        volumes.forEach(function(volume) {
            let volumeBooks = [];
            let bookId = volume.minBookId;
            while (bookId <= volume.maxBookId){
                volumeBooks.push(books[bookId]); //javascript is ok taking integers when expecting string
                bookId += 1;
            }
            volume.books = volumeBooks; //didn't exist, initializing it here
        });
        if (typeof callback === "function"){
            callback();
        }
    };
    init = function (callback){
    	let booksLoaded = false;
        let volumesLoaded = false;
        ajax("http://scriptures.byu.edu/mapscrip/model/books.php",
            function (data) {
                books = data;
                booksLoaded = true;
                if (booksLoaded){
                    cacheBooks(callback);
                }
            });

        ajax("http://scriptures.byu.edu/mapscrip/model/volumes.php",
            function (data) {
                volumes = data;
                volumesLoaded = true;
                if (volumesLoaded){
                    cacheBooks(callback);
                }
            }
        );
    };

    navigateBook = function(bookId){
    	document.getElementById("scriptures").innerHTML = "<div>" + bookId + "</div>";
    };

    navigateChapter = function(bookId, chapter){
    	if (bookId != undefined){
    		let book = books[bookId];
    		let volume = volumes[book.parentBookid - 1];

    		//TODO: next/previous button
    	}
    	document.getElementById("scriptures").innerHTML = "<div>" + bookId + ", " + chapter + "</div>";
    };

    navigateHome = function(volumeId){
    	let navContents = "<div id=\"scripnav\">";
    	volumes.forEach(function (volume){
    		if (volumeId === undefined || volume.id === volumeId){
    			navContents += "<div class=\volume\"><a name=\"v" + volume.id + "\" /><h5>" + 
    			volume.fullName + "</h5></div><div class = \"books\">";

    			volume.books.forEach(function (book){
    				navContents += "<a class=\"btn\" id=\"" + book.id + "\" href=\"#" + 
    				volume.id + ":" + book.id + "\">" + book.gridName + "</a>";
    			});

    			navContents += "</div>";
    		}
    	})
    	navContents += "<br /><br /></div>";
    	document.getElementById("scriptures").innerHTML = navContents;
    	// "<div> The OT </div>" +
    	// "<div> The NT </div>" +
    	// "<div> The BoM </div>" +
    	// "<div> The D&C </div>" +
    	// "<div> The PoGP </div>" +
    	// "<div> Selected volume: " + volumeId + " </div>";
    };

    onHashChanged = function (){
    	let bookId;
    	let chapter;
    	let ids = [];
    	let volumeId;
    	if (location.hash != "" && location.hash.length >1){ 
    		// Remove leading # and split the string on colon delimiters
    		ids = location.hash.substring(1).split(":");
    	}
    	if (ids.length <= 0){
    		navigateHome();
    	}else if (ids.length === 1){
    		//display single volumes table of contents
    		volumeId = Number(ids[0]);
    		if (volumeId < volumes[0].id || volumeId > volumes[volumes.length-1].id){
    			navigateHome();
    		}else{
    			navigateHome(volumeId);
    		}
    	}
    	else if (ids.length === 2) {
    		//display books with chapters
    		bookId = Number(ids[1]);
    		if (books[bookId] === undefined){
    			navigateHome();
    		}else{
    			navigateBook(bookId);
    		}
    	}else {
    		//display chapter contents
    		bookId = Number(ids[1]);
    		bookId = Number(ids[2]);

    		if (!bookChapterValid(bookId, chapter)){
    			navigateHome();
    		}else {
    			navigateChapter(bookId, chapter);
    		}
    	}
    };

//public api
//const vs function
//why doesn't init have any naming, say function, const
    // const api = {
    //     init(callback){
    //     	init(callback); //why do this???????????????
    //         // do nothing when failing
    //     }
    // };
    // return api;

    return {
        init(callback){
        	init(callback); //why do this???????????????
            // do nothing when failing
        },

        onHashChanged(){
        	onHashChanged();
        }
    };

}());
