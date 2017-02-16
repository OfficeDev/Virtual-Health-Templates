/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal.HelperClasses
{
    /// <summary>
    /// This helper class provides store for key vault secrets
    /// </summary>
    public static class KeyVaultHelper
    {

        /// <summary>
        /// Gets or sets the SPO Password.
        /// </summary>
        /// <value>
        /// The encrypt secret.
        /// </value>
        public static string SpoPassword { get; set; }

        /// <summary>
        /// Gets or sets the IDA password.
        /// </summary>
        /// <value>
        /// The IDA user password.
        /// </value>
        public static string IdaPassword { get; set; }

        /// <summary>
        /// Gets or sets the encryption key.
        /// </summary>
        /// <value>
        /// The encryption key.
        /// </value>
        public static string EncryptionKey { get; set; }

        /// <summary>
        /// Gets or sets the encryption salt.
        /// </summary>
        /// <value>
        /// The encryption salt.
        /// </value>
        public static string EncryptionSalt { get; set; }
        
    }
}