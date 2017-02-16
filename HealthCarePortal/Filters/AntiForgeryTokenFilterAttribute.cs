/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal.Filters
{
    using System.Net;
    using System.Web;
    using System.Web.Helpers;
    using System.Web.Mvc;

    /// <summary>
    /// Custom class Specifies that access to a controller or action method is restricted to users who meet the authorization requirement
    /// </summary>
    public class AntiForgeryTokenFilterAttribute : AuthorizeAttribute
    {

        /// <summary>
        /// Method that is called when a process requests authorization
        /// </summary>
        /// <param name="filterContext">The filter context, which encapsulates information for using authorize attribute</param>
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            if (filterContext != null)
            {
                var request = filterContext.HttpContext.Request;

                if (request.HttpMethod == WebRequestMethods.Http.Post)
                {
                    if (request.IsAjaxRequest())
                    {
                        AntiForgery.Validate(this.CookieValue(request), request.Headers["__RequestVerificationToken"]);
                    }
                    else
                    {
                        new ValidateAntiForgeryTokenAttribute().OnAuthorization(filterContext);
                    }
                }
            }
        }

        /// <summary>
        /// Method to fetch the cookie value from the request
        /// </summary>
        /// <param name="request">The request object</param>
        /// <returns>The cookie value for the validation token</returns>
        private string CookieValue(HttpRequestBase request)
        {
            var cookie = request.Cookies[AntiForgeryConfig.CookieName];
            return cookie != null ? cookie.Value : null;
        }
    }
}