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
      caseId: ko.observable(Math.floor((Date.now() * Math.random()) % 234876599)),
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
      }
    })

    self.saveCommand = function () {
      var record = {
        cover: ko.toJS(self.CaseCover)
      }
      console.log("Save Command Issued", record)
      Portal.saveDataFn(record)
    }

  }
}