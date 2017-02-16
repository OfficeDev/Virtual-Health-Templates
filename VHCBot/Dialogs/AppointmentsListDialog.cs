/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace VHCBot.Dialogs
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Bot_Application;
    using Microsoft.Bot.Builder.Dialogs;

    /// <summary>
    /// Appointments List Dialog
    /// </summary>
    [Serializable]
    public class AppointmentsListDialog : IDialog<object>
    {
        /// <summary>
        /// Confirmed Appointment Date
        /// </summary>
        private Appointment confirmedAppointment = new Appointment();

        /// <summary>
        /// Gets or sets Appointments collection
        /// </summary>
        public List<Appointment> Appointments { get; set; } = new List<Appointment>();

        /// <summary>
        /// In built Start Async method
        /// </summary>
        /// <param name="context">IDialogContext context</param>
        /// <returns>Task object</returns>
        public async Task StartAsync(IDialogContext context)
        {
            this.ShowOptions(context);
        }

        /// <summary>
        /// Show Options for Available time slots
        /// </summary>
        /// <param name="context">IDialogContext object</param>
        public void ShowOptions(IDialogContext context)
        {
            var appList = this.Appointments.Select(a => a.Date.ToShortTimeString());

            PromptDialog.Choice(context, this.OnOptionSelected, appList, "I have these time slots available", "Not a valid option. Below are the only valid option(s)", 3);
        }

        /// <summary>
        /// Method is called after time slot option is selected
        /// </summary>
        /// <param name="context">IDialogContext object</param>
        /// <param name="result">Result object</param>
        /// <returns>Returns Task object</returns>
        public async Task OnOptionSelected(IDialogContext context, IAwaitable<string> result)
        {
            try
            {
                string optionSelected = await result;
                this.confirmedAppointment = this.Appointments.FirstOrDefault(dt => dt.Date.ToShortTimeString() == optionSelected);
                await context.PostAsync($"Great! You chose to book appointment on {confirmedAppointment.Date.ToShortDateString()} at {confirmedAppointment.Date.ToShortTimeString()}");

                this.GetName(context);
                
            }
            catch (TooManyAttemptsException)
            {
                await context.PostAsync($"Ooops! Too many attemps :(. But don't worry, I'm handling that exception and you can try again!");

                context.Done<object>(null);
            }
        }

        /// <summary>
        /// Gets the name.
        /// </summary>
        /// <param name="context">The context.</param>
        public void GetName(IDialogContext context)
        {
            PromptDialog.Text(context, this.OnNameEntered, "Enter name of the patient", "Please enter name of the patient", 3);
        }

        /// <summary>
        /// Called when [name entered].
        /// </summary>
        /// <param name="context">The context.</param>
        /// <param name="result">The result.</param>
        /// <returns></returns>
        public async Task OnNameEntered(IDialogContext context, IAwaitable<string> result)
        {
            string name = await result;
            this.confirmedAppointment.PatientName = name;
            this.GetEmailId(context);
        }

        /// <summary>
        /// Gets the email identifier.
        /// </summary>
        /// <param name="context">The context.</param>
        public void GetEmailId(IDialogContext context)
        {
            PromptDialog.Text(context, this.OnEmailEntered, "Enter email id for communication", "Please enter email id", 3);
        }

        /// <summary>
        /// Called when [email entered].
        /// </summary>
        /// <param name="context">The context.</param>
        /// <param name="result">The result.</param>
        /// <returns></returns>
        public async Task OnEmailEntered(IDialogContext context, IAwaitable<string> result)
        {
            string emailId = await result;
            this.confirmedAppointment.EmailId = emailId;
            this.ShowConfirmationOptions(context);
        }

        /// <summary>
        /// Shows Confirmation options in Bot Window
        /// </summary>
        /// <param name="context">IDialogContext object</param>
        public void ShowConfirmationOptions(IDialogContext context)
        {
            var appList = this.Appointments.Select(a => a.Date.ToShortTimeString());

            PromptDialog.Choice(context, this.OnConfirmationOptionSelected, new List<string> { "Book", "Cancel" }, "Confirm your booking", "Not a valid option. Below are the only valid option(s)", 3);
        }

        /// <summary>
        /// Method is called after confirmation option is selected
        /// </summary>
        /// <param name="context">IDialogContext object</param>
        /// <param name="result">Result object</param>
        /// <returns>Returns Task object</returns>
        public async Task OnConfirmationOptionSelected(IDialogContext context, IAwaitable<string> result)
        {
            try
            {
                string optionSelected = await result;

                switch (optionSelected)
                {
                    case "Book":
                        PortalHelper.BookApointment(this.confirmedAppointment);
                        await context.PostAsync($"Your online appointment is confirmed on {confirmedAppointment.Date.ToShortDateString()} at {confirmedAppointment.Date.ToShortTimeString()}. You will receive an email with online meeting joining link.");
                        break;

                    case "Cancel":

                        // context.Call(new RootDialog(), this.ResumeAfterOptionDialog);
                        break;
                }

                context.Done<object>(null);
            }
            catch (TooManyAttemptsException)
            {
                await context.PostAsync($"Ooops! Too many attemps :(. But don't worry, I'm handling that exception and you can try again!");

                context.Done<object>(null);
            }
        }
    }
}