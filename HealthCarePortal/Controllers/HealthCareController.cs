/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */



namespace HealthCare.Portal.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using System.Web.Mvc;
    using System.Configuration;
    using System.Security.Claims;
    using System.Text;
    using System.Web.Configuration;
    using HealthCare.Core.Data;
    using HealthCare.Core.Models;
    using HealthCare.Portal.Filters;
    using HealthCare.Portal.HelperClasses;
    using HealthCare.Portal.Models;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Linq;

    /// <summary>
    /// The health care controller class.
    /// </summary>
    /// <seealso cref="System.Web.Mvc.Controller" />
    public class HealthCareController : Controller
    {
        /// <summary>
        /// Indexes this instance.
        /// </summary>
        /// <returns>returns ActionResult object.</returns>
        public ActionResult Index()
        {
            try
            {
                List<Models.CalendarEvent> events = this.GetCalendarEvents();
                return this.View(events);
            }
            catch (Exception)
            {
                return this.View("Error");
            }
        }

        /// <summary>
        /// Dashboards this instance.
        /// </summary>
        /// <returns>returns ActionResult object.</returns>
        [Authorize]
        public ActionResult Dashboard()
        {
            List<Models.CalendarEvent> events = this.GetCalendarEvents();
            return this.View(events);
        }

        /// <summary>
        /// Conferences the demo.
        /// </summary>
        /// <returns>returns ActionResult object.</returns>
        public ActionResult ConferenceDemo()
        {
            return string.IsNullOrEmpty(HttpContext.User.Identity.Name) ? this.View("ConferenceDemo", "_PatientLayout") : this.View("ConferenceDemo");
        }

        /// <summary>
        /// Conferences this instance.
        /// </summary>
        /// <returns>returns ActionResult object.</returns>
        public ActionResult BotMeeting()
        {
            try
            {
                //string token = await GetTokenForGraphAPI();
                return View();
            }
            catch (Exception)
            {
                return View("Error");
            }

        }

        /// <summary>
        /// Meetings this instance.
        /// </summary>
        /// <returns>returns ActionResult object.</returns>
        [Authorize]
        public ActionResult Meeting()
        {
            try
            {
                return this.View("Meeting");
            }
            catch (Exception)
            {
                return this.View("Error");
            }
        }

        /// <summary>
        /// Configurations this instance.
        /// </summary>
        /// <returns>returns ActionResult object.</returns>
        [Authorize]
        public ActionResult Configuration()
        {
            try
            {
                var userEmail = ClaimsPrincipal.Current.FindFirst(ClaimTypes.Name).Value;
                if (SharePointRepository.IsUserExistInGroup(userEmail,
                    ConfigurationManager.AppSettings["SharepointAdminGroup"]))
                {
                    return this.View("Configuration");
                }
                else
                {
                    return RedirectToAction("Error", "HealthCare", new { message = "You are unauthorized to access this page: " + Request.RawUrl });
                }
            }
            catch (Exception e)
            {
                return RedirectToAction("Error", "HealthCare", new { message = "Unknown exception occurred" + Request.RawUrl + ": " + e.Message });
            }
        }

        /// <summary>
        /// Errors the specified message.
        /// </summary>
        /// <param name="message">The message.</param>
        /// <returns></returns>
        public ActionResult Error(string message)
        {
            ViewBag.Message = message;
            return View("Error");
        }

        /// <summary>
        /// Sets the configuration.
        /// </summary>
        /// <param name="configurationDetails">The configuration details.</param>
        /// <returns>returns string.</returns>
        [HttpPost]
        [AntiForgeryTokenFilter]
        public string SetConfiguration(List<HealthCare.Core.Models.ConfigurationDetails> configurationDetails)
        {
            string returnValue = string.Empty;
            int count = 0;
            try
            {
                count = Helper.InsertConfigurationValuesInSharepoint(configurationDetails);
                if (count > 0)
                {
                    returnValue = "Successfully updated the configuration details.";
                }
            }
            catch (Exception exp)
            {
                returnValue = exp.Message;
            }

            return returnValue;
        }

        /// <summary>
        /// Gets the configuration details.
        /// </summary>
        /// <returns>returns string.</returns>
        public string GetConfigurationDetails()
        {
            IList<ConfigurationDetails> returnValue = null;
            try
            {
                returnValue = Helper.GetConfigurationDetailsFromSharepoint();
            }
            catch (Exception)
            {
                throw;
            }

            return JsonConvert.SerializeObject(returnValue);
        }

        /// <summary>
        /// Gets the configuration details by key.
        /// </summary>
        /// <param name="key">The key.</param>
        /// <returns>returns configuration value.</returns>
        public string GetConfigurationDetailsByKey(string key)
        {
            string returnValue = null;
            try
            {
                returnValue = Helper.GetConfigurationValueByKey(key);
            }
            catch (Exception)
            {
                throw;
            }

            return returnValue;
        }

        /// <summary>
        /// Configure devices
        /// </summary>
        /// <param name="from">From parameter.</param>
        /// <returns>
        /// returns ActionResult object.
        /// </returns>
        public ActionResult ConfigureDevices(string from)
        {
            try
            {
                return this.View("ConfigureDevices");
            }
            catch (Exception)
            {
                return this.View("Error");
            }
        }

        /// <summary>
        /// Gets the calendar events.
        /// </summary>
        /// <returns>returns list of calendar events object.</returns>
        public List<Models.CalendarEvent> GetCalendarEvents()
        {
            List<Models.CalendarEvent> events = null;
            try
            {
                events = Helper.GetMeetingDetailsFromSharePoint(DateTime.Now);
            }
            catch (Exception)
            {
                throw;
            }

            return events;
        }

        /// <summary>
        /// Available slots.
        /// </summary>
        /// <param name="dateString">The date string.</param>
        /// <returns>returns string.</returns>
        public string AvailableSlots(string dateString)
        {
            string resultValue = string.Empty;
            try
            {
                resultValue = Helper.AvailableSlotsFromSharePoint(dateString);
            }
            catch (Exception exp)
            {
                resultValue = exp.Message;
            }

            return resultValue;
        }

        /// <summary>
        /// Gets the meeting URI.
        /// </summary>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <returns>returns string.</returns>
        public string GetMeetingUri(string meetingId)
        {
            string meetingUri = string.Empty;
            try
            {
                meetingUri = Helper.GetMeetingDetailsFromSharePoint(meetingId);
            }
            catch (Exception exp)
            {
                meetingUri = exp.Message;
            }

            return meetingUri;
        }

        /// <summary>
        /// Inserts the attendees.
        /// </summary>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <param name="callRating">The call rating.</param>
        /// <param name="audioIssues">The audio issues.</param>
        /// <param name="audioIssueList">The audio issue list.</param>
        /// <param name="videoIssues">The video issues.</param>
        /// <param name="videoIssueList">The video issue list.</param>
        /// <param name="comments">The comments.</param>
        /// <param name="userName">Name of the user.</param>
        /// <param name="bandwidth">The bandwidth.</param>
        /// <param name="ping">The ping.</param>
        /// <param name="browserType">Type of the browser.</param>
        public void InsertAttendees(string meetingId, string callRating, string audioIssues, string audioIssueList, string videoIssues, string videoIssueList, string comments, string userName, string bandwidth, string ping, string browserType)
        {
            Helper.InsertAttendees(meetingId, callRating, audioIssues, audioIssueList, videoIssues, videoIssueList, comments, userName, bandwidth, ping, browserType);
        }

        /// <summary>
        /// Updates the meeting end time.
        /// </summary>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <param name="time">The time.</param>
        public void UpdateMeetingEndTime(string itemId, DateTime time)
        {
            try
            {
                Helper.UpdateMeetingEndTime(itemId, time);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Meetings the invitation.
        /// </summary>
        /// <param name="participants">The participants.</param>
        /// <param name="organizer">The organizer.</param>
        /// <param name="slots">The slots.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <returns>returns string.</returns>
        [OutputCache(NoStore = true, Duration = 0)]
        public async Task<string> MeetingInvitation(string participants, string organizer, string slots, string patientName, string questionCategory)
        {
            string returnString = string.Empty;
            try
            {
                DateTime dateStartDate = this.GetDateTime(slots);
                DateTime dateEndDate = dateStartDate.AddHours(1);

                dynamic jsonResponse = Task.Run(() => Helper.CreateOnlineMeetingUri(participants, dateStartDate, dateEndDate, patientName)).Result;
                string itemId = await Helper.InsertMeetingIntoSharePoint(jsonResponse, dateStartDate, dateEndDate, patientName, questionCategory);
                int availableItemId = this.GetIDFromSlot(slots);
                Helper.UpdateSharepointList(availableItemId);
                string error;
                var portalUrl = new Uri(WebConfigurationManager.AppSettings["ida:HealthCarePortal"]).AbsoluteUri +
                                 "api/meeting?";
                var queryStringParameter = "meetingId=" + itemId + "&userType=Patient&displayName=" + patientName;
                var encrptedParameters = EncryptionHelper.Encrypt(queryStringParameter);
                var meetingUrl = portalUrl + encrptedParameters;
                var invitation = HealthCare.Core.Common.MeetingInvitation.SendEmail(meetingUrl, participants,
                    out error);

                if (!invitation)
                {
                    returnString = "Failed to send email " + error;
                }
                returnString = "Success";
            }
            catch (Exception exp)
            {
                returnString = exp.Message;
            }

            return returnString;
        }

        /// <summary>
        /// Gets the anon meeting.
        /// </summary>
        /// <param name="subject">The subject.</param>
        /// <param name="description">The description.</param>
        /// <returns></returns>
        [HttpPost]
        [AntiForgeryTokenFilter]
        public async Task<string> GetAnonMeeting(string subject, string description)
        {
           return await Helper.GetAnonMeeting(subject, description);
        }

        /// <summary>
        /// Gets the anon token.
        /// </summary>
        /// <param name="applicationSessionId">The application session identifier.</param>
        /// <param name="allowedOrigins">The allowed origins.</param>
        /// <param name="meetingUrl">The meeting URL.</param>
        /// <returns></returns>
        [HttpPost]
        [AntiForgeryTokenFilter]
        public async Task<string> GetAnonToken(string applicationSessionId, string allowedOrigins, string meetingUrl)
        {
            var jsonResponseString = await GetAnonTokenJob(applicationSessionId, allowedOrigins, meetingUrl);
            //// TODO: Move this method to service class
            return JsonConvert.DeserializeObject(jsonResponseString).ToString();
        }

        private async Task<string> GetAnonTokenJob(string applicationSessionId, string allowedOrigins, string meetingUrl)
        {
            string jsonResponseString;
            try
            {
                var jsonobject = new JObject
                {
                    {"ApplicationSessionId", applicationSessionId},
                    {"AllowedOrigins", allowedOrigins},
                    {"MeetingUrl", meetingUrl}
                };

                using (var wc = new WebClient())
                {
                    string trustedApiUri = $"{WebConfigurationManager.AppSettings["TrustedApi"]}/GetAnonTokenJob";
                    wc.Headers.Add(HttpRequestHeader.Accept, "application/json");
                    wc.Headers.Add(HttpRequestHeader.ContentType, "application/json");
                    wc.Headers.Add("user-agent", "Other");
                    jsonResponseString = await wc.UploadStringTaskAsync(new Uri(trustedApiUri), "POST", jsonobject.ToString());
                }
            }
            catch
            {
                throw;
            }

            return jsonResponseString;
        }
        /// <summary>
        /// Gets the decrypted URI.
        /// </summary>
        /// <param name="encryptedUri">The encrypted URI.</param>
        /// <returns>decrypted URI</returns>
        public string GetDecryptedUri(string encryptedUri)
        {
            var decryptedUri = EncryptionHelper.Decrypt(encryptedUri);
            return decryptedUri;
        }


        /// <summary>
        /// Meetings the invitation without URI.
        /// </summary>
        /// <param name="participantEmail">The participant email.</param>
        /// <param name="slots">The slots.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <param name="questionCategory">The question category.</param>
        /// <returns>Token Value</returns>
        [HttpPost]
        [AntiForgeryTokenFilter]
        public async Task<string> MeetingInvitationWithoutUri(string participantEmail, string slots, string patientName, string questionCategory, string doctorName = null)
        {
            DateTime dateStartDate = this.GetDateTime(slots);

            if (string.IsNullOrEmpty(doctorName))
            {
                doctorName = ClaimsPrincipal.Current.Claims.Where(c => c.Type == "name").Select(c => c.Value).SingleOrDefault();
            }
            var itemId = Helper.InsertBlankMeetingDetails(dateStartDate, dateStartDate.AddHours(1), HttpContext.User.Identity.Name, doctorName, patientName, participantEmail, string.Empty, questionCategory);
            int availableItemId = this.GetIDFromSlot(slots);
            Helper.UpdateSharepointList(availableItemId);
            string error;
            var portalUrl = new Uri(WebConfigurationManager.AppSettings["ida:HealthCarePortal"]).AbsoluteUri +
                             "api/meeting?";
            var queryStringParameter = "meetingId=" + itemId + "&userType=Patient&displayName=" + patientName;
            var encrptedParameters = EncryptionHelper.Encrypt(queryStringParameter);
            var meetingUrl = portalUrl + encrptedParameters;
            var invitation = HealthCare.Core.Common.MeetingInvitation.SendEmail(meetingUrl, participantEmail,
                out error);

            if (!invitation)
            {
                return "Failed to send email " + error;
            }
            return "Success";
        }

        /// <summary>
        /// Duplicate method need to remove it entirely.
        /// </summary>
        /// <param name="participantEmail">The participant email.</param>
        /// <param name="slots">The slots.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <param name="questionCategory">The question category.</param>
        /// <param name="doctorName">Name of the doctor.</param>
        /// <returns></returns>
        public async Task<string> MeetingInvitationWithoutUriDuplicate(string participantEmail, string slots, string patientName, string questionCategory, string doctorName = null)
        {
            DateTime dateStartDate = this.GetDateTime(slots);

            if (string.IsNullOrEmpty(doctorName))
            {
                doctorName = ClaimsPrincipal.Current.Claims.Where(c => c.Type == "name").Select(c => c.Value).SingleOrDefault();
            }
            var itemId = Helper.InsertBlankMeetingDetails(dateStartDate, dateStartDate.AddHours(1), HttpContext.User.Identity.Name, doctorName, patientName, participantEmail, string.Empty, questionCategory);
            int availableItemId = this.GetIDFromSlot(slots);
            Helper.UpdateSharepointList(availableItemId);
            string error;
            var portalUrl = new Uri(WebConfigurationManager.AppSettings["ida:HealthCarePortal"]).AbsoluteUri +
                             "api/meeting?";
            var queryStringParameter = "meetingId=" + itemId + "&userType=Patient&displayName=" + patientName;
            var encrptedParameters = EncryptionHelper.Encrypt(queryStringParameter);
            var meetingUrl = portalUrl + encrptedParameters;
            var invitation = HealthCare.Core.Common.MeetingInvitation.SendEmail(meetingUrl, participantEmail,
                out error);

            if (!invitation)
            {
                return "Failed to send email " + error;
            }
            return "Success";
        }

        /// <summary>
        /// Updates the meeting details.
        /// </summary>
        /// <param name="itemId">The item identifier.</param>
        /// <param name="meetingUrl">The meeting URL.</param>
        /// <param name="meetingUri">The meeting URI.</param>
        public void UpdateMeetingDetails(string itemId, string meetingUrl, string meetingUri)
        {
            Helper.UpdateMeetingUri(meetingUri, meetingUrl, itemId);
        }

        /// <summary>
        /// Gets the questionnaire.
        /// </summary>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <param name="questionCategory">The question category.</param>
        /// <returns>returns string.</returns>
        [HttpGet]
        public string GetQuestionaire(string meetingId, string questionCategory)
        {
            try
            {
                var questions = Helper.GetQuestionaire(questionCategory);

                foreach (var qu in questions)
                {
                    qu.MeetingId = meetingId;
                }

                return JsonConvert.SerializeObject(questions);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Saves the questionnaire.
        /// </summary>
        /// <param name="value">The value.</param>
        [HttpPost]
        [AntiForgeryTokenFilter]
        public void SaveQuestionnaire(IList<Questionnaire> value)
        {
            try
            {
                if (value.Any())
                {
                    var meetingId = value[0].MeetingId;
                    Helper.SaveQuestionnaire(value, meetingId);
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Gets the doctors.
        /// </summary>
        /// <param name="department">The department.</param>
        /// <returns>returns string</returns>
        public string GetDoctors(string department)
        {
            List<Peers> doctors = new List<Peers>();
            var allowPeersControl = Helper.GetConfigurationValueByKey("AllowPeerChatControl").ToUpper() == "TRUE" ? true : false;
            if (allowPeersControl)
            {
                doctors = Helper.GetDoctorsByDepartment(department);
            }

            return JsonConvert.SerializeObject(doctors);
        }

        public string GetConferenceLeaders()
        {
            var sipAddresses = new StringBuilder();
            List<Peers> doctors;
            {
                doctors = Helper.GetDoctorsByDepartment("Peers");
            }

            foreach (var p in doctors)
            {
                sipAddresses.Append($"sip:{p.Email},");
            }

            var counter = sipAddresses.Length;

            return sipAddresses.ToString().Remove(counter - 1);
        }

        /// <summary>
        /// Updates the patient status.
        /// </summary>
        /// <param name="meetingId">The meeting identifier.</param>clo
        [HttpGet]
        public void UpdatePatientStatus(string itemId)
        {
            try
            {
                Helper.UpdatePatientStatus(itemId);
            }
            catch (Exception)
            {
                throw;
            }
        }


        /// <summary>
        /// Checks the time of joining meeting.
        /// </summary>
        /// <param name="startDateTime">The start date time.</param>
        public bool CheckTimeOfJoiningMeeting(string itemId, int offsetTime)
        {
            if (GetConfigurationDetailsByKey("TimeOfJoiningCall").ToUpper() == "TRUE")
            {
                DateTime dtStart = Helper.GetStartDateOFMeeting(itemId);
                TimeSpan span = dtStart - DateTime.UtcNow.AddHours(8).AddMinutes(-offsetTime);
                if (span.TotalMinutes > 30)
                {
                    return false;
                }
            }

            return true;
        }

        /// <summary>
        /// Gets the questionnaire information.
        /// </summary>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <returns></returns>
        public JsonResult GetQuestionnaireInformation(string meetingId)
        {
            return Json(Helper.GetQuestionnaireInformation(meetingId), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Checks the user in SharePoint group.
        /// </summary>
        /// <returns>User exits in sharepoint</returns>
        public bool CheckUserInSharePointGroup()
        {
            return Helper.CheckUserExistsInGroup(this.HttpContext.User.Identity.Name);
        }

        /// <summary>
        /// Gets the question category.
        /// </summary>
        /// <returns></returns>
        public JsonResult GetQuestionCategory()
        {
            return Json(Helper.GetQuestionCategory(), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Gets the date time.
        /// </summary>
        /// <param name="slots">The slots.</param>
        /// <returns>returns date time object.</returns>
        private DateTime GetDateTime(string slots)
        {
            DateTime dateStart = DateTime.MinValue;
            try
            {
                string[] arr = slots.Split(';');
                if (arr != null && arr.Length > 0)
                {
                    foreach (string str in arr)
                    {
                        if (!string.IsNullOrEmpty(str))
                        {
                            string[] arr1 = str.Split('_');
                            if (arr1 != null && arr1.Length > 0)
                            {
                                string id = arr1[1];
                                int year = Convert.ToInt32(arr1[2]);
                                int month = Convert.ToInt32(arr1[3]);
                                int day = Convert.ToInt32(arr1[4]);
                                string[] time = arr1[5].Split(':');
                                dateStart = new DateTime(year, month, day, Convert.ToInt32(time[0]), Convert.ToInt32(time[1]), 0, 0);
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }

            return dateStart;
        }

        /// <summary>
        /// Gets the identifier from slot.
        /// </summary>
        /// <param name="slots">The slots.</param>
        /// <returns>returns integer.</returns>
        private int GetIDFromSlot(string slots)
        {
            int meetingId = 0;
            try
            {
                string[] arr = slots.Split(';');
                if (arr != null && arr.Length > 0)
                {
                    foreach (string str in arr)
                    {
                        if (!string.IsNullOrEmpty(str))
                        {
                            string[] arr1 = str.Split('_');
                            if (arr1 != null && arr1.Length > 0)
                            {
                                meetingId = Convert.ToInt32(arr1[1]);
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }

            return meetingId;
        }
    }
}