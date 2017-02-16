/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal.Models
{
    using System.Data.Entity;

    /// <summary>
    /// Application database content class.
    /// </summary>
    /// <seealso cref="System.Data.Entity.DbContext" />
    public class ApplicationDbContext : DbContext
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ApplicationDbContext"/> class.
        /// </summary>
        public ApplicationDbContext()
            : base("DefaultConnection")
        {
        }

        /// <summary>
        /// Gets or sets the user token cache list.
        /// </summary>
        /// <value>
        /// The user token cache list.
        /// </value>
        public DbSet<UserTokenCache> UserTokenCacheList { get; set; }
    }
}