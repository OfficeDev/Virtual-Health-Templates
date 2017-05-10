/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Web
{
  using System.Web.Optimization;

  /// <summary>
  /// Bundle Config
  /// </summary>
  public class BundleConfig
  {
    /// <summary>
    /// Registers the bundles.
    /// </summary>
    /// <param name="bundles">The bundles.</param>
    public static void RegisterBundles(BundleCollection bundles)
    {
      bundles.Add(new StyleBundle("~/bundles/css").Include(
                    "~/Content/bootstrap.css",
                    "~/Content/fabric.min.css",
                    "~/Content/fabric.components.css",
                    "~/Content/main.css",
                    "~/Content/font-awesome.min.css"));

      bundles.Add(new ScriptBundle("~/bundles/vendor").Include(
                   "~/Scripts/bootstrap.js",
                   "~/Scripts/jquery-{version}.js",
                   "~/Scripts/fabric.min.js",
                   "~/Scripts/pickadate/picker.js",
                   "~/Scripts/pickadate/picker.date.js",
                   "~/Scripts/SkypeBootstrap.min.js"));
    }
  }
}