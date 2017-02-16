/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace Bot_Application
{
    using System;
    using Microsoft.Bot.Builder.FormFlow;

    /// <summary>
    /// Appointments Query Class
    /// </summary>
    [Serializable]
    public class AppointmentsQuery
    {       
        /// <summary>
        /// Gets or sets Appointment query date
        /// </summary>
        [Prompt("When do you want to book appointment?")]
        public DateTime Date { get; set; }  
    }
}