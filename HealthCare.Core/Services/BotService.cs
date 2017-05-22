/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Core.Services
{
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using HealthCare.Core.Common;
    using HealthCare.Core.Data;
    using HealthCare.Core.Helper;

    public static class BotService
    {
        private static DateTime GetDateTime(string slots)
        {
            var dateStart = DateTime.MinValue;
            try
            {
                var arr = slots.Split(';');
                if (arr != null && arr.Length > 0)
                {
                    foreach (var str in arr)
                    {
                        if (!string.IsNullOrEmpty(str))
                        {
                            var arr1 = str.Split('_');
                            if (arr1 != null && arr1.Length > 0)
                            {
                                var id = arr1[1];
                                var year = Convert.ToInt32(arr1[2]);
                                var month = Convert.ToInt32(arr1[3]);
                                var day = Convert.ToInt32(arr1[4]);
                                var time = arr1[5].Split(':');
                                dateStart = new DateTime(year, month, day, Convert.ToInt32(time[0]),
                                    Convert.ToInt32(time[1]), 0, 0);
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

        public static void BookMeeting(string participantEmail, string slots, string patientName,
            string questionCategory, string doctorName)
        {
            var dateStartDate = GetDateTime(slots);
            var itemId = SharePointRepository.CreateMeetingDetails(dateStartDate, dateStartDate.AddHours(1),
               string.Empty, doctorName, patientName, participantEmail, string.Empty,
               questionCategory);
            var portalUrl = "";
            var queryStringParameter = "";
            if (ConfigurationManager.AppSettings["IsAngularApp"] == "true")
            {
                portalUrl = new Uri(ConfigurationManager.AppSettings["ida:HealthCarePortal"]).AbsoluteUri + "healthcare/guest?uri=";
                queryStringParameter = $"meetingId={itemId}&userType=Patient&displayName={patientName}";
            }
            else
            {
                portalUrl = new Uri(ConfigurationManager.AppSettings["ida:HealthCarePortal"]).AbsoluteUri +
                            "api/meeting?";
                queryStringParameter = "meetingId=" + itemId + "&userType=Patient&displayName=" + patientName;
            }

            string error;
            var encrptedParameters = EncryptionHelper.Encrypt(queryStringParameter);
            var meetingUrl = portalUrl + encrptedParameters;
            var invitation = MeetingInvitation.SendEmail(meetingUrl, participantEmail,
                out error);
        }

        public static List<string> GetAvailableSlots(string dateString)
        {
            string[] completeListOfSlots = { "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM" };
            List<string> returnedList = new List<string>();
            returnedList.AddRange(completeListOfSlots);
            return returnedList;
        }
    }
}