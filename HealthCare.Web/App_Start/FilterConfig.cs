/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Web
{
  using System.Web.Mvc;

  /// <summary>
  /// Filter config class.
  /// </summary>
  public class FilterConfig
  {
    /// <summary>
    /// Registers the global filters.
    /// </summary>
    /// <param name="filters">The filters.</param>
    public static void RegisterGlobalFilters(GlobalFilterCollection filters)
    {
      filters.Add(new ErrorHandler.AiHandleErrorAttribute());
    }
  }
}