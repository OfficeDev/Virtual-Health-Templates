/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace VHCBot
{
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.IO;
    using System.Net;
    using Bot_Application;
    using Newtonsoft.Json;
    using System.Web.Configuration;
    /// <summary>
    /// Portal Helper Class. It helps in interaction with Health Care Portal
    /// </summary>
    public static class PortalHelper
    {
        /// <summary>
        /// Gets the available appointments
        /// </summary>
        /// <param name="searchDate">Search date for appointment</param>
        /// <returns>Returns the list of available appointments</returns>
        public static List<Appointment> GetAvailableAppointments(DateTime searchDate)
        {
            var appointments = new List<Appointment>();
            var uri = ConfigurationManager.AppSettings["ida:HealthCarePortal"] + "/HealthCare/AvailableSlots?dateString=" + searchDate.ToString("yyyy-MM-dd");

            var request = CreateRequest(uri, "Get");
            var res = GetResponse(request);
            dynamic responseJSON = JsonConvert.DeserializeObject(res);
            var dates = ((Newtonsoft.Json.Linq.JObject)responseJSON).Children();
            foreach (var singDt in dates)
            {
                var dateValue = ((Newtonsoft.Json.Linq.JProperty)singDt).Name;
                var dt = Convert.ToDateTime(dateValue);
                var id = ((Newtonsoft.Json.Linq.JProperty)singDt).Value.ToString().Split('_')[0];
                if (dt.Date == searchDate.Date)
                {
                    appointments.Add(new Appointment() { Date = dt, PatientName = "Guest", Id = id });
                }
            }

            return appointments;
        }

        /// <summary>
        /// Gets new available appointment
        /// </summary>
        /// <param name="searchDate">Search Date</param>
        /// <returns>Returns appointment object</returns>
        public static Appointment GetNextAvailableAppointment(DateTime searchDate)
        {
            // counter to prevent infinite recursion loops
            var counter = 0;
            var maxCounter = 3;
            var appointments = GetAvailableAppointments(searchDate);
            while (appointments.Count == 0 && counter < maxCounter)
            {
                counter++;
                appointments = GetAvailableAppointments(searchDate.AddDays(1));
            }

            return appointments.Count > 0 ? appointments[0] : null;
        }

        /// <summary>
        /// Books skype meeting
        /// </summary>
        /// <param name="appointment">Appointment object</param>
        public static void BookApointment(Appointment appointment)
        {
            // "chk_10_2016_10_24_03:00 ;" Sample date format expected in healthportal Api;
            var timeSlot = "chk_" + appointment.Id + "_" + appointment.Date.ToString("yyyy_MM_dd_HH:mm ;");
            var uri = ConfigurationManager.AppSettings["ida:HealthCarePortal"] + "/HealthCare/MeetingInvitationWithoutUriDuplicate?participantEmail=" + appointment.EmailId + "&slots=" + timeSlot + "&patientName=" + appointment.PatientName + "&questionCategory=None&doctorName=Virtual Doctor";

            var request = CreateRequest(uri, "Get");
            var res = GetResponse(request);
        }

        /// <summary>
        /// Creates an Http request.
        /// </summary>
        /// <param name="uri">Web location of request</param>
        /// <param name="method">POST or GET</param>
        /// <returns>returns the HttpWebRequest object</returns>
        private static HttpWebRequest CreateRequest(string uri, string method)
        {
            HttpWebRequest request = System.Net.WebRequest.Create(uri) as System.Net.HttpWebRequest;
            request.KeepAlive = true;
            request.Method = method;
            request.ContentType = "application/json";
            if (method == "POST")
            {
                string json = "{ \"UserAgent\":\"UCWA Sample\", \"endpointId\":\"f48d3afb-be8b-4810-80ec-fe0d5409fa75\", \"Culture\":\"en-US\",\"DomainName\":\"instpod.onmicrosoft.com\" }";
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
        /// Gets the response of HttpWebRequest object
        /// </summary>
        /// <param name="request">The HttpWebRequest object</param>
        /// <returns>returns string value of response</returns>
        private static string GetResponse(HttpWebRequest request)
        {
            string response = string.Empty;

            using (HttpWebResponse httpResponse = request.GetResponse() as System.Net.HttpWebResponse)
            {
                // Get StreamReader that holds the response stream
                using (StreamReader reader = new System.IO.StreamReader(httpResponse.GetResponseStream()))
                {
                    response = reader.ReadToEnd();
                }
            }

            return response;
        }
    }
}