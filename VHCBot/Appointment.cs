/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace Bot_Application
{
    using System;

    /// <summary>
    /// Appointment Class
    /// </summary>
    [Serializable]
    public class Appointment
    {
        /// <summary>
        /// Gets or sets the Patient Name
        /// </summary>
        public string PatientName { get; set; }

        /// <summary>
        /// Gets or sets the Appointment Date
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Gets or sets the SharePoint Id of list item
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Gets or sets the email identifier.
        /// </summary>
        /// <value>
        /// The email identifier.
        /// </value>
        public string EmailId { get; set; }
    }
}