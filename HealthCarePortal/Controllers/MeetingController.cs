/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal.Controllers
{
    using System;
    using System.Globalization;
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using System.Web;
    using System.Web.Http;
    using HealthCare.Portal.HelperClasses;

    /// <summary>
    /// This class handles the request in encrypted URL, it decrypts and then appropriately 
    /// redirects the user to the conference page either on mobile device or on desktop client
    /// </summary>
    /// <seealso cref="System.Web.Http.ApiController" />
    public class MeetingController : ApiController
    {
        public async Task<IHttpActionResult> Get() //string customId, string displayName, string emrId, string startTime, string patient
        {
            string customId = string.Empty, displayName = string.Empty, emrId = string.Empty, startTime = string.Empty, patient = string.Empty, url = string.Empty, joinUrl = string.Empty, meetingId = string.Empty, userType = string.Empty, itemId = string.Empty;
            string questionCategory = null;
            DateTime dtStartTime = DateTime.Now;
            Uri uri = null;
            string query = Request.RequestUri.Query;
            bool isMobileDevice = HttpContext.Current.Request.Browser.IsMobileDevice;
            string userAgent = HttpContext.Current.Request.UserAgent;
            bool confirmMobileDevice = userAgent.ToUpper().Contains("ANDROID") || userAgent.ToUpper().Contains("IPHONE") ? true : false;
            string values = EncryptionHelper.Decrypt(query.Replace('?', ' ').Trim());
            string[] queryParameter = values.Split('&');
            foreach (string parameter in queryParameter)
            {
                string[] actualValue = parameter.Split('=');
                switch (actualValue[0].ToUpper())
                {
                    case "CUSTOMID":
                        customId = actualValue[1];
                        break;
                    case "DISPLAYNAME":
                        displayName = actualValue[1];
                        break;
                    case "EMRID":
                        emrId = actualValue[1];
                        break;
                    case "STARTTIME":
                        startTime = actualValue[1];
                        break;
                    case "PATIENT":
                        patient = actualValue[1];
                        break;
                    case "MEETINGID":
                        itemId = actualValue[1];
                        break;
                    case "USERTYPE":
                        userType = actualValue[1];
                        break;
                }
            }

            meetingId = customId + emrId;
            if (!string.IsNullOrEmpty(startTime))
            {
                dtStartTime = Convert.ToDateTime(startTime, CultureInfo.InvariantCulture);
            }
            if (string.IsNullOrEmpty(userType))
            {
                userType = Convert.ToBoolean(patient) ? "Patient" : "Doctor";
            }
            if (string.IsNullOrEmpty(itemId))
            {
                itemId = Helper.CheckMeetingExists(meetingId);
            }
            dynamic jsonResponse = null;
            if (string.IsNullOrEmpty(itemId))
            {
                if (isMobileDevice || confirmMobileDevice)
                {
                    string response = await Helper.GetAnonMeeting(string.Empty, string.Empty);
                    jsonResponse = Newtonsoft.Json.JsonConvert.DeserializeObject(response);
                    itemId = Helper.InsertMettingFromWebApi(jsonResponse, dtStartTime, dtStartTime.AddHours(1), displayName, questionCategory, meetingId);
                }
                else
                {
                    itemId = Helper.InsertBlankMeetingDetails(dtStartTime, dtStartTime.AddHours(1), string.Empty, string.Empty, displayName, string.Empty, meetingId);
                }
            }
            else
            {
                joinUrl = Helper.GetMeetingJoinUrl(itemId);
            }

            if (string.IsNullOrEmpty(displayName))
            {
                displayName = "Guest";
            }

            if (isMobileDevice)
            {
                if (jsonResponse != null)
                {
                    joinUrl = jsonResponse.JoinUrl;
                }

                url = ConfigValues.MobileSiteUri + "?uri=" + joinUrl + "&id=" + itemId + "&questReq=yes&displayName=" + displayName;
                uri = new Uri(url);
            }
            else
            {
                var encodedParameters = "meetingId=" + itemId + "&userType=" + userType + "&displayName=" + displayName;
                encodedParameters = EncryptionHelper.Encrypt(encodedParameters);
                var resp = new HttpResponseMessage(HttpStatusCode.OK);
                resp.Content = new StringContent(ConfigValues.HealthCarePortal + "/HealthCare/ConferenceDemo?" + encodedParameters, System.Text.Encoding.UTF8, "text/plain");
                url = ConfigValues.HealthCarePortal + "/HealthCare/ConferenceDemo?" + encodedParameters;
                uri = new Uri(url);
            }

            return Redirect(uri);
        }

        public async Task<dynamic> Get(string participants, string startDate, string endDate, string patientName)
        {
            dynamic jsonResponse = await
                Helper.CreateOnlineMeetingUri(participants, Convert.ToDateTime(startDate),
                    Convert.ToDateTime(endDate), patientName);

            return jsonResponse;
        }
    }
}