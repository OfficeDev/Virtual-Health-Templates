/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal
{
    using System.Web.Optimization;

    /// <summary>
    /// Bundle Config class
    /// </summary>
    public class BundleConfig
    {
        /// <summary>
        /// Register bundles method
        /// </summary>
        /// <param name="bundles">The bundles.</param>
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js",
                        "~/Scripts/jquery.unobtrusive-ajax.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                        "~/Scripts/jquery-1.11.3.js",
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/main.css",
                      "~/Content/site.css",
                      "~/Content/conference.css",
                      "~/Content/CalendarCss.css",
                      "~/Content/skypestyle.css",
                      "~/Content/multivideo.css",
                       "~/Content/WelcomePageStyle.css",
                       "~/Content/style.css",
                       "~/Content/speedtest.css"));

            bundles.Add(new ScriptBundle("~/bundles/angularjs").Include(
                      "~/Scripts/angular.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/ConfigurePage").Include(
               "~/Scripts/swfobject.js",
                "~/Scripts/speedtest.js",
                "~/Scripts/TrustedApiAuth.js",
                "~/Scripts/HealthCare/ConfigurePage.js"));
        }
    }
}