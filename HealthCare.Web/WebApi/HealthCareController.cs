/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

using System.Configuration;
using HealthCare.Core.Data;
using Microsoft.SharePoint.Client;

namespace HealthCare.Web.WebApi
{
  using System;
  using System.Collections.Generic;
  using System.Globalization;
  using System.Linq;
  using System.Web.Http;
  using HealthCare.Core.Common;
  using HealthCare.Core.Models;
  using HealthCare.Core;
  using HealthCare.Web.HelperClasses;
  using CalendarEvent = HealthCare.Web.Models.CalendarEvent;
  using DateEvent = HealthCare.Web.Models.DateEvent;
  using System.Web;
  using System.Threading.Tasks;
  using HealthCare.Web.Models;
  using Newtonsoft.Json;
  using System.Security.Claims;

  [RoutePrefix("api/healthcare")]
  public class HealthCareController : ApiController
  {
    /// <summary>
    /// Gets the configuration details.
    /// </summary>
    /// <returns>
    /// returns string.
    /// </returns>
    [Route("configuration")]
    [HttpGet]
    public IHttpActionResult GetAppConfigs()
    {
      var configs = SharePointRepository.GetConfigurationDetails();
      return Ok(configs);
    }

    /// <summary>
    ///     Sets the configuration.
    /// </summary>
    /// <param name="configurationDetails">The configuration details.</param>
    /// <returns>returns string.</returns>
    [HttpPost]
    [Route("configuration")]
    public IHttpActionResult SaveAppConfiguration(List<ConfigurationDetails> configurationDetails)
    {
      InsertConfigurationValues(configurationDetails);
      return Ok();
    }

    /// <summary>
    /// Gets the bot token.
    /// </summary>
    /// <returns>Get bot embed url</returns>
    [HttpGet]
    [Route("bot-token")]
    public IHttpActionResult GetBotEmbedUrl()
    {
      return Ok(ConfigurationManager.AppSettings["BotUrlEmbed"]);
    }

    /// <summary>
    /// Inserts the configuration values.
    /// </summary>
    /// <param name="configDetails">The configuration details.</param>
    /// <returns></returns>
    private void InsertConfigurationValues(IEnumerable<ConfigurationDetails> configDetails)
    {
      foreach (var config in configDetails)
      {
        SharePointRepository.InsertConfigurationDetails(config.Key, config.Value);
      }
    }

    /// <summary>
    /// Gets the calendar events.
    /// </summary>
    /// <returns>
    /// returns list of calendar events object.
    /// </returns>
    [HttpGet]
    [Route("appointments")]
    public IHttpActionResult GetAppointments()
    {
      var events = GetMeetingDetails(DateTime.Now);
      return Ok(events);
    }

    /// <summary>
    /// Gets the questionnaires.
    /// </summary>
    /// <returns>List of questionnaires</returns>
    [HttpGet]
    [Route("questionnaires")]
    public IHttpActionResult GetQuestionnaires()
    {
      var questionnaires = SharePointRepository.GetQuestionnaireCategory();
      return Ok(questionnaires);
    }

    /// <summary>
    /// Gets the meeting URI.
    /// </summary>
    /// <param name="encryptedData">The encrypted data.</param>
    /// <returns>
    /// Meeting Uri
    /// </returns>
    [HttpGet]
    [Route("meeting-metadata")]
    public async Task<IHttpActionResult> GetMeetingUri(string encryptedData)
    {
      var skypeMeeting = new SkypeMeeting();

      var userAgent = HttpContext.Current.Request.UserAgent;
      var isMobileDevice =
        MeetingHelper.IsMobileDevice(userAgent) || HttpContext.Current.Request.Browser.IsMobileDevice;

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
        if (isMobileDevice)
        {
          string response = await MeetingHelper.GetAnonMeeting(string.Empty, string.Empty, SharePointRepository.GetDoctorsByDepartment("HealthCare"));
          jsonResponse = JsonConvert.DeserializeObject(response);
          skypeMeeting.ItemId = SharePointRepository.InsertMeetingData(jsonResponse, skypeMeeting.StartTime, skypeMeeting.StartTime.AddHours(1), string.Empty, skypeMeeting.DisplayName, string.Empty, skypeMeeting.MeetingId);
        }
        else
        {
          //TODO: SQL Changes
          skypeMeeting.ItemId = InsertBlankMeetingDetails(skypeMeeting.StartTime, skypeMeeting.StartTime.AddHours(1), string.Empty, string.Empty, skypeMeeting.DisplayName, string.Empty, skypeMeeting.MeetingId);
        }
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
          //ListItem meetingUri = SharePointRepository.GetMeetingUriDetails(skypeMeeting.ItemId);
          //skypeMeeting.Url = Convert.ToString(meetingDetails["JoinURL"]);
          //skypeMeeting.Url = onlineMeetingJoinUrl;
        }
      }

      if (isMobileDevice)
      {
        if (jsonResponse != null)
        {
          skypeMeeting.Url = jsonResponse.JoinUrl;
        }

        skypeMeeting.Url = $"{ConfigurationManager.AppSettings["MobileSiteUri"]}?uri={skypeMeeting.Url}&id={skypeMeeting.ItemId}&questReq=yes&displayName={skypeMeeting.DisplayName}";
      }
      else
      {
        if (skypeMeeting.IsSkypeClient)
        {
          skypeMeeting.Url = "conf:sip:" + skypeMeeting.Url;
        }
      }

      return Ok(skypeMeeting);
    }

    /// <summary>
    ///     Gets the doctors.
    /// </summary>
    /// <param name="department">The department.</param>
    /// <returns>returns string</returns>
    [HttpGet]
    [Route("doctors")]
    public IHttpActionResult GetDoctors()
    {
      var doctors = new List<Peers>();
      var allowPeersControl = SharePointRepository.GetConfigValueByKey("AllowPeerChatControl").ToUpper() == "TRUE"
          ? true
          : false;

      if (allowPeersControl)
      {
        doctors = SharePointRepository.GetDoctorsByDepartment("HealthCare");
      }

      return Ok(doctors);
    }

    /// <summary>
    /// Gets the conference leaders.
    /// </summary>
    /// <returns>List of doctors</returns>
    [HttpGet]
    [Route("leaders")]
    public IHttpActionResult GetConferenceLeaders()
    {
      var leaders = SharePointRepository.GetDoctorsByDepartment("HealthCare");

      return Ok(leaders);
    }

    /// <summary>
    /// Gets the meeting URI.
    /// </summary>
    /// <param name="meetingId">The meeting identifier.</param>
    /// <returns>
    /// returns meeting.
    /// </returns>
    [HttpGet]
    [Route("meeting-details")]
    public IHttpActionResult GetMeeting(string meetingId)
    {
      HealthCare.Web.Models.MeetingDetails meeting = null;
      var meetings = SharePointRepository.GetMeetingUriDetails(meetingId);
      if (meetings != null)
      {
        meeting = new HealthCare.Web.Models.MeetingDetails
        {
          ID = Convert.ToString(meetings["ID"]),
          OnLineMeetingId = Convert.ToString(meetings["MeetingId"]),
          OnlineMeetingUri = Convert.ToString(meetings["OnlineMeetingURI"]),
          OnlineMeetingUrl = Convert.ToString(meetings["JoinURL"]),
          Organizer = Convert.ToString(meetings["Organizer"]),
          Attendees = Convert.ToString(meetings["Attendees"]),
          JoinUrl = Convert.ToString(meetings["JoinURL"]),
          QuestionnaireRequired = Convert.ToString(meetings["QuestionnaireRequired"]),
          PatientName = Convert.ToString(meetings["PatientName"]),
          Status = Convert.ToString(meetings["Status"]),
          AppointmentDate = Convert.ToString(meetings["AppointmentDate"]),
          QuestionCategory = Convert.ToString(meetings["QuestionCategory"]),
          StartTime = Convert.ToDateTime(meetings["StartTime"]),
          EndTime = Convert.ToDateTime(meetings["EndTime"]),
          DoctorsName = Convert.ToString(meetings["Title"])
          //IsDevicesTestDone = Convert.ToBoolean(meetings["IsDevicesTestDone"])
        };
      }

      return Ok(meeting);
    }

    [HttpGet]
    [Route("checktimeofjoining")]
    public IHttpActionResult CheckTimeOfJoiningMeeting(string itemId, int offsetTime)
    {
      var IsRestrictTimeOfJoiningEnabled = SharePointRepository.GetConfigValueByKey("TimeOfJoiningCall");

      if (IsRestrictTimeOfJoiningEnabled.ToUpper() == "TRUE")
      {
        var dtStart = SharePointRepository.GetStartDateOfMeeting(itemId);
        var span = dtStart - DateTime.UtcNow.AddHours(8).AddMinutes(-offsetTime);
        if (span.TotalMinutes > 30)
        {
          return Ok(false); ;
        }
      }

      return Ok(true); ;
    }

    /// <summary>
    /// Saves the meeting.
    /// </summary>
    /// <param name="participantEmail">The participant email.</param>
    /// <param name="slots">The slots.</param>
    /// <param name="patientName">Name of the patient.</param>
    /// <param name="questionCategory">The question category.</param>
    /// <param name="doctorName">Name of the doctor.</param>
    /// <returns></returns>
    [HttpPost]
    [Route("appointment")]
    [Authorize]
    public IHttpActionResult SaveMeeting(Appointment appt)
    {
      int bookingTime = 0;
      if (!string.IsNullOrEmpty(appt.TimeSlot))
      {
        var time = appt.TimeSlot.Split(' ');
        if (time.Length == 2)
        {
          bookingTime = (time[1].ToUpper().Equals("PM")) ? 12 + int.Parse(time[0]) : int.Parse(time[0]);
        }
      }

      var startDate = new DateTime(appt.Date.Year, appt.Date.Month, appt.Date.Day, bookingTime, 0, 0);
      if (startDate.ToUniversalTime() < DateTime.Now.ToUniversalTime())
      {
        return BadRequest("Please provide a future date !!");
      }

      if (string.IsNullOrEmpty(appt.DoctorName))
      {
        appt.DoctorName =
            ClaimsPrincipal.Current.Claims.Where(c => c.Type == "name").Select(c => c.Value).SingleOrDefault();
      }

      var itemId = InsertBlankMeetingDetails(startDate, startDate.AddHours(1), User.Identity.Name, appt.DoctorName,
        appt.FullName, appt.Email, string.Empty, appt.Questionnaire);

      var portalUrl = new Uri(ConfigurationManager.AppSettings["ida:HealthCarePortal"]).AbsoluteUri + "healthcare/guest?uri=";
      var queryStringParameter = $"meetingId={itemId}&userType=Patient&displayName={appt.FullName}";
      var encrptedParameters = EncryptionHelper.Encrypt(queryStringParameter);

      var meetingUrl = portalUrl + encrptedParameters;
      string error;
      var hasEmailInviteSent = MeetingInvitation.SendEmail(meetingUrl, appt.Email, out error);

      if (!hasEmailInviteSent)
      {
        Ok(false);
      }
      return Ok(true);
    }

    /// <summary>
    /// Sends the email invite.
    /// </summary>
    /// <param name="particpantEmailId">The particpant email identifier.</param>
    /// <param name="patientName">Name of the patient.</param>
    /// <param name="isDoctor">The is doctor.</param>
    /// <param name="itemId">The item identifier.</param>
    /// <returns></returns>
    [HttpPost]
    [Route("email-invite")]
    public IHttpActionResult SendEmailInvite(Appointment appt)
    {
      var portalUrl = new Uri(ConfigurationManager.AppSettings["ida:HealthCarePortal"]).AbsoluteUri +
                      "healthcare/guest?uri=";

      var userType = appt.IsDoctor ? "Doctor" : "Patient";

      var queryStringParameter = $"meetingId={appt.ItemId}&userType={userType}&displayName={appt.FullName}";
      var encrptedParameters = EncryptionHelper.Encrypt(queryStringParameter);

      var meetingUrl = portalUrl + encrptedParameters;

      string error;
      var hasEmailInviteSent = MeetingInvitation.SendEmail(meetingUrl, appt.Email, out error);

      if (!hasEmailInviteSent)
      {
        Ok(false);
      }

      return Ok(true);
    }

    /// <summary>
    /// Inserts the blank meeting details.
    /// </summary>
    /// <param name="startDateTime">The start date time.</param>
    /// <param name="endDateTime">The end date time.</param>
    /// <param name="organizerEmail">The organizer email.</param>
    /// <param name="doctorName">Name of the doctor.</param>
    /// <param name="patientName">Name of the patient.</param>
    /// <param name="patientEmail">The patient email.</param>
    /// <param name="meetingId">The meeting identifier.</param>
    /// <param name="questionCategory">The question category.</param>
    /// <returns></returns>
    private string InsertBlankMeetingDetails(DateTime startDateTime, DateTime endDateTime, string organizerEmail, string doctorName, string patientName, string patientEmail,
      string meetingId, string questionCategory = null)
    {
      return SharePointRepository.CreateMeetingDetails(startDateTime, endDateTime, organizerEmail, doctorName, patientName, patientEmail, meetingId, questionCategory);
    }

    /// <summary>
    /// Gets the meeting details.
    /// </summary>
    /// <param name="startDate">The start date.</param>
    /// <returns></returns>
    private IEnumerable<CalendarEvent> GetMeetingDetails(DateTime startDate)
    {
      var events = new List<CalendarEvent>();
      var itemCollection = SharePointRepository.GetOnlineMeetingDetails(startDate);
      if (itemCollection == null) return events;

      events.AddRange(itemCollection.Select(item => new CalendarEvent
      {
        Attendees = Convert.ToString(item["Attendees"]),
        Subject = ConfigurationManager.AppSettings["ida:MeetingSubject"],
        EventId = Convert.ToString(item["MeetingId"]),
        Organizer = Convert.ToString(item["Organizer"]),
        PatientName = Convert.ToString(item["PatientName"]),
        DoctorName = Convert.ToString(item["Title"]),
        MeetingUrl = ConfigurationManager.AppSettings["ida:HealthCarePortal"] + "/HealthCare/ConferenceDemo?meetingId=" + Convert.ToInt32(item["ID"]),
        StartDate = new DateEvent { DateTimeValue = Convert.ToDateTime(item["StartTime"]) },
        EndDate = new DateEvent { DateTimeValue = Convert.ToDateTime(item["EndTime"]) }
      }));

      return events;
    }
  }
}