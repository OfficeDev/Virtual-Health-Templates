/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace VHCBot.Controllers
{
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using System.Web.Http;
    using Dialogs;
    using Microsoft.Bot.Builder.Dialogs;
    using Microsoft.Bot.Connector;

    /// <summary>
    /// Message Controller Class
    /// </summary>
    [BotAuthentication]
    public class MessagesController : ApiController
    {
        /// <summary>
        /// POST: Messages
        /// Receive a message from a user and reply to it
        /// </summary>
        /// <param name="activity">The activity object</param>
        /// <returns>Returns Response Task</returns>
        public async Task<HttpResponseMessage> Post([FromBody]Activity activity)
        {            
            if (activity.Type == ActivityTypes.Message)
            {
                await Conversation.SendAsync(activity, () => new LUISApp());
            }
            else
            {
                this.HandleSystemMessage(activity);
            }

            var response = Request.CreateResponse(HttpStatusCode.OK);
            return response;
        }

        /// <summary>
        /// Handles System Messages
        /// </summary>
        /// <param name="message">Message object</param>
        /// <returns>returns Activity Object</returns>
        private Activity HandleSystemMessage(Activity message)
        {
            if (message.Type == ActivityTypes.DeleteUserData)
            {
                // Implement user deletion here
                // If we handle user deletion, return a real message
            }
            else if (message.Type == ActivityTypes.ConversationUpdate)
            {
                // Handle conversation state changes, like members being added and removed
                // Use Activity.MembersAdded and Activity.MembersRemoved and Activity.Action for info
                // Not available in all channels
            }
            else if (message.Type == ActivityTypes.ContactRelationUpdate)
            {
                // Handle add/remove from contact lists
                // Activity.From + Activity.Action represent what happened
            }
            else if (message.Type == ActivityTypes.Typing)
            {
                // Handle knowing tha the user is typing
            }
            else if (message.Type == ActivityTypes.Ping)
            {
            }

            return null;
        }
    }
}