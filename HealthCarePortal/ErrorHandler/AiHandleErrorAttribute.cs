/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */


namespace HealthCare.Portal.ErrorHandler{    using System;
    using System.Web.Mvc;
    using Microsoft.ApplicationInsights;

    /// <summary>
    /// Handles the AI error
    /// </summary>
    /// <seealso cref="System.Web.Mvc.HandleErrorAttribute" />
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]     public class AiHandleErrorAttribute : HandleErrorAttribute    {        /// <summary>
        /// Called when an exception occurs.
        /// </summary>
        /// <param name="filterContext">The action-filter context.</param>
        public override void OnException(ExceptionContext filterContext)        {            if (filterContext != null && filterContext.HttpContext != null && filterContext.Exception != null)            {                //If customError is Off, then AI HTTPModule will report the exception                if (filterContext.HttpContext.IsCustomErrorEnabled)                {                       var ai = new TelemetryClient();                    ai.TrackException(filterContext.Exception);                }             }            base.OnException(filterContext);        }    }}