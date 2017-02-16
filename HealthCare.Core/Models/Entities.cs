/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Core.Models

{
    using System;
    using System.Collections.Generic;
    using Newtonsoft.Json;

    /// <summary>
    /// Calendar Event class
    /// </summary>
    public class CalendarEvent
    {
        /// <summary>
        /// Gets or sets the display name of the user.
        /// </summary>
        /// <value>
        /// The display name of the user.
        /// </value>
        public string UserDisplayName { get; set; }

        /// <summary>
        /// Gets or sets the user email address.
        /// </summary>
        /// <value>
        /// The user email address.
        /// </value>
        public string UserEmailAddress { get; set; }

        /// <summary>
        /// Gets or sets the event identifier.
        /// </summary>
        /// <value>
        /// The event identifier.
        /// </value>
        [JsonProperty("id")]
        public string EventId { get; set; }

        /// <summary>
        /// Gets or sets the subject.
        /// </summary>
        /// <value>
        /// The subject.
        /// </value>
        [JsonProperty("subject")]
        public string Subject { get; set; }

        /// <summary>
        /// Gets or sets the body.
        /// </summary>
        /// <value>
        /// The body.
        /// </value>
        [JsonProperty("body")]
        public string Body { get; set; }

        /// <summary>
        /// Gets or sets the body preview.
        /// </summary>
        /// <value>
        /// The body preview.
        /// </value>
        [JsonProperty("bodyPreview")]
        public string BodyPreview { get; set; }

        /// <summary>
        /// Gets or sets the start date.
        /// </summary>
        /// <value>
        /// The start date.
        /// </value>
        [JsonProperty("start")]
        public DateEvent StartDate { get; set; }

        /// <summary>
        /// Gets or sets the end date.
        /// </summary>
        /// <value>
        /// The end date.
        /// </value>
        [JsonProperty("end")]
        public DateEvent EndDate { get; set; }

        /// <summary>
        /// Gets or sets the location.
        /// </summary>
        /// <value>
        /// The location.
        /// </value>
        [JsonProperty("location")]
        public string Location { get; set; }

        /// <summary>
        /// Gets or sets the attendees.
        /// </summary>
        /// <value>
        /// The attendees.
        /// </value>
        [JsonProperty("attendees")]
        public string Attendees { get; set; }

        /// <summary>
        /// Gets or sets the organizer.
        /// </summary>
        /// <value>
        /// The organizer.
        /// </value>
        [JsonProperty("organizer")]
        public string Organizer { get; set; }

        /// <summary>
        /// Gets or sets the web link.
        /// </summary>
        /// <value>
        /// The web link.
        /// </value>
        [JsonProperty("webLink")]
        public string WebLink { get; set; }

        /// <summary>
        /// Gets or sets the meeting URL.
        /// </summary>
        /// <value>
        /// The meeting URL.
        /// </value>
        public string MeetingUrl { get; set; }
    }

    /// <summary>
    /// Date Event class
    /// </summary>
    public class DateEvent
    {
        /// <summary>
        /// Gets or sets the date time value.
        /// </summary>
        /// <value>
        /// The date time value.
        /// </value>
        public DateTime DateTimeValue { get; set; }

        /// <summary>
        /// Gets or sets the time zone.
        /// </summary>
        /// <value>
        /// The time zone.
        /// </value>
        public string TimeZone { get; set; }
    }

    /// <summary>
    /// CheckBoxItem class
    /// </summary>
    public class CheckBoxItem
    {
        /// <summary>
        /// Gets or sets the identifier.
        /// </summary>
        /// <value>
        /// The identifier.
        /// </value>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the date value.
        /// </summary>
        /// <value>
        /// The date value.
        /// </value>
        public DateTime DateValue { get; set; }

        /// <summary>
        /// Gets or sets the time slot.
        /// </summary>
        /// <value>
        /// The time slot.
        /// </value>
        public string TimeSlot { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether this instance is checked.
        /// </summary>
        /// <value>
        /// <c>true</c> if this instance is checked; otherwise, <c>false</c>.
        /// </value>
        public bool IsChecked { get; set; }
    }

    /// <summary>
    /// Meeting Details class
    /// </summary>
    public class MeetingDetails
    {
        /// <summary>
        /// Gets or sets the identifier.
        /// </summary>
        /// <value>
        /// The identifier.
        /// </value>
        public string Id { get; set; }

        /// <summary>
        /// Gets or sets the on line meeting identifier.
        /// </summary>
        /// <value>
        /// The on line meeting identifier.
        /// </value>
        public string OnLineMeetingId { get; set; }

        /// <summary>
        /// Gets or sets the online meeting URI.
        /// </summary>
        /// <value>
        /// The online meeting URI.
        /// </value>
        public string OnlineMeetingUri { get; set; }

        /// <summary>
        /// Gets or sets the organizer.
        /// </summary>
        /// <value>
        /// The organizer.
        /// </value>
        public string Organizer { get; set; }

        /// <summary>
        /// Gets or sets the attendees.
        /// </summary>
        /// <value>
        /// The attendees.
        /// </value>
        public string Attendees { get; set; }

        /// <summary>
        /// Gets or sets the join URL.
        /// </summary>
        /// <value>
        /// The join URL.
        /// </value>
        public string JoinUrl { get; set; }
    }

    /// <summary>
    /// Questionnaire classes
    /// </summary>
    public class Questionnaire
    {
        /// <summary>
        /// Gets or sets the questionnaire identifier.
        /// </summary>
        /// <value>
        /// The questionnaire identifier.
        /// </value>
        public int QuestionnaireId { get; set; }

        /// <summary>
        /// Gets or sets the question.
        /// </summary>
        /// <value>
        /// The question.
        /// </value>
        public string Question { get; set; }

        /// <summary>
        /// Gets or sets the options.
        /// </summary>
        /// <value>
        /// The options.
        /// </value>
        public IList<string> Options { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether [allow multiple choice].
        /// </summary>
        /// <value>
        ///   <c>true</c> if [allow multiple choice]; otherwise, <c>false</c>.
        /// </value>
        public bool AllowMultipleChoice { get; set; }

        /// <summary>
        /// Gets or sets the selected options.
        /// </summary>
        /// <value>
        /// The selected options.
        /// </value>
        public string SelectedOptions { get; set; }

        /// <summary>
        /// Gets or sets the meeting identifier.
        /// </summary>
        /// <value>
        /// The meeting identifier.
        /// </value>
        public string MeetingId { get; set; }
    }

    /// <summary>
    /// Configuration Details
    /// </summary>
    public class ConfigurationDetails
    {
        /// <summary>
        /// Gets or sets the key.
        /// </summary>
        /// <value>
        /// The key.
        /// </value>
        public string Key { get; set; }

        /// <summary>
        /// Gets or sets the value.
        /// </summary>
        /// <value>
        /// The value.
        /// </value>
        public string Value { get; set; }
    }

    /// <summary>
    /// Peers class
    /// </summary>
    public class Peers
    {
        /// <summary>
        /// Gets or sets the title.
        /// </summary>
        /// <value>
        /// The title.
        /// </value>
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets the department.
        /// </summary>
        /// <value>
        /// The department.
        /// </value>
        public string Department { get; set; }

        /// <summary>
        /// Gets or sets the designation.
        /// </summary>
        /// <value>
        /// The designation.
        /// </value>
        public string Designation { get; set; }

        /// <summary>
        /// Gets or sets the email.
        /// </summary>
        /// <value>
        /// The email.
        /// </value>
        public string Email { get; set; }

        /// <summary>
        /// Gets or sets the identifier.
        /// </summary>
        /// <value>
        /// The identifier.
        /// </value>
        public string Id { get; set; }
    }
}
