/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal.HelperClasses
{
    using System;
    using System.Collections.Generic;
    using System.Data;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using System.Web.Configuration;
    using HealthCare.Core.Data;
    using Microsoft.IdentityModel.Clients.ActiveDirectory;
    using Microsoft.SharePoint.Client;
    using Models;
    using Newtonsoft.Json;
    
    /// <summary>
    /// Authentication Helper class.
    /// </summary>
    public static class Helper
    {
        /// <summary>
        /// The user details
        /// </summary>
        private static UserInfo userDetails;

        /// <summary>
        /// Available slots from share point.
        /// </summary>
        /// <param name="dateString">The date string.</param>
        /// <returns>returns Available slots.</returns>
        public static string AvailableSlotsFromSharePoint(string dateString)
        {
            string returnSlots = string.Empty;
            DateTime dateReceived = Convert.ToDateTime(dateString);
            try
            {
                returnSlots = SharePointRepository.GetAvailableSlots(dateReceived);
            }
            catch (Exception)
            {
                throw;
            }

            return returnSlots;
        }

        /// <summary>
        /// Gets the meeting details from share point.
        /// </summary>
        /// <param name="itemId">The meeting identifier.</param>
        /// <returns>returns success or failure.</returns>
        public static string GetMeetingDetailsFromSharePoint(string itemId)
        {
            string jsonstring = string.Empty;
            ListItem item = null;
            MeetingDetails meetings = null;
            try
            {
                item = SharePointRepository.GetMeetingUriDetails(itemId);
                if (item != null)
                {
                    meetings = new MeetingDetails()
                    {
                        ID = Convert.ToString(item["ID"]),
                        OnLineMeetingId = Convert.ToString(item["MeetingId"]),
                        OnlineMeetingUri = Convert.ToString(item["OnlineMeetingURI"]),
                        OnlineMeetingUrl = Convert.ToString(item["JoinURL"]),
                        Organizer = Convert.ToString(item["Organizer"]),
                        Attendees = Convert.ToString(item["Attendees"]),
                        JoinUrl = Convert.ToString(item["JoinURL"]),
                        QuestionnaireRequired = Convert.ToString(item["QuestionnaireRequired"]),
                        PatientName = Convert.ToString(item["PatientName"]),
                        Status = Convert.ToString(item["Status"]),
                        AppointmentDate = Convert.ToString(item["AppointmentDate"]),
                        QuestionCategory = Convert.ToString(item["QuestionCategory"]),
                        StartTime = Convert.ToDateTime(item["StartTime"]),
                        EndTime = Convert.ToDateTime(item["EndTime"]),
                        DoctorsName = Convert.ToString(item["Title"]),
                    };
                }

                jsonstring = JsonConvert.SerializeObject(meetings);
            }
            catch (Exception)
            {
                throw;
            }

            return jsonstring;
        }

        /// <summary>
        /// Gets the meeting join URL.
        /// </summary>
        /// <param name="itemId">The item identifier.</param>
        /// <returns>meeting join URI</returns>
        public static string GetMeetingJoinUrl(string itemId)
        {
            ListItem item = SharePointRepository.GetMeetingUriDetails(itemId);
            return Convert.ToString(item["JoinURL"]);
        }

        /// <summary>
        /// Inserts the configuration values in SharePoint.
        /// </summary>
        /// <param name="configDetails">The configuration details.</param>
        /// <returns>returns number of rows inserted.</returns>
        public static int InsertConfigurationValuesInSharepoint(List<Core.Models.ConfigurationDetails> configDetails)
        {
            try
            {
                foreach (Core.Models.ConfigurationDetails config in configDetails)
                {
                    SharePointRepository.InsertConfigurationDetails(config.Key, config.Value);
                }
            }
            catch (Exception)
            {
                throw;
            }

            return 1;
        }

        /// <summary>
        /// Gets the configuration details from SharePoint.
        /// </summary>
        /// <returns>returns configuration details object.</returns>
        public static IList<Core.Models.ConfigurationDetails> GetConfigurationDetailsFromSharepoint()
        {
            IList<Core.Models.ConfigurationDetails> returnValue = null;
            try
            {
                returnValue = SharePointRepository.GetConfigurationDetails().ToList();
            }
            catch (Exception)
            {
                throw;
            }

            return returnValue;
        }

        /// <summary>
        /// Gets the configuration value by key.
        /// </summary>
        /// <param name="key">The key.</param>
        /// <returns>returns configuration key.</returns>
        public static string GetConfigurationValueByKey(string key)
        {
            string returnValue = null;
            try
            {
                returnValue = SharePointRepository.GetConfigValueByKey(key);
            }
            catch (Exception)
            {
                throw;
            }

            return returnValue;
        }

        /// <summary>
        /// Creates the post request.
        /// </summary>
        /// <param name="uri">The URI.</param>
        /// <param name="method">The method.</param>
        /// <param name="accessToken">The access token.</param>
        /// <param name="json">The JSON.</param>
        /// <param name="contentType">Type of the content.</param>
        /// <returns>returns http web request object.</returns>
        public static HttpWebRequest CreatePostRequest(string uri, string method, string accessToken, string json, string contentType)
        {
            HttpWebRequest request = WebRequest.Create(uri) as HttpWebRequest;
            request.KeepAlive = true;
            request.Method = method;
            request.ContentType = contentType;
            if (!string.IsNullOrEmpty(accessToken))
            {
                request.Headers.Add("Authorization", string.Format("Bearer {0}", accessToken));
            }

            if (!string.IsNullOrEmpty(json))
            {
                request.ContentLength = json.Length;

                using (var streamWriter = new StreamWriter(request.GetRequestStream()))
                {
                    streamWriter.Write(json);
                    streamWriter.Flush();
                }
            }
            else
            {
                request.ContentLength = 0;
            }

            return request;
        }

        /// <summary>
        /// Gets the response.
        /// </summary>
        /// <param name="request">The request.</param>
        /// <returns>returns string.</returns>
        public static string GetResponse(HttpWebRequest request)
        {
            string response = string.Empty;
            using (HttpWebResponse httpResponse = request.GetResponse() as HttpWebResponse)
            {
                ////Get StreamReader that holds the response stream
                using (StreamReader reader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    response = reader.ReadToEnd();
                }
            }

            return response;
        }

        /// <summary>
        /// Updates the SharePoint list.
        /// </summary>
        /// <param name="id">The identifier.</param>
        public static void UpdateSharepointList(int id)
        {
            try
            {
                SharePointRepository.UpdateAvailableSlot(id);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Inserts the meeting data in SharePoint.
        /// </summary>
        /// <param name="jsonResponse">The JSON response.</param>
        /// <param name="startDate">The start date.</param>
        /// <param name="endDate">The end date.</param>
        /// <param name="organizerDisplayName">Display name of the organizer.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <param name="doctorName">Name of the doctor.</param>
        public static string InsertMeetingDataInSharepoint(dynamic jsonResponse, DateTime startDate, DateTime endDate, string organizerDisplayName, string patientName, string doctorName, string questionCategory, string meetingId = null)
        {
            try
            {
                return SharePointRepository.InsertMeetingData(jsonResponse, startDate, endDate, organizerDisplayName, patientName, doctorName, meetingId, questionCategory);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Gets the meeting identifier from share point.
        /// </summary>
        /// <param name="joinUrl">The meeting URI.</param>
        /// <returns>returns meeting ID.</returns>
        public static string GetMeetingIdFromSharePoint(string joinUrl)
        {
            string itemId = string.Empty;
            try
            {
                itemId = SharePointRepository.GetItemId(joinUrl);
            }
            catch (Exception)
            {
                throw;
            }

            return itemId;
        }

        /// <summary>
        /// Gets the meeting details from share point.
        /// </summary>
        /// <param name="startDate">The start date.</param>
        /// <returns>calendar event object.</returns>
        public static List<CalendarEvent> GetMeetingDetailsFromSharePoint(DateTime startDate)
        {
            List<CalendarEvent> events = new List<CalendarEvent>();
            try
            {
                ListItemCollection itemCollection = SharePointRepository.GetOnlineMeetingDetails(startDate);
                if (itemCollection != null)
                {
                    foreach (ListItem item in itemCollection)
                    {
                        CalendarEvent event1 = new CalendarEvent();
                        int id = Convert.ToInt32(item["ID"]);
                        event1.Attendees = Convert.ToString(item["Attendees"]);
                        event1.Subject = ConfigValues.MeetingSubject;
                        event1.EventId = Convert.ToString(item["MeetingId"]);
                        event1.Organizer = Convert.ToString(item["Organizer"]);
                        event1.PatientName = Convert.ToString(item["PatientName"]);
                        event1.DoctorName = Convert.ToString(item["Title"]);
                        event1.MeetingUrl = ConfigValues.HealthCarePortal + "/HealthCare/ConferenceDemo?meetingId=" + id;
                        DateEvent dateEvent = new DateEvent();
                        dateEvent.DateTimeValue = Convert.ToDateTime(item["StartTime"]);
                        event1.StartDate = dateEvent;
                        DateEvent dateEvent1 = new DateEvent();
                        dateEvent1.DateTimeValue = Convert.ToDateTime(item["EndTime"]);
                        event1.EndDate = dateEvent1;
                        events.Add(event1);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }

            return events;
        }

        /// <summary>
        /// Inserts the attendees.
        /// </summary>
        /// <param name="itemId">The meeting identifier.</param>
        /// <param name="callRating">The call rating.</param>
        /// <param name="audioIssues">The audio issues.</param>
        /// <param name="audioIssueList">The audio issue list.</param>
        /// <param name="videoIssues">The video issues.</param>
        /// <param name="videoIssueList">The video issue list.</param>
        /// <param name="comments">The comments.</param>
        /// <param name="userName">Name of the user.</param>
        /// <param name="bandwidth">The bandwidth.</param>
        /// <param name="ping">The ping.</param>
        /// <param name="browser">The browser.</param>
        public static void InsertAttendees(string itemId, string callRating, string audioIssues, string audioIssueList, string videoIssues, string videoIssueList, string comments, string userName, string bandwidth, string ping, string browser)
        {
            SharePointRepository.InsertAttendees(itemId, callRating, audioIssues, audioIssueList, videoIssues, videoIssueList, comments, userName, bandwidth, ping, browser);
        }

        /// <summary>
        /// Updates the meeting end time.
        /// </summary>
        /// <param name="itemId">The meeting identifier.</param>
        /// <param name="meetingEndTime">The meeting end time.</param>
        public static void UpdateMeetingEndTime(string itemId, DateTime meetingEndTime)
        {
            try
            {
                SharePointRepository.UpdateMeetingEndTime(itemId, meetingEndTime);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Gets the questionnaire.
        /// </summary>
        /// <param name="category">The category.</param>
        /// <returns>questionnaire object.</returns>
        public static IList<Core.Models.Questionnaire> GetQuestionaire(string category)
        {
            try
            {
                return SharePointRepository.GetQuestionnaire(category);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Gets the question category.
        /// </summary>
        /// <returns></returns>
        public static List<string> GetQuestionCategory()
        {
            List<string> category = new List<string>();
            try
            {
                category = SharePointRepository.GetQuestionnaireCategory();
            }
            catch (Exception)
            {
                throw;
            }

            return category;
        }

        /// <summary>
        /// Saves the questionnaire.
        /// </summary>
        /// <param name="questions">The questions.</param>
        /// <param name="meetingId">The meeting identifier.</param>
        public static void SaveQuestionnaire(IList<Core.Models.Questionnaire> questions, string meetingId)
        {
            try
            {
                SharePointRepository.SaveQuestionnaire(questions, meetingId);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Gets the doctors by department.
        /// </summary>
        /// <param name="department">The department.</param>
        /// <returns>returns list of doctors.</returns>
        public static List<Core.Models.Peers> GetDoctorsByDepartment(string department)
        {
            try
            {
                return SharePointRepository.GetDoctorsByDepartment(department);
            }
            catch (Exception)
            {
                throw;
            }
        }

        /// <summary>
        /// Updates the patient status.
        /// </summary>
        /// <param name="itemId">The meeting identifier.</param>
        public static void UpdatePatientStatus(string itemId)
        {
            SharePointRepository.UpdatePatientStatus(itemId);
        }

        /// <summary>
        /// Updates the meeting URI.
        /// </summary>
        /// <param name="meetingUri">The meeting URI.</param>
        /// <param name="itemId">The meeting identifier.</param>
        public static void UpdateMeetingUri(string meetingUri, string meetingUrl, string itemId)
        {
            SharePointRepository.UpdateMeetingUri(meetingUri, meetingUrl, itemId);
        }

        /// <summary>
        /// Updates the meeting test device.
        /// </summary>
        /// <param name="itemId">The item identifier.</param>
        public static void UpdateMeetingTestDevice(string itemId)
        {
            SharePointRepository.UpdateMeetingTestDevice(itemId);
        }

        /// <summary>
        /// Creates the online meeting URI.
        /// </summary>
        /// <param name="participants">The participants.</param>
        /// <param name="startDate">The start date.</param>
        /// <param name="endDate">The end date.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <returns>Returns meeting uri</returns>
        public static async Task<dynamic> CreateOnlineMeetingUri(string participants, DateTime startDate, DateTime endDate, string patientName, string levelOfAccess = null)
        {
            string returnString;
            string accessLevel;
            try
            {
                string[] part = participants.Split(';');
                participants = string.Empty;
                foreach (string p in part)
                {
                    participants += "\"sip:" + p + "\",";
                }

                participants = participants.Substring(0, participants.Length - 1);
                string clientId = ConfigValues.NativeAppClientId;
                string authorityUri = "https://login.windows.net/common/oauth2/authorize";
                UserPasswordCredential pwdCred = new UserPasswordCredential(ConfigValues.NativeAppUserName, ConfigValues.NativeAppPassword);
                var poolReq = CreateRequest("https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root", "GET", null);
                var poolResp = GetResponse(poolReq);
                dynamic tmp = JsonConvert.DeserializeObject(poolResp);
                string resourcePool = tmp._links.user.href;
                string resourceUri1 = resourcePool.Substring(0, resourcePool.IndexOf(".com", StringComparison.InvariantCultureIgnoreCase) + 4);
                string accessToken = await GetAADToken(authorityUri, clientId, pwdCred, resourceUri1);
                var poolReq1 = CreateRequest(resourcePool, "GET", accessToken);
                var poolResp1 = GetResponse(poolReq1);
                dynamic tmp1 = JsonConvert.DeserializeObject(poolResp1);
                string resourcePool1 = tmp1._links.redirect.href;
                string resourceUri2 = resourcePool1.Substring(0, resourcePool1.IndexOf(".com", StringComparison.InvariantCultureIgnoreCase) + 4);
                accessToken = await GetAADToken(authorityUri, clientId, pwdCred, resourceUri2);
                var poolReq2 = CreateRequest(resourcePool1 + "/oauth/user", "GET", accessToken);
                var poolResp2 = GetResponse(poolReq2);
                dynamic tmp2 = JsonConvert.DeserializeObject(poolResp2);
                string resourcepool2 = tmp2._links.applications.href;
                string resourceUri3 = resourcepool2.Substring(0, resourcepool2.IndexOf(".com", StringComparison.InvariantCultureIgnoreCase) + 4);
                accessToken = await GetAADToken(authorityUri, clientId, pwdCred, resourceUri3);
                var poolReq3 = CreateRequest(resourcepool2, "POST", accessToken);
                var poolResp3 = GetResponse(poolReq3);
                dynamic dic = JsonConvert.DeserializeObject(poolResp3);
                string onlineMeetingUrl = resourceUri3 + dic._embedded.onlineMeetings._links.myOnlineMeetings.href;
                if (levelOfAccess == null)
                {
                    accessLevel = GetConfigurationValueByKey("AllowLobby") == "True" ? "Locked" : "Everyone";
                }
                else
                {
                    accessLevel = levelOfAccess;
                }

                string json = "{ " +
                                   "\"accessLevel\":\"" + accessLevel + "\"," +
                                  "\"description\":\"Online meeting\"," +
                                  "\"subject\":\"" + ConfigValues.MeetingSubject + "\"," +
                                  "\"attendees\":[" + participants + "] " +
                                  " }";
                var req = CreatePostRequest(onlineMeetingUrl, "POST", accessToken, json, "application/json");
                var res = GetResponse(req);
                dynamic jsonResponse = JsonConvert.DeserializeObject(res);
                return jsonResponse;
            }
            catch (Exception exp)
            {
                returnString = exp.Message;
            }

            return returnString;
        }

        /// <summary>
        /// Inserts the meeting into share point.
        /// </summary>
        /// <param name="jsonResponse">The json response.</param>
        /// <param name="startDate">The start date.</param>
        /// <param name="endDate">The end date.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <returns></returns>
        public static async Task<string> InsertMeetingIntoSharePoint(dynamic jsonResponse, DateTime startDate, DateTime endDate, string patientName, string questionCategory, string meetingId = null)
        {
            string organizer = jsonResponse.organizerUri;
            string doctorName = userDetails.GivenName + " " + userDetails.FamilyName;
            return Helper.InsertMeetingDataInSharepoint(jsonResponse, startDate, endDate, organizer, patientName, doctorName, questionCategory, meetingId);
        }

        /// <summary>
        /// Inserts the metting from web API.
        /// </summary>
        /// <param name="jsonResponse">The json response.</param>
        /// <param name="startDate">The start date.</param>
        /// <param name="endDate">The end date.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <returns></returns>
        public static string InsertMettingFromWebApi(dynamic jsonResponse, DateTime startDate, DateTime endDate, string patientName, string questionCategory, string meetingId = null)
        {
            return Helper.InsertMeetingDataInSharepoint(jsonResponse, startDate, endDate, string.Empty, patientName, string.Empty, questionCategory, meetingId);
        }

        /// <summary>
        /// Inserts the blank meeting details.
        /// </summary>
        /// <param name="startDateTime">The start date time.</param>
        /// <param name="endDateTime">The end date time.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <returns></returns>
        public static string InsertBlankMeetingDetails(DateTime startDateTime, DateTime endDateTime, string organizerEmail, string doctorName, string patientName, string patientEmail, string meetingId, string questionCategory = null)
        {
            return SharePointRepository.CreateMeetingDetails(startDateTime, endDateTime, organizerEmail, doctorName, patientName, patientEmail, meetingId, questionCategory);
        }

        /// <summary>
        /// Checks the meeting exists.
        /// </summary>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <returns></returns>
        public static string CheckMeetingExists(string meetingId)
        {
            return SharePointRepository.CheckMeetingExists(meetingId);
        }

        /// <summary>
        /// Gets the start date of meeting.
        /// </summary>
        /// <param name="itemId">The item identifier.</param>
        /// <returns></returns>
        public static DateTime GetStartDateOFMeeting(string itemId)
        {
            return SharePointRepository.GetStartDateOfMeeting(itemId);
        }

        /// <summary>
        /// Gets the questionnaire information.
        /// </summary>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <returns></returns>
        public static List<Core.Models.QuestionnaireDto> GetQuestionnaireInformation(string meetingId)
        {
            return SharePointRepository.GetQuestionaireResponses(meetingId);
        }

        /// <summary>
        /// Checks the user exists in group.
        /// </summary>
        /// <param name="userName">Name of the user.</param>
        /// <returns>Boolean value</returns>
        public static bool CheckUserExistsInGroup(string userName)
        {
            return SharePointRepository.CheckUserExistsInGroup(userName, ConfigValues.AdminGroup);
        }

        /// <summary>
        /// Gets the anon meeting.
        /// </summary>
        /// <param name="subject">The subject.</param>
        /// <param name="description">The description.</param>
        /// <param name="accessLevel">The access level is set to default "Invited" by default and you can pass any value,
        /// send string.empty if you want to sent access level to everyone
        /// UCAP does not allow access level Same Enterprise
        /// Also setting access level to Locked will lock meeting for everyone except organizer
        /// Hence only two values should be used, either Everyone or Invited </param>
        /// <returns>
        /// JSON string
        /// </returns>
        public static async Task<string> GetAnonMeeting(string subject, string description, string accessLevel="Invited")
        {
            string jsonResponseString;

            var doctorSipAddress = new List<string>();
            try
            {
                //Get the leaders
                List<Core.Models.Peers> doctors;
                {
                    doctors = Helper.GetDoctorsByDepartment("Peers");
                }

                doctorSipAddress.AddRange(doctors.Select(doctor => $"sip:{doctor.Email}"));

                var meeting = new MeetingInput
                {
                    AccessLevel = accessLevel,
                    Description = string.IsNullOrEmpty(description) ? "Virtual Health Meeting generated using UCAP" : description,
                    Subject = string.IsNullOrEmpty(subject) ? "Virtual Health Meeting generated using UCAP" : subject,
                    Leaders = doctorSipAddress.ToArray()
                };

                var jsonData = JsonConvert.SerializeObject(meeting);
                using (var wc = new WebClient())
                {
                    string trustedApiUri = $"{WebConfigurationManager.AppSettings["TrustedApi"]}/GetAdhocMeetingJob";
                    wc.Headers.Add(HttpRequestHeader.Accept, "application/json");
                    wc.Headers.Add(HttpRequestHeader.ContentType, "application/json");
                    wc.Headers.Add("user-agent", "Other");
                    jsonResponseString = await wc.UploadStringTaskAsync(new Uri(trustedApiUri), "POST", jsonData);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return JsonConvert.DeserializeObject(jsonResponseString).ToString();
        }

        /// <summary>
        /// Creates the request.
        /// </summary>
        /// <param name="uri">The URI.</param>
        /// <param name="method">The method.</param>
        /// <param name="accessToken">The access token.</param>
        /// <returns>returns http web request object.</returns>
        private static HttpWebRequest CreateRequest(string uri, string method, string accessToken)
        {
            HttpWebRequest request = WebRequest.Create(uri) as HttpWebRequest;
            request.KeepAlive = true;
            request.Method = method;

            request.ContentType = "application/json";
            if (!string.IsNullOrEmpty(accessToken))
            {
                request.Headers.Add("Authorization", string.Format("Bearer {0}", accessToken));
            }

            if (method == "POST")
            {
                string json = "{ \"UserAgent\":\"UCWA Sample\", \"endpointId\":\"f48d3afb-be8b-4810-80ec-fe0d5409fa75\", \"Culture\":\"en-US\",\"DomainName\":\"" + ConfigValues.DomainName + "\"}";
                request.ContentLength = json.Length;
                Stream stream = request.GetRequestStream();
                using (var streamWriter = new StreamWriter(stream))
                {
                    streamWriter.Write(json);
                    streamWriter.Flush();
                    ////streamWriter.Close();
                }
            }
            else
            {
                request.ContentLength = 0;
            }

            return request;
        }

        /// <summary>
        /// Gets the access token.
        /// </summary>
        /// <param name="authorityUri">The authority URI.</param>
        /// <param name="clientId">The client identifier.</param>
        /// <param name="pwdCred">The password cred.</param>
        /// <param name="resourceUri">The resource URI.</param>
        /// <returns>returns string.</returns>
        private static async Task<string> GetAADToken(string authorityUri, string clientId, UserPasswordCredential pwdCred, string resourceUri)
        {
            string token = null;
            try
            {
                AuthenticationContext authContext = new AuthenticationContext(authorityUri);
                var result = await authContext.AcquireTokenAsync(resourceUri, clientId, pwdCred);
                token = result.AccessToken;
                userDetails = result.UserInfo;
            }
            catch (Exception)
            {
                throw;
            }

            return token;
        }
    }
}