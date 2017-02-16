/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Core.Data
{
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.Diagnostics;
    using System.Globalization;
    using System.Linq;
    using System.Security;
    using Common;
    using Microsoft.SharePoint.Client;
    using Models;
    using Newtonsoft.Json;

    /// <summary>
    /// Repository class to interact with SharePoint Online site.
    /// </summary>
    public static class SharePointRepository
    {
        /// <summary>
        /// The context
        /// </summary>
        // ReSharper disable once InconsistentNaming
        private static ClientContext context;

        /// <summary>
        /// Gets or sets the context.
        /// </summary>
        /// <value>
        /// The context.
        /// </value>
        public static ClientContext Context
        {
            get
            {
                if (context != null) return context;
                var secureString = new SecureString();

                context = new ClientContext(new Uri(ConfigurationManager.AppSettings["SharepointSite"]));
                var userName = ConfigurationManager.AppSettings["SPOUserName"];
                var pwd = CertificateHelper.SpoPassword;
                Array.ForEach(pwd.ToCharArray(), secureString.AppendChar);

                context.Credentials = new SharePointOnlineCredentials(userName, secureString);
                return context;
            }

            set
            {
                context = value;
            }
        }

        /// <summary>
        /// Gets the available slots.
        /// </summary>
        /// <param name="dateReceived">The date received.</param>
        /// <returns>Available slots</returns>
        public static string GetAvailableSlots(DateTime dateReceived)
        {
            var list = Context.Web.Lists.GetByTitle("Available Dates");
            var camlQuery = new CamlQuery { DatesInUtc = false };
            camlQuery.ViewXml = "<View><Query><Where><And><Eq><FieldRef Name = 'AvailableDate' />"+
                "<Value IncludeTimeValue = 'FALSE' Type = 'DateTime'>"+ dateReceived.ToString("yyyy-MM-dd") + "</Value ></Eq>" +
                "<Eq><FieldRef Name = 'Available' /><Value Type = 'Text' >Y</Value></Eq></And></Where></Query></View>";
            var collListItem = list.GetItems(camlQuery);
            Context.Load(collListItem);
            Context.ExecuteQuery();
            var dic = new Dictionary<string, string>();
            foreach (var item in collListItem)
            {
                var id = Convert.ToInt32(item["ID"]);
                var date = Convert.ToDateTime(item["AvailableTime"]);
                var hourMin = Convert.ToString(date.ToString("hh:mm tt"));
                if (dic.ContainsKey(date.ToString(CultureInfo.InvariantCulture)))
                {
                    dic[date.ToString(CultureInfo.InvariantCulture)] += id + "_" + hourMin + ",";
                }
                else
                {
                    dic.Add(date.ToString(CultureInfo.InvariantCulture), id + "_" + hourMin + ",");
                }
            }

            return JsonConvert.SerializeObject(dic, Formatting.None);
        }

        /// <summary>
        /// Gets the meeting identifier.
        /// </summary>
        /// <param name="joinUrl">The meeting URI.</param>
        /// <returns>Meeting id</returns>
        public static string GetItemId(string joinUrl)
        {
            var itemId = string.Empty;
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var camlQuery = new CamlQuery
            {
                ViewXml = "<View><Query><Where><Eq><FieldRef Name='JoinURL'/>" +
                          "<Value Type='Text'>" + joinUrl + "</Value></Eq></Where></Query></View>"
            };
            var itemColl = list.GetItems(camlQuery);
            Context.Load(itemColl);
            Context.ExecuteQuery();
            if (itemColl.Count == 1)
            {
                var item = itemColl.First();
                itemId = item["ID"].ToString();
            }

            return itemId;
        }

        /// <summary>
        /// Gets the meeting available date time.
        /// </summary>
        /// <param name="itemId">The meeting identifier.</param>
        /// <returns>Available time</returns>
        public static DateTime GetMeetingAvailableDateTime(int itemId)
        {
            var dateTime = DateTime.MinValue;
            var list = Context.Web.Lists.GetByTitle("Available Dates");
            var camlQuery = new CamlQuery
            {
                DatesInUtc = false,
                ViewXml = "<View><Query><Where><Eq><FieldRef Name='ID'/>" +
                          "<Value Type='Counter'>" + itemId + "</Value></Eq></Where></Query></View>"
            };
            var itemColl = list.GetItems(camlQuery);
            Context.Load(itemColl);
            Context.ExecuteQuery();
            if (itemColl.Count == 1)
            {
                var item = itemColl.First();
                dateTime = Convert.ToDateTime(item["AvailableTime"]);
            }

            return dateTime;
        }

        /// <summary>
        /// Updates the available slot.
        /// </summary>
        /// <param name="id">The identifier.</param>
        public static void UpdateAvailableSlot(int id)
        {
            var list = Context.Web.Lists.GetByTitle("Available Dates");
            var listItem = list.GetItemById(id);
            Context.Load(listItem);
            Context.ExecuteQuery();
            listItem["Available"] = "N";
            listItem.Update();
            Context.ExecuteQuery();
        }

        /// <summary>
        /// Determines whether [is user exist in group] [the specified log on name].
        /// </summary>
        /// <param name="logOnName">Name of the log on.</param>
        /// <param name="sharePointGroup">The share point group.</param>
        /// <returns>true or false</returns>
        public static bool IsUserExistInGroup(string logOnName, string sharePointGroup)
        {
            if (null == context || string.IsNullOrEmpty(logOnName) || string.IsNullOrEmpty(sharePointGroup))
            {
                return false;
            }

            var hostWeb = context.Web;

            var userGroup = hostWeb.SiteGroups.GetByName(sharePointGroup);
            context.Load(hostWeb);
            context.Load(userGroup, group => group.Users.Include(user => user.Email, user => user.LoginName, user => user.Title));
            try
            {
                context.ExecuteQuery();
            }
            catch (Exception)
            {
                Trace.TraceWarning("User {0} is not member of this group" + logOnName);
                return false;
            }

            return Enumerable.Any(userGroup.Users, user => string.Compare(user.Email.ToString(CultureInfo.InvariantCulture), logOnName, StringComparison.CurrentCultureIgnoreCase) == 0 || string.Compare(user.LoginName.ToString(CultureInfo.InvariantCulture), logOnName, StringComparison.CurrentCultureIgnoreCase) == 0);
        }

        /// <summary>
        /// Inserts the meeting data.
        /// </summary>
        /// <param name="jsonResponse">The java script notation response.</param>
        /// <param name="startMeeting">The start meeting.</param>
        /// <param name="endDate">The end date.</param>
        /// <param name="organizerDisplayName">Display name of the organizer.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <param name="doctorName">Name of the doctor.</param>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <param name="questionCategory">The question category.</param>
        /// <returns>Meeting data</returns>
        public static string InsertMeetingData(dynamic jsonResponse, DateTime startMeeting, DateTime endDate, string organizerDisplayName, string patientName, string doctorName, string meetingId, string questionCategory = null)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var itemCreateInfo = new ListItemCreationInformation();
            var listItem = list.AddItem(itemCreateInfo);
            string meetingUri = jsonResponse.OnlineMeetingUri;
            string organizer = jsonResponse.OrganizerUri;
            string joinUrl = jsonResponse.JoinUrl;
            listItem["Title"] = "Dr. " + doctorName;
            listItem["MeetingId"] = meetingId;
            listItem["OnlineMeetingURI"] = meetingUri;
            listItem["Organizer"] = organizer;
            listItem["JoinURL"] = joinUrl;
            listItem["MeetingDetails"] = JsonConvert.SerializeObject(jsonResponse);
            listItem["StartTime"] = startMeeting;
            listItem["EndTime"] = endDate;
            listItem["PatientName"] = patientName;
            listItem["Status"] = "Scheduled";
            if (string.IsNullOrEmpty(questionCategory) || questionCategory == "None")
            {
                listItem["QuestionnaireRequired"] = false;
            }
            else
            {
                listItem["QuestionnaireRequired"] = true;
                listItem["QuestionCategory"] = questionCategory;
            }

            listItem.Update();
            Context.ExecuteQuery();
            var listTelemetry = Context.Web.Lists.GetByTitle("Meeting Details");
            itemCreateInfo = new ListItemCreationInformation();
            var listItemTelemetry = listTelemetry.AddItem(itemCreateInfo);
            listItemTelemetry["Title"] = listItem.Id.ToString();
            listItemTelemetry["MeetingId"] = meetingId;
            listItemTelemetry["StartTime"] = startMeeting;
            listItemTelemetry["EndTime"] = endDate;
            listItemTelemetry["Organizer"] = organizerDisplayName;
            listItemTelemetry["Status"] = "Scheduled";
            listItemTelemetry.Update();
            Context.ExecuteQuery();
            return listItem.Id.ToString();
        }

        /// <summary>
        /// Creates the meeting details.
        /// </summary>
        /// <param name="startMeeting">The start meeting.</param>
        /// <param name="endDate">The end date.</param>
        /// <param name="organizerDisplayName">Display name of the organizer.</param>
        /// <param name="patientName">Name of the patient.</param>
        /// <param name="doctorName">Name of the doctor.</param>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <param name="questionCategory">The question category.</param>
        /// <returns>meeting details</returns>
        public static string CreateMeetingDetails(DateTime startMeeting, DateTime endDate, string organizerEmail, string doctorName, string patientName, string patientEmail, string meetingId, string questionCategory = null)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var itemCreateInfo = new ListItemCreationInformation();
            var listItem = list.AddItem(itemCreateInfo);
            listItem["Title"] = "Dr. " + doctorName;
            listItem["MeetingId"] = meetingId;
            listItem["Organizer"] = organizerEmail;
            listItem["Attendees"] = patientEmail;
            listItem["StartTime"] = startMeeting;
            listItem["EndTime"] = endDate;
            listItem["PatientName"] = patientName;
            listItem["Status"] = "Scheduled";
            if (questionCategory == "None" || string.IsNullOrEmpty(questionCategory))
            {
                listItem["QuestionnaireRequired"] = false;
            }
            else
            {
                listItem["QuestionnaireRequired"] = true;
                listItem["QuestionCategory"] = questionCategory;
            }

            listItem.Update();
            Context.ExecuteQuery();
            return listItem.Id.ToString();
        }

        /// <summary>
        /// Updates the meeting end time.
        /// </summary>
        /// <param name="itemId">The meeting identifier.</param>
        /// <param name="meetingEndTime">The meeting end time.</param>
        public static void UpdateMeetingEndTime(string itemId, DateTime meetingEndTime)
        {
            var listTelemetry = Context.Web.Lists.GetByTitle("Meeting Details");
            var camlQuery = new CamlQuery
            {
                ViewXml = "<View><Query><Where><Eq><FieldRef Name='Title'/>" +
                          "<Value Type='Text' >" + itemId +
                          "</Value></Eq></Where></Query><RowLimit>10</RowLimit></View>"
            };
            var collListItem = listTelemetry.GetItems(camlQuery);
            Context.Load(collListItem);
            Context.ExecuteQuery();
            if (collListItem.Any())
            {
                var listItemTelemetry = collListItem[0];
                listItemTelemetry["EndTime"] = meetingEndTime.ToUniversalTime();
                listItemTelemetry["Status"] = "Closed";
                listItemTelemetry.Update();
                Context.ExecuteQuery();
            }
        }

        /// <summary>
        /// Gets the meeting URI details.
        /// </summary>
        /// <param name="itemId">The meeting identifier.</param>
        /// <returns>List item.</returns>
        public static ListItem GetMeetingUriDetails(string itemId)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var item = list.GetItemById(Convert.ToInt32(itemId));
            Context.Load(item);
            Context.ExecuteQuery();
            return item;
        }

        /// <summary>
        /// Determines whether [is configuration key exists] [the specified key].
        /// </summary>
        /// <param name="key">The key.</param>
        /// <returns>Boolean value.</returns>
        public static bool IsConfigKeyExists(string key)
        {
            var list = Context.Web.Lists.GetByTitle("Configuration");
            var camlQuery = new CamlQuery
            {
                ViewXml = "<View><Query><Where><Eq><FieldRef Name='ConfigKey'/>" +
                          "<Value Type='Text'>" + key + "</Value></Eq></Where></Query></View>"
            };
            var itemColl = list.GetItems(camlQuery);
            Context.Load(itemColl);
            Context.ExecuteQuery();
            return itemColl.Count > 0;
        }

        /// <summary>
        /// Gets the configuration details.
        /// </summary>
        /// <returns>Configuration details.</returns>
        public static IEnumerable<ConfigurationDetails> GetConfigurationDetails()
        {
            var list = Context.Web.Lists.GetByTitle("Configuration");
            var camlQuery = CamlQuery.CreateAllItemsQuery();
            var itemColl = list.GetItems(camlQuery);
            Context.Load(itemColl);
            Context.ExecuteQuery();
            var result = itemColl.Select(e => new ConfigurationDetails() { Key = e["ConfigKey"].ToString(), Value = e["ConfigValue"].ToString() });
            return result;
        }

        /// <summary>
        /// Gets the configuration value by key.
        /// </summary>
        /// <param name="key">The key.</param>
        /// <returns>String value.</returns>
        public static string GetConfigValueByKey(string key)
        {
            var list = Context.Web.Lists.GetByTitle("Configuration");
            var camlQuery = new CamlQuery
            {
                ViewXml = "<View><Query><Where><Eq><FieldRef Name='ConfigKey'/>" +
                          "<Value Type='Text'>" + key + "</Value></Eq></Where></Query></View>"
            };
            var itemColl = list.GetItems(camlQuery);
            Context.Load(itemColl);
            Context.ExecuteQuery();
            return itemColl.Count > 0 ? itemColl[0]["ConfigValue"].ToString() : string.Empty;
        }

        /// <summary>
        /// Inserts the configuration details.
        /// </summary>
        /// <param name="key">The key.</param>
        /// <param name="value">The value.</param>
        public static void InsertConfigurationDetails(string key, string value)
        {
            var list = Context.Web.Lists.GetByTitle("Configuration");
            var camlQuery = new CamlQuery
            {
                ViewXml = "<View><Query><Where><Eq><FieldRef Name='ConfigKey'/>" +
                          "<Value Type='Text'>" + key + "</Value></Eq></Where></Query></View>"
            };
            var itemColl = list.GetItems(camlQuery);
            Context.Load(itemColl);
            Context.ExecuteQuery();
            if (itemColl.Count > 0)
            {
                var listItem = itemColl.First();
                Context.Load(listItem);
                Context.ExecuteQuery();
                listItem["Title"] = key;
                listItem["ConfigValue"] = value;
                listItem.Update();
                Context.ExecuteQuery();
            }
            else
            {
                var itemCreateInfo = new ListItemCreationInformation();
                var listItem = list.AddItem(itemCreateInfo);
                listItem["Title"] = key;
                listItem["ConfigKey"] = key;
                listItem["ConfigValue"] = value;
                listItem.Update();
                Context.ExecuteQuery();
            }
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
            var list = Context.Web.Lists.GetByTitle("Attendees");
            var itemCreateInfo = new ListItemCreationInformation();
            var listItem = list.AddItem(itemCreateInfo);
            listItem["Title"] = GetActualMeetingId(itemId);
            listItem["OnlineMeetingId"] = new FieldLookupValue() { LookupId = Convert.ToInt32(itemId) };
            listItem["SurveyerName"] = userName;
            listItem["AudioIssues"] = audioIssues;
            if (!string.IsNullOrEmpty(audioIssueList))
            {
                listItem["AudioIssue"] = audioIssueList.Split(',');
            }

            listItem["SurveyerComments"] = comments;
            listItem["VideoIssues"] = videoIssues;
            if (videoIssueList != string.Empty)
            {
                listItem["VideoIssue"] = videoIssueList.Split(',');
            }

            listItem["CallRating"] = Convert.ToInt32(callRating);
            listItem["Bandwidth"] = (int)float.Parse(bandwidth);
            listItem["Latency"] = (int)float.Parse(ping);
            listItem["BrowserType"] = browser;

            listItem.Update();
            Context.ExecuteQuery();
        }

        /// <summary>
        /// Gets the online meeting details.
        /// </summary>
        /// <param name="startDate">The start date.</param>
        /// <returns>List item collection</returns>
        public static ListItemCollection GetOnlineMeetingDetails(DateTime startDate)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var camlQuery = new CamlQuery
            {
                DatesInUtc = false,
                ViewXml = "<View><Query><Where><Geq><FieldRef Name='StartTime'/>" +
                          "<Value Type='DateTime' IncludeTimeValue='False'>" + startDate.ToString("yyyy-MM-dd") +
                          "</Value></Geq></Where></Query><RowLimit>100</RowLimit></View>"
            };
            var collListItem = list.GetItems(camlQuery);
            Context.Load(collListItem);
            Context.ExecuteQuery();

            return collListItem;
        }

        /// <summary>
        /// Gets the patient status.
        /// </summary>
        /// <param name="startDate">The start date.</param>
        /// <returns>List item collection.</returns>
        public static ListItemCollection GetPatientStatus(DateTime startDate)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var camlQuery = new CamlQuery
            {
                DatesInUtc = true,
                ViewXml = "<View><Query><Where><And><And><Eq><FieldRef Name='StartTime'/>" +
                          "<Value Type='DateTime' IncludeTimeValue='False'>" + startDate.ToString("yyyy-MM-dd") +
                          "</Value></Eq><Geq>" +
                          "<FieldRef Name='EndTime'/><Value Type='DateTime' IncludeTimeValue='True'>" +
                          startDate.ToString("yyyy-MM-ddTHH:mm:ssZ") + "</Value></Geq></And><Eq>" +
                          "<FieldRef Name='HasPatientJoined'/><Value Type='Integer'>1</Value></Eq></And></Where></Query><RowLimit>100</RowLimit></View>"
            };
            var collListItem = list.GetItems(camlQuery);
            Context.Load(collListItem);
            Context.ExecuteQuery();

            return collListItem;
        }

        /// <summary>
        /// Gets the questionnaire.
        /// </summary>
        /// <param name="category">The category.</param>
        /// <returns>Question values</returns>
        public static IList<Questionnaire> GetQuestionnaire(string category)
        {
            var list = Context.Web.Lists.GetByTitle("Questionnaires");
            var camlQuery = new CamlQuery
            {
                ViewXml = "<View><Query><Where><Eq><FieldRef Name='QuestionCategory'/>" +
                          "<Value Type='Choice'>" + category + "</Value></Eq></Where></Query></View>"
            };
            var collListItem = list.GetItems(camlQuery);
            Context.Load(collListItem);
            Context.ExecuteQuery();
            var questions = (from item in collListItem let choices = item["Options"].ToString().Split(';') select new Questionnaire { QuestionnaireId = item.Id, Question = item["Question"].ToString(), AllowMultipleChoice = false, Options = choices, SelectedOptions = string.Empty }).ToList();

            Context.ExecuteQuery();
            return questions;
        }

        /// <summary>
        /// Saves the questionnaire.
        /// </summary>
        /// <param name="questions">The questions.</param>
        /// <param name="meetingId">The meeting identifier.</param>
        public static void SaveQuestionnaire(IList<Questionnaire> questions, string meetingId)
        {
            var list = Context.Web.Lists.GetByTitle("QuestionnairResponses");
            foreach (var qu in questions)
            {
                var itemCreateInfo = new ListItemCreationInformation();
                var listItem = list.AddItem(itemCreateInfo);
                listItem["Title"] = qu.Question;
                listItem["MeetingIdLookUp"] = new FieldLookupValue() { LookupId = Convert.ToInt32(qu.MeetingId) };
                listItem["QuestionId"] = new FieldLookupValue() { LookupId = qu.QuestionnaireId };
                listItem["Response"] = qu.SelectedOptions;
                listItem.Update();
            }

            Context.ExecuteQuery();
            UpdateQuestionCategoryOnlineMeeting(meetingId);
        }

        /// <summary>
        /// Gets the questionnaire category.
        /// </summary>
        /// <returns>Question category</returns>
        public static List<string> GetQuestionnaireCategory()
        {
            var category = new List<string> { "None" };
            var web = Context.Web;
            Context.Load(web, w => w.AvailableFields);
            Context.ExecuteQuery();
            var collFields = web.AvailableFields;
            FieldChoice choice = Enumerable.FirstOrDefault(from field in collFields where field.InternalName == "QuestionCategory" select Context.CastTo<FieldChoice>(field));

            if (choice != null)
            {
                category.AddRange(choice.Choices);
            }

            return category;
        }

        /// <summary>
        /// Gets the doctors by department.
        /// </summary>
        /// <param name="department">The department.</param>
        /// <returns>List of peers</returns>
        public static List<Peers> GetDoctorsByDepartment(string department)
        {
            var peers = new List<Peers>();
            var web = Context.Web;
            var list = web.Lists.GetByTitle("Peers");
            var query = new CamlQuery();
            var result = list.GetItems(query);
            Context.Load(result);
            Context.ExecuteQuery();
            if (result != null)
            {
                foreach (var item in result)
                {
                    var p = new Peers();
                    var email = Convert.ToString(item["PeerEmailAddress"]);

                    p.Id = email.Substring(0, email.IndexOf('@'));
                    p.Title = Convert.ToString(item["Title"]);
                    p.Department = Convert.ToString(item["HospitalDepartment"]);
                    p.Designation = Convert.ToString(item["Designation"]);
                    p.Email = Convert.ToString(item["PeerEmailAddress"]);
                    peers.Add(p);
                }
            }

            return peers;
        }

        /// <summary>
        /// Updates the patient status.
        /// </summary>
        /// <param name="itemId">The meeting identifier.</param>
        public static void UpdatePatientStatus(string itemId)
        {
            var web = Context.Web;
            var list = web.Lists.GetByTitle("Online Meeting Details");
            var item = list.GetItemById(Convert.ToInt32(itemId));
            Context.Load(item);
            Context.ExecuteQuery();
            if (item != null)
            {
                item["HasPatientJoined"] = true;
                item.Update();
                Context.ExecuteQuery();
            }
        }

        /// <summary>
        /// Updates the meeting URI.
        /// </summary>
        /// <param name="meetingUri">The meeting URI.</param>
        /// <param name="meetingUrl">URL of the Meeting</param>
        /// <param name="itemId">The meeting identifier.</param>
        public static void UpdateMeetingUri(string meetingUri, string meetingUrl, string itemId)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var listItem = list.GetItemById(Convert.ToInt32(itemId));
            Context.Load(listItem);
            Context.ExecuteQuery();
            if(string.IsNullOrEmpty(Convert.ToString(listItem["MeetingId"])) || string.IsNullOrWhiteSpace(Convert.ToString(listItem["MeetingId"])))
            {
                listItem["MeetingId"] = meetingUri.Split(new string[] { "focus:id:" }, StringSplitOptions.None)[1];
            }
            listItem["OnlineMeetingURI"] = meetingUri;
            listItem["JoinURL"] = meetingUrl;
            listItem.Update();
            Context.ExecuteQuery();
        }

        /// <summary>
        /// Updates the Test Device status of meeting to true
        /// </summary>        
        /// <param name="itemId">The meeting identifier.</param>
        public static void UpdateMeetingTestDevice(string itemId)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var listItem = list.GetItemById(Convert.ToInt32(itemId));
            Context.Load(listItem);
            Context.ExecuteQuery();
            listItem["IsDevicesTestDone"] = true;
            listItem.Update();
            Context.ExecuteQuery();
        }

        /// <summary>
        /// Checks the meeting exists.
        /// </summary>
        /// <param name="meetingId">The meeting identifier.</param>
        /// <returns>Checks if meeting exists</returns>
        public static string CheckMeetingExists(string meetingId)
        {
            string itemId = null;
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var xmlQuery = "<View><Query><Where><Eq><FieldRef Name = 'MeetingId'/><Value Type ='Text'>" + meetingId.ToUpper().Trim() + "</Value></Eq></Where></Query></View>";
            var query = new CamlQuery() { ViewXml = xmlQuery };
            var result = list.GetItems(query);
            Context.Load(result);
            Context.ExecuteQuery();
            if (result.Count > 0)
            {
                var item = result.First();
                itemId = item["ID"].ToString();
            }

            return itemId;
        }

        /// <summary>
        /// Gets the start date of meeting.
        /// </summary>
        /// <param name="itemId">The item identifier.</param>
        /// <returns>Gets the start date of meeting</returns>
        public static DateTime GetStartDateOfMeeting(string itemId)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var listItem = list.GetItemById(Convert.ToInt32(itemId));
            Context.Load(listItem);
            Context.ExecuteQuery();
            return Convert.ToDateTime(listItem["StartTime"].ToString());
        }

        /// <summary>
        /// Gets the question responses.
        /// </summary>
        /// <param name="meetingId">The meeting ID</param>
        /// <returns>list of questions</returns>
        public static List<QuestionnaireDto> GetQuestionaireResponses(string meetingId)
        {
            var list = Context.Web.Lists.GetByTitle("QuestionnairResponses");
            var camlQuery = new CamlQuery
            {
                ViewXml = "<View><Query><Where><Eq><FieldRef Name='MeetingIdLookUp'/>" +
                          "<Value Type='Lookup'>" + meetingId + "</Value></Eq></Where></Query></View>"
            };
            var collListItem = list.GetItems(camlQuery);
            Context.Load(collListItem);
            Context.ExecuteQuery();

            return collListItem.Select(item => new QuestionnaireDto
            {
                Question = Convert.ToString(item["Title"]),
                Response = Convert.ToString(item["Response"])
            }).ToList();
        }

        /// <summary>
        /// Checks the user exists in group.
        /// </summary>
        /// <param name="userName">Name of the user.</param>
        /// <param name="groupName">Name of the group.</param>
        /// <returns>User exists or not</returns>
        public static bool CheckUserExistsInGroup(string userName, string groupName)
        {
            Web web = Context.Web;
            Group group = web.SiteGroups.GetByName(groupName);
            Context.Load(web, w => w.Title);
            Context.Load(group, grp => grp.Title, grp => grp.Users, grp => grp.Owner);
            Context.ExecuteQuery();
            foreach (User usr in group.Users)
            {
                if(usr.LoginName.ToUpper().Equals(userName.ToUpper()))
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Gets the actual meeting identifier.
        /// </summary>
        /// <param name="itemId">The list item meeting identifier.</param>
        /// <returns>String value.</returns>
        private static string GetActualMeetingId(string itemId)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var listItem = list.GetItemById(Convert.ToInt32(itemId));
            Context.Load(listItem);
            Context.ExecuteQuery();
            var actualMeetingId = listItem["MeetingId"]?.ToString() ?? itemId;

            return actualMeetingId;
        }

        /// <summary>
        /// Updates the question category online meeting.
        /// </summary>
        /// <param name="itemId">The item identifier.</param>
        private static void UpdateQuestionCategoryOnlineMeeting(string itemId)
        {
            var list = Context.Web.Lists.GetByTitle("Online Meeting Details");
            var listItem = list.GetItemById(itemId);
            Context.Load(listItem);
            Context.ExecuteQuery();
            listItem["QuestionnaireRequired"] = false;
            listItem.Update();
            Context.ExecuteQuery();
        }
    }
}
