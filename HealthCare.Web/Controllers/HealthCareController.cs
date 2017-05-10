/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

using System.Configuration;
using HealthCare.Core.Data;
using Microsoft.SharePoint.Client;

namespace HealthCare.Web.Controllers
{
  using System.Web.Mvc;
  using System.Collections.Generic;
  using System;
  using HealthCare.Core;
  using HealthCare.Web.HelperClasses;
  using HealthCare.Core.Common;
  using CalendarEvent = HealthCare.Web.Models.CalendarEvent;
  using DateEvent = HealthCare.Web.Models.DateEvent;
  using HealthCare.Web.Models;
  using System.Threading.Tasks;
  using System.Globalization;
  using Newtonsoft.Json;

  /// <summary>
  /// Health Care Controller
  /// </summary>
  /// <seealso cref="System.Web.Mvc.Controller" />
  [Authorize]
  public class HealthCareController : Controller
  {
    // GET: HealthCare
    /// <summary>
    /// Indexes this instance.
    /// </summary>
    /// <returns></returns>
    public ActionResult Index()
    {
      return View();
    }

    // GET: HealthCare
    /// <summary>
    /// Indexes this instance.
    /// </summary>
    /// <returns></returns>
    [AllowAnonymous]
    public async Task<ActionResult> Guest(string uri)
    {
      var userAgent = HttpContext.Request.UserAgent;

      var isMobileDevice =
        MeetingHelper.IsMobileDevice(userAgent) || HttpContext.Request.Browser.IsMobileDevice;

      // For mobile requests, redirect to lamna application.
      if (isMobileDevice)
      {
        return await MobileIndex(uri);
      }

      return View((object)uri);
    }

    /// <summary>
    /// Mobiles the index.
    /// </summary>
    /// <param name="uri">The URI.</param>
    /// <returns></returns>
    public async Task<ActionResult> MobileIndex(string encryptedData)
    {
      var userAgent = HttpContext.Request.UserAgent;

      var isMobileDevice =
        MeetingHelper.IsMobileDevice(userAgent) || HttpContext.Request.Browser.IsMobileDevice;
      if (!isMobileDevice)
      {
        return await Guest(encryptedData);
      }

      var skypeMeeting = new SkypeMeeting();

      encryptedData = encryptedData.Replace(" ", "+");

      var values = EncryptionHelper.Decrypt(encryptedData.Trim());
      var queryParams = values.Split('&');

      foreach (string param in queryParams)
      {
        string[] paramValue = param.Split('=');

        switch (paramValue[0].ToUpper())
        {
          case "CUSTOMID":
            skypeMeeting.CustomId = paramValue[1];
            break;

          case "DISPLAYNAME":
            skypeMeeting.DisplayName = string.IsNullOrEmpty(paramValue[1])
              ? "Guest" : paramValue[1];
            break;

          case "EMRID":
            skypeMeeting.EmrId = paramValue[1];
            break;

          case "STARTTIME":
            skypeMeeting.StartTime = !string.IsNullOrEmpty(paramValue[1])
              ? Convert.ToDateTime(paramValue[1], CultureInfo.InvariantCulture) : DateTime.Now;
            break;

          case "PATIENT":
            bool isPatient;
            Boolean.TryParse(paramValue[1], out isPatient);
            skypeMeeting.IsPatient = isPatient;
            break;

          case "MEETINGID":
            skypeMeeting.ItemId = paramValue[1];
            break;

          case "USERTYPE":
            skypeMeeting.UserType = paramValue[1];
            skypeMeeting.IsPatient = skypeMeeting.UserType.Equals("Doctor", StringComparison.InvariantCultureIgnoreCase) ? false : true;
            break;

          case "JOINSKYPECLIENT":
            bool isSkypeClient;
            Boolean.TryParse(paramValue[1], out isSkypeClient);
            skypeMeeting.IsSkypeClient = isSkypeClient;
            break;
        }
      }

      skypeMeeting.MeetingId = skypeMeeting.CustomId + skypeMeeting.EmrId;

      if (string.IsNullOrEmpty(skypeMeeting.UserType))
      {
        skypeMeeting.UserType = skypeMeeting.IsPatient ? "Patient" : "Doctor";
      }

      if (string.IsNullOrEmpty(skypeMeeting.ItemId))
      {
        skypeMeeting.ItemId = SharePointRepository.CheckMeetingExists(skypeMeeting.MeetingId);
      }

      dynamic jsonResponse = null;
      if (string.IsNullOrEmpty(skypeMeeting.ItemId))
      {
        /* Mobile Device */
        string response = await MeetingHelper.GetAnonMeeting(string.Empty, string.Empty, SharePointRepository.GetDoctorsByDepartment("HealthCare"));
        jsonResponse = JsonConvert.DeserializeObject(response);
        skypeMeeting.ItemId = SharePointRepository.InsertMeetingData(jsonResponse, skypeMeeting.StartTime, skypeMeeting.StartTime.AddHours(1), string.Empty, skypeMeeting.DisplayName, string.Empty, skypeMeeting.MeetingId);
      }
      else
      {
        ListItem meetingDetails = SharePointRepository.GetMeetingUriDetails(skypeMeeting.ItemId);
        skypeMeeting.Url = Convert.ToString(meetingDetails["JoinURL"]);

        if (string.IsNullOrEmpty(skypeMeeting.Url) && !(skypeMeeting.IsSkypeClient))
        {
          string response = await MeetingHelper.GetAnonMeeting(string.Empty, string.Empty, SharePointRepository.GetDoctorsByDepartment("HealthCare"));
          jsonResponse = JsonConvert.DeserializeObject(response);
          string onlineMeetingUri = jsonResponse.OnlineMeetingUri;
          string onlineMeetingJoinUrl = jsonResponse.JoinUrl;
          SharePointRepository.UpdateMeetingUri(onlineMeetingUri, onlineMeetingJoinUrl, skypeMeeting.ItemId);
          ListItem meetingUri = SharePointRepository.GetMeetingUriDetails(skypeMeeting.ItemId);
          skypeMeeting.Url = Convert.ToString(meetingUri["JoinURL"]);
        }
      }

      if (jsonResponse != null)
      {
        skypeMeeting.Url = jsonResponse.JoinUrl;
      }

      skypeMeeting.Url = $"{ConfigurationManager.AppSettings["MobileSiteUri"]}?uri={skypeMeeting.Url}&id={skypeMeeting.ItemId}&questReq=yes&displayName={skypeMeeting.DisplayName}";

      return Redirect(skypeMeeting.Url);
    }

    /// <summary>
    /// Gets the configuration details.
    /// </summary>
    /// <returns>
    /// returns string.
    /// </returns>
    public JsonResult GetConfigurationDetails()
    {
      var returnValue = SharePointRepository.GetConfigurationDetails();
      return this.Json(returnValue, JsonRequestBehavior.AllowGet);
    }

    /// <summary>
    /// Gets the calendar events.
    /// </summary>
    /// <returns>
    /// returns list of calendar events object.
    /// </returns>
    [HttpGet]
    public JsonResult GetCalendarEvents()
    {
      var events = GetMeetingDetails(DateTime.Now);
      return this.Json(events, JsonRequestBehavior.AllowGet);
    }

    /// <summary>
    /// Gets the meeting details.
    /// </summary>
    /// <param name="startDate">The start date.</param>
    /// <returns></returns>
    private List<CalendarEvent> GetMeetingDetails(DateTime startDate)
    {
      var events = new List<CalendarEvent>();
      var itemCollection = SharePointRepository.GetOnlineMeetingDetails(startDate);
      if (itemCollection == null) return events;

      foreach (var item in itemCollection)
      {
        var event1 = new CalendarEvent();
        var id = Convert.ToInt32(item["ID"]);
        event1.Attendees = Convert.ToString(item["Attendees"]);
        event1.Subject = ConfigurationManager.AppSettings["ida:MeetingSubject"];
        event1.EventId = Convert.ToString(item["MeetingId"]);
        event1.Organizer = Convert.ToString(item["Organizer"]);
        event1.PatientName = Convert.ToString(item["PatientName"]);
        event1.DoctorName = Convert.ToString(item["Title"]);
        event1.MeetingUrl = ConfigurationManager.AppSettings["ida:HealthCarePortal"] + "/HealthCare/ConferenceDemo?meetingId=" + id;
        var dateEvent = new DateEvent { DateTimeValue = Convert.ToDateTime(item["StartTime"]) };
        event1.StartDate = dateEvent;
        var dateEvent1 = new DateEvent { DateTimeValue = Convert.ToDateTime(item["EndTime"]) };
        event1.EndDate = dateEvent1;
        events.Add(event1);
      }

      return events;
    }
  }
}