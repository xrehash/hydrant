/***
 * Outage Case Record
 * Author: Richard Lawson
 */
var OutageRecordT = {
  OutageRecordViewModel: function OutageRecordViewModel() {
    //console.log(ko);
    var self = this
    self.geoLocation = ko.observable()
    navigator.geolocation && navigator.geolocation.getCurrentPosition(function (ok) {
      self.geoLocation(ok)
    }, function (err) {
      console.log(err)
    })

    self.scopeTermOptions = ["JPS Staff Crew", "Distribution Contractor", "Substation Contractor", "Transmission Contractor"]
    self.CaseCover = ko.observable({
      caseId: ko.observable('WX' + Math.floor((Date.now() * Math.random()) % 24599)),
      recordDate: ko.observable((new Date()).toISOString().substring(0, 10)),
      outageOwner: ko.observable(""),
      businessUnit: ko.observable(""),
      costCenter: ko.observable(""),
      activityDate: ko.observable((new Date(Date.now() + (42 * 24 * 3600000))).toISOString().substring(0, 10)),
      activityDuration: ko.observable(""),
      fpc: ko.observable(""),
      assignee: ko.observable(""),
      activityDescription: ko.observable(""),
      address: ko.observable(""),
      coords: ko.computed(function () {
        var spot = self.geoLocation()
        return spot ? `${spot.coords.latitude},${spot.coords.longitude}` : ''
      })
    })
    self.Scope = ko.observable({
      terms: ko.observable("JPS Crew"),
      activityList: ko.observableArray([]),
      requirementsSafety: ko.observableArray(),
      requirementsSkills: ko.observableArray(),
      requirementsEquipment: ko.observableArray(),
      uploadedFile: null,
      uploadedFileName: ko.observable(),
      addActivityRow: function () {
        self.Scope().activityList.push({
          task: 0,
          work: "",
          duration: "",
          worker: ""
        })
      },
      removeActivityRow: function (data) {
        self.Scope().activityList.remove(data)
      },
      activityFileUpload: function (data) {
        if (window.File && window.FileReader) {
          var files = document.getElementById("activityFile").files
          if (files.length > 0) {
            var file = files[0]
            console.log(file.name, file.size)
            var reader = new FileReader()
            reader.onload = function (evt) {
              //console.log(evt.target.result)
              self.Scope().uploadedFileName(file.name)
              self.Scope().uploadedFile = evt.target.result
            }
            reader.readAsBinaryString(file)
          }
        }
      }
    })

    self.saveCommand = function () {
      function stripFunctions(obj) {
        var names = Object.getOwnPropertyNames(obj);
        for (let i = 0; i < names.length; i++) {
          if (typeof obj[names[i]] == 'function') {
            delete obj[names[i]]
          }
        }
        return obj
      }

      var record = {
        cover: stripFunctions(ko.toJS(self.CaseCover)),
        scope: stripFunctions(ko.toJS(self.Scope))
      }
      console.log("Save Command Issued", record)
      Portal.saveDataFn(record)
    }

  }
}