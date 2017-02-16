/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// User token cache class.
    /// </summary>
    public class UserTokenCache
    {
        /// <summary>
        /// Gets or sets the user token cache identifier.
        /// </summary>
        /// <value>
        /// The user token cache identifier.
        /// </value>
        [Key]
        public int UserTokenCacheId { get; set; }

        /// <summary>
        /// Gets or sets the web user unique identifier.
        /// </summary>
        /// <value>
        /// The web user unique identifier.
        /// </value>
        public string WebUserUniqueId { get; set; }

        /// <summary>
        /// Gets or sets the cache bits.
        /// </summary>
        /// <value>
        /// The cache bits.
        /// </value>
        public byte[] CacheBits { get; set; }

        /// <summary>
        /// Gets or sets the last write.
        /// </summary>
        /// <value>
        /// The last write.
        /// </value>
        public DateTime LastWrite { get; set; }
    }
}