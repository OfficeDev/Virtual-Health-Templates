/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace VHCBot.Dialogs
{
    using System;
    using System.Threading.Tasks;
    using Microsoft.Bot.Builder.Dialogs;

    /// <summary>
    /// Cancel Appointment Dialog
    /// </summary>
    [Serializable]
    public class CancelAppointmentDialog : IDialog<object>
    {
        /// <summary>
        /// In built Start Async method
        /// </summary>
        /// <param name="context">IDialogContext context</param>
        /// <returns>Task object</returns>
        public async Task StartAsync(IDialogContext context)
        {
            context.Fail(new NotImplementedException("Cancel appointment is not implemented and is instead being used to show context.Fail"));
            context.Done<object>(null);
        }
    }
}