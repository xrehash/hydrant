/***
 * Outage Case Record
 * Author: Richard Lawson
 */
var OutageRecordT = {
  OutageRecordViewModel: function OutageRecordViewModel() {
    //console.log(ko);
    var self = this
    self.geoLocation = ko.observable()
    /*navigator.geolocation && navigator.geolocation.getCurrentPosition(function (ok) {
      self.geoLocation(ok)
    }, function (err) {
      console.log(err)
    });*/

    self.displayCaseUI = ko.observable(false)
    self.displayFieldUI = ko.observable(false)
    self.searchTerm = ko.observable()
    self.searchResults = ko.observableArray()
    self.searchKeyPress = function (datum, event) {
      //console.log(event)
      if (event.keyCode == 13) {
        self.searchCommand()
      }
      return true;
    }
    self.scopeTermOptions = ["JPS Staff Crew", "Distribution Contractor", "Substation Contractor", "Transmission Contractor"]

    self._id = ko.observable()
    self._rev = ko.observable()
    self._attachments = ko.observable({})
    self.adds = ko.observableArray()
    self.CaseCover = ko.observable()
    self.Scope = ko.observable()
    self.FieldData = ko.observable()

    self.attached = ko.computed(function () {
      return Object.getOwnPropertyNames(self._attachments())
    })

    self.addRow = function () {
      self.Scope().activityList.push(ko.observable({
        task: ko.observable(0),
        work: ko.observable(""),
        duration: ko.observable(""),
        worker: ko.observable(""),
        status: ko.observable("open")
      }))
    }

    self.init = function () {
      self._id((new Date()).toISOString())
      self.CaseCover({
        caseId: ko.observable('WX' + Math.floor((Date.now() * Math.random()) % 24599)),
        recordDate: ko.observable((new Date()).toISOString().substring(0, 10)),
        outageOwner: ko.observable(""),
        businessUnit: ko.observable(""),
        costCenter: ko.observable(""),
        activityDate: ko.observable((new Date(Date.now() + (42 * 24 * 3600000))).toISOString().substring(0, 10)),
        activityDuration: ko.observable(""),
        fpc: ko.observable(""),
        assignee: ko.observable(""),
        outageID: ko.observable(""),
        activityDescription: ko.observable(""),
        address: ko.observable(""),
        coords: ko.computed(function () {
          var spot = self.geoLocation()
          return spot ? `${spot.coords.latitude},${spot.coords.longitude}` : ''
        })
      })
      self.Scope({
        terms: ko.observable(),
        activityList: ko.observableArray([]),
        requirementsSafety: ko.observableArray(),
        requirementsSkills: ko.observableArray(),
        requirementsEquipment: ko.observableArray(),
        notes: ko.observable(),
        uploadedFileName: ko.observable(),
        addActivityRow: self.addRow,
        removeActivityRow: function (data) {
          self.Scope().activityList.remove(data)
        }
      })
      self.FieldData({
        arrivalDate: ko.observable(),
        arrivalTime: ko.observable(),
        allMaterial: ko.observable(),
        allEquipment: ko.observable(),
        switchOrderNumber: ko.observable(),
        departureTime: ko.observable(),
        fieldNotes: ko.observable()
      })
    }
    self.load = function (doc) {
      self._id(doc._id)
      self._rev(doc._rev)
      self._attachments(doc._attachments)
      //self.adds = ko.observableArray()

      self.CaseCover({
        caseId: ko.observable(doc.cover.caseId),
        recordDate: ko.observable(doc.cover.recordDate),
        outageOwner: ko.observable(doc.cover.outageOwner),
        businessUnit: ko.observable(doc.cover.businessUnit),
        costCenter: ko.observable(doc.cover.costCenter),
        activityDate: ko.observable(doc.cover.activityDate),
        activityDuration: ko.observable(doc.cover.activityDuration),
        fpc: ko.observable(doc.cover.fpc),
        assignee: ko.observable(doc.cover.assignee),
        outageID: ko.observable(doc.cover.outageID),
        activityDescription: ko.observable(doc.cover.activityDescription),
        address: ko.observable(doc.cover.address),
        coords: ko.computed(function () {
          var spot = self.geoLocation()
          return spot ? `${spot.coords.latitude},${spot.coords.longitude}` : ''
        })
      })

      self.Scope({
        terms: ko.observable(doc.scope.terms),
        activityList: ko.observableArray(doc.scope.activityList.map(function (e) {
          var names = Object.getOwnPropertyNames(e);
          var obs = {}
          for (let i = 0; i < names.length; i++) {
            obs[names[i]] = ko.observable(e[names[i]])
          }
          if (!obs.status) {
            obs['status'] = ko.observable("open")
          }
          return ko.observable(obs);
        })),
        requirementsSafety: ko.observableArray(doc.scope.requirementsSafety),
        requirementsSkills: ko.observableArray(doc.scope.requirementsSkills),
        requirementsEquipment: ko.observableArray(doc.scope.requirementsEquipment),
        notes: ko.observable(doc.scope.notes),
        uploadedFileName: ko.observable(doc.scope.uploadedFileName),
        addActivityRow: self.addRow,
        removeActivityRow: function (data) {
          self.Scope().activityList.remove(data)
        }
      })
    }
    self.toggleStatus = function (data) {
      //console.log(data, data.status())
      var ActivityStatusT = ["open", "partial", "done"];
      var idx = ActivityStatusT.indexOf(data.status())
      //console.log(idx, ActivityStatusT[idx])
      data.status(ActivityStatusT[(idx + 1) % 3])
      //console.log(data, data.status())
    };

    self.addCrewRow = function () {}

    self.activityFileUpload = function (data) {
      if (window.File && window.FileReader) {
        var fileInput = document.getElementById("activityFile")
        var files = fileInput.files
        if (files.length > 0) {
          var file = files[0]
          console.log(file.name, file.size)
          var reader = new FileReader()
          reader.onload = function (evt) {
            //console.log(evt.target.result)
            //self.Scope().uploadedFileName(file.name)
            //self.Scope().uploadedFile = evt.target.result
            self.adds.push({
              name: file.name,
              type: file.type,
              data: file //evt.target.result
            })
            fileInput.value = ""
          }
          reader.readAsBinaryString(file)
        }
      }
    }

    self.newFileCommand = function () {
      self.init()
      self.displayCaseUI(true)
    }
    self.cancelCommand = function () {
      self.displayCaseUI(false)
      self.displayFieldUI(false)
    }
    self.closeCommand = function () {
      self.saveCommand()
      self.displayCaseUI(false)
      self.displayFieldUI(false)
    }

    self.searchCommand = function () {
      var TargetFields = ["caseId", "outageID", "outageOwner", "assignee", "activityDate"]
      if (!self.searchTerm()) return
      var term = self.searchTerm().toLowerCase()
      var search = Portal.caseQuery(term);

      search.then(function (result) {
        //console.log(result)
        self.searchResults()
        var hits = []
        result.rows.forEach(function (r, ri) {
          var sct = 0
          for (let i = 0; i < TargetFields.length; i++) {
            if (r.value.hasOwnProperty(TargetFields[i]) && r.value[TargetFields[i]].toString().toLowerCase().includes(term)) {
              sct += (TargetFields.length - i)
            }
          }
          if (sct > 0)
            hits.push({
              rindex: ri,
              score: sct
            })
        })
        hits.sort(function (a, b) {
          return (b.score - a.score)
        })
        self.searchResults(hits.map(function (e) {
          return {
            score: e.score,
            value: result.rows[e.rindex].value,
            id: result.rows[e.rindex].id
          }
        }))
        if (hits.length == 0)
          swal({
            title: "Search",
            text: `No results matching search.`,
            timer: 2000
          });
        //console.log(result)
      })
    }
    self.loadCommand = function (target) {
      console.log("target", target)
      var bag = Portal.get(target.id)
      bag.then(function (doc) {
        console.log(doc)
        self.load(doc)

        self.displayCaseUI(true)
      })
    }
    self.fieldLoadCommand = function (target) {
      var bag = Portal.get(target.id)
      bag.then(function (doc) {
        console.log(doc)
        self.load(doc)

        self.displayFieldUI(true)
      })
    }


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

      self.adds().forEach(function (e) {
        (self._attachments())[e.name] = {
          content_type: e.type,
          data: e.data
        }
      });
      self.adds.removeAll()
      //console.log(self._attachments())

      var record = {
        _id: self._id(),
        _rev: self._rev(),
        _attachments: self._attachments(),
        cover: stripFunctions(ko.toJS(self.CaseCover)),
        scope: stripFunctions(ko.toJS(self.Scope))
      }
      console.log("Save Command Issued", record)
      Portal.save(record).then(function (ans) {
        console.log(ans)
        self._rev(ans.rev);
        self._attachments(self._attachments())
        swal({
          title: "Save Successful",
          text: `Job ${self.CaseCover().caseId()} was saved.`,
          timer: 2000
        });
      })
    }

    self.init()
  }
}