var Portal = new(function () {
  var self = this;
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
    var prom = self.postFn(docURL, JSON.stringify(data));
    prom.then(function () {
      alert("Save successful.Thank you.")
    }, function (err) {
      console.log(err)
      alert("Please try to submit again, an error occurred.")
    })
  }
})();