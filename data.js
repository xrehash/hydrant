/***
 * Outage Case Data Support Library
 * Author: Richard Lawson
 */

/**
 * Configuration Variables
 */
const REMOTEDB_URL = "https://couchdb-076880.smileupps.com/outage";

////////////////////////////////////////////////////////////////////

if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

var Portal = new(function () {
  var self = this;
  //PouchDB init
  self.hostDb = new PouchDB("hydrant-outages")
  self.hostDb.info().then(function (info) {
    console.log("PouchDB Available", info)
    var ddoc = {
      _id: '_design/search',
      views: {
        cover: {
          map: function (doc) {
            emit(doc.cover.caseId, doc.cover);
          }.toString()
        }
      }
    };
    // save it
    self.hostDb.put(ddoc).then(function () {
      // success!
      console.log("created index")
    }).catch(function (err) {
      // some error (maybe a 409, because it already exists?)
      if (err.status != 409) {
        console.log(err)
      }
    });


  }).catch(function (err) {
    console.log(err)
  });

  self.remoteDb = new PouchDB(REMOTEDB_URL, {
    skip_setup: true
  })
  self.remoteDb.info().then(function (info) {
    console.log("Remote CouchDB Available", info)
  }).catch(function (err) {
    console.log(err)
  });
  //Initiate Replication
  PouchDB.replicate(self.hostDb, self.remoteDb, {
    live: true,
    retry: true
  });

  self.caseQuery = function (term) {
    return self.hostDb.query('search/cover', {
      limit: 100
    })
  }

  self.write = function (data) {
    // console.log(data)
    return self.hostDb.post(data)
  };
  self.save = function (doc) {
    console.log("save called")
    return self.hostDb.put(doc)
  };
  self.get = function (id) {
    return self.hostDb.get(id)
  };

  self.postFn = function post(url, data) {
    // Return a new promise.
    return new Promise(function (resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('POST', url);
      req.setRequestHeader("Content-Type", "application/json");
      req.onload = function () {
        // This is called even on 404 etc
        // so check the status
        console.log(req);
        if (req.status >= 200 && req.status < 300) {
          // Resolve the promise with the response text
          resolve(req.response);
        } else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function () {
        reject(Error("Network Error"));
      };

      // Make the request
      req.send(data);
    });
  }
  self.saveDataFn = function (data) {
    var docURL = "https://couchdb-076880.smileupps.com/outage";
    //var prom = self.postFn(docURL, JSON.stringify(data));
    var prom = self.write(data)
    prom.then(function () {
      alert("Save successful.Thank you.")
    }, function (err) {
      console.log(err)
      alert("Please try to submit again, an error occurred.")
    })
  }
})();