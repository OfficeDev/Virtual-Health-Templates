/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

using HealthCare.Core.Services;

namespace VHCBot
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Net;
    using Bot_Application;

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

            List<string> res = BotService.GetAvailableSlots(searchDate.ToString("yyyy-MM-dd"));
            foreach (string elem in res)
            {
                DateTime date = DateTime.Parse(elem);
                appointments.Add(new Appointment() { Date = date, PatientName = "Guest", Id = "01" });
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

            BotService.BookMeeting(appointment.EmailId, timeSlot, appointment.PatientName, "None", "Virtual Doctor");
        }
    }
}