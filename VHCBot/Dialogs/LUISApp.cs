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
    using Microsoft.Bot.Builder.FormFlow;
    using Microsoft.Bot.Builder.Luis;
    using Microsoft.Bot.Builder.Luis.Models;

    /// <summary>
    /// LUIS Dialog Class
    /// </summary>
    [LuisModel("cf67e9e5-59d0-41fb-8742-5b149463bc4b", "4a65f6cdce734be282ed2962b5aa30e4")]
    [Serializable]
    public class LUISApp : LuisDialog<object>
    {
        /// <summary>
        /// Gets the Date entity of LUIS model
        /// </summary>
        private const string EntityDate = "builtin.datetime.date";

        /// <summary>
        /// Dynamic prompt option 1 for for yes no
        /// </summary>
        private string dynamicPromptOption1 = string.Empty;

        /// <summary>
        /// Dynamic prompt option 1 for for yes no
        /// </summary>
        private string dynamicPromptOption2 = string.Empty;

        /// <summary>
        /// Will run when a None intent is Triggered 
        /// </summary>
        /// <param name="context">IDialogContext object</param>
        /// <param name="result">LuisResult object</param>
        /// <returns>returns Task</returns>
        [LuisIntent("")]
        public async Task None(IDialogContext context, LuisResult result)
        {
            // Add Custom code here. 
            string message = $"Oops! I didn't get that. Try saying something like (Book appointment on tuesday)";
            await context.PostAsync(message);
            context.Wait(this.MessageReceived);
        }

        /// <summary>
        /// Will run when a GetWeather intent is Triggered 
        /// </summary>
        /// <param name="context">IDialogContext object</param>
        /// <param name="result">LuisResult object</param>
        /// <returns>returns Task</returns>
        [LuisIntent("CancelMeeting")]
        public async Task CancelMeeting(IDialogContext context, LuisResult result)
        {
            // Add Custom code here. 
            string message = $"Appointment cancelation feature is yet to be implemented";
            await context.PostAsync(message);
            context.Wait(this.MessageReceived);
        }

        /// <summary>
        /// Will run when a Book flight intent is Triggered 
        /// </summary>
        /// <param name="context">IDialogContext object</param>
        /// <param name="result">LuisResult object</param>
        /// <returns>Return task object</returns>
        [LuisIntent("BookMeeting")]
        public async Task BookMeeting(IDialogContext context, LuisResult result)
        {
            // Add Custom code here.            
            EntityRecommendation cityEntityRecommendation;

            if (result.TryFindEntity(EntityDate, out cityEntityRecommendation))
            {
                cityEntityRecommendation.Type = "Date";
            }

            AppointmentsQuery appQuery = new AppointmentsQuery();
            var appointmentsFormDialog = new FormDialog<AppointmentsQuery>(appQuery, this.BuildAppointmentsForm, FormOptions.PromptInStart, result.Entities);
            context.Call(appointmentsFormDialog, this.ResumeAfterAppointmentsFormDialog);
        }

        /// <summary>
        /// Builds FormBuilder object
        /// </summary>
        /// <returns>returns IForm of AppointmentsQuery type </returns>
        private IForm<AppointmentsQuery> BuildAppointmentsForm()
        {
            OnCompletionAsyncDelegate<AppointmentsQuery> processAppointmentsSearch = async (context, state) =>
            {
                await context.PostAsync($"Ok. Searching for available appointments on {state.Date.ToString("dd MMM")}  ...");
            };

            return new FormBuilder<AppointmentsQuery>()
                .Field(nameof(AppointmentsQuery.Date), (state) => true)
                .AddRemainingFields()
                .OnCompletion(processAppointmentsSearch)
                .Build();
        }

        /// <summary>
        /// Resumes after appointments dialog is completed
        /// </summary>
        /// <param name="context">The context object</param>
        /// <param name="result">Return Task object</param>
        /// <returns>Returns Task</returns>
        private async Task ResumeAfterAppointmentsFormDialog(IDialogContext context, IAwaitable<AppointmentsQuery> result)
        {
            try
            {
                var searchQuery = await result;

                var appointments = await this.GetAppointmentsAsync(searchQuery);
                var appointmentsQueryFormDialog = FormDialog.FromForm(
                    this.BuildAppointmentsForm,
                        FormOptions.PromptInStart);
                if (appointments.Count() == 0)
                {
                    var nextAppointment = PortalHelper.GetNextAvailableAppointment(searchQuery.Date.AddDays(1));
                    if (nextAppointment != null)
                    {
                        this.dynamicPromptOption1 = nextAppointment.Date.ToShortDateString() + " " + nextAppointment.Date.ToShortTimeString();
                        this.dynamicPromptOption2 = "Some other date";
                        PromptDialog.Choice(context, this.ResumeAfterNextAppointment, new List<string>() { this.dynamicPromptOption1, this.dynamicPromptOption2 }, $"Oops! No appointment available on {searchQuery.Date.ToShortDateString()}.", "Sorry! I didn't get that. Try typing one of options listed above", 5);
                    }
                    else
                    {
                        await context.PostAsync("Please type another date.");
                        context.Call(appointmentsQueryFormDialog, this.ResumeAfterAppointmentsFormDialog);
                    }
                }
                else
                {
                    // await context.PostAsync($"I found in total {Appointments.Count()} appoitments for your dates:");
                    var appDlg = new AppointmentsListDialog();
                    appDlg.Appointments = appointments.ToList();
                    context.Call(appDlg, this.ResumeAfterOptionDialog);
                }
            }
            catch (FormCanceledException ex)
            {
                string reply;

                if (ex.InnerException == null)
                {
                    reply = "You have canceled the operation. Quitting from the AppointmentsDialog";
                }
                else
                {
                    reply = $"Oops! Something went wrong :( Technical Details: {ex.InnerException.Message}";
                }

                await context.PostAsync(reply);
            }
        }

        /// <summary>
        /// Returns Next available appointment
        /// </summary>
        /// <param name="context">Dialog context object</param>
        /// <param name="result"> Query Date string </param>
        /// <returns>returns next appointment</returns>
        private async Task ResumeAfterNextAppointment(IDialogContext context, IAwaitable<string> result)
        {
            string optionSelected = await result;

            if (optionSelected == this.dynamicPromptOption1)
            {
                var confirmedAppointment = Convert.ToDateTime(optionSelected);
                await context.PostAsync($"Great! You chose to book appointment on {confirmedAppointment.ToShortDateString()} at {confirmedAppointment.ToShortTimeString()}");

                var appointListDialog = new AppointmentsListDialog();
                appointListDialog.ShowConfirmationOptions(context);
            }
            else if (optionSelected == this.dynamicPromptOption2)
            {
                var appointmentsFormDialog = FormDialog.FromForm(this.BuildAppointmentsForm, FormOptions.PromptInStart);
                context.Call(appointmentsFormDialog, this.ResumeAfterAppointmentsFormDialog);
            }
        }

        /// <summary>
        /// Gets Available Appointments 
        /// </summary>
        /// <param name="searchQuery">Appointment search query object</param>
        /// <returns>Collection of Appointments</returns>
        private async Task<IEnumerable<Appointment>> GetAppointmentsAsync(AppointmentsQuery searchQuery)
        {
            var appointments = PortalHelper.GetAvailableAppointments(searchQuery.Date);

            appointments.Sort((h1, h2) => h1.Date.CompareTo(h2.Date));

            return appointments;
        }

        /// <summary>
        /// Resumes after option dialog is completed
        /// </summary>
        /// <param name="context">The IDialogContext object</param>
        /// <param name="result">Result object</param>
        /// <returns>Returns Task</returns>
        private async Task ResumeAfterOptionDialog(IDialogContext context, IAwaitable<object> result)
        {
            try
            {
                var message = await result;
            }
            catch (Exception ex)
            {
                await context.PostAsync($"Failed with message: {ex.Message}");
            }
            finally
            {
                context.Done<object>(null);
            }
        }
    }
}