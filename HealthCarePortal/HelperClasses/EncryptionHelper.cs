/* 
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

namespace HealthCare.Portal.HelperClasses
{
    using System;
    using System.IO;
    using System.Runtime.InteropServices;
    using System.Security.Cryptography;
    using System.Text;

    /// <summary>
    /// Encryption and decryption helper. 
    /// </summary>
    public class EncryptionHelper
    {
        /// <summary>
        /// Crypts the derive key.
        /// </summary>
        /// <param name="hProv">The h prov.</param>
        /// <param name="algId">The alg identifier.</param>
        /// <param name="hCryptHash">The h crypt hash.</param>
        /// <param name="dwFlags">The dw flags.</param>
        /// <param name="phKey">The ph key.</param>
        /// <returns>Delivery Key</returns>
        [DllImport("advapi32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool CryptDeriveKey(IntPtr hProv, uint algId, IntPtr hCryptHash, uint dwFlags, ref IntPtr phKey);

        /// <summary>
        /// Crypts the create hash.
        /// </summary>
        /// <param name="hProv">The h prov.</param>
        /// <param name="algId">The alg identifier.</param>
        /// <param name="hKey">The h key.</param>
        /// <param name="dwProvType">Type of the dw prov.</param>
        /// <param name="phHash">The ph hash.</param>
        /// <returns>Returns hash</returns>
        [DllImport("Advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool CryptCreateHash(IntPtr hProv, uint algId, IntPtr hKey, uint dwProvType, ref IntPtr phHash);

        /// <summary>
        /// Crypts the acquire context.
        /// </summary>
        /// <param name="hProv">The h prov.</param>
        /// <param name="pszContainer">The PSZ container.</param>
        /// <param name="pszProvider">The PSZ provider.</param>
        /// <param name="dwProvType">Type of the dw prov.</param>
        /// <param name="dwFlags">The dw flags.</param>
        /// <returns>Context</returns>
        [DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool CryptAcquireContext(out IntPtr hProv, string pszContainer, string pszProvider, uint dwProvType, uint dwFlags);

        /// <summary>
        /// Crypts the hash data.
        /// </summary>
        /// <param name="hHash">The h hash.</param>
        /// <param name="pbData">The pb data.</param>
        /// <param name="dataLen">Length of the data.</param>
        /// <param name="flags">The flags.</param>
        /// <returns>Hash data</returns>
        [DllImport("advapi32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool CryptHashData(IntPtr hHash, byte[] pbData, uint dataLen, uint flags);

        /// <summary>
        /// Crypts the destroy hash.
        /// </summary>
        /// <param name="hHash">The h hash.</param>
        /// <returns>Destroy hash</returns>
        [DllImport("advapi32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool CryptDestroyHash(IntPtr hHash);

        /// <summary>
        /// Crypts the decrypt.
        /// </summary>
        /// <param name="hKey">The h key.</param>
        /// <param name="hHash">The h hash.</param>
        /// <param name="final">if set to <c>true</c> [final].</param>
        /// <param name="dwFlags">The dw flags.</param>
        /// <param name="pbData">The pb data.</param>
        /// <param name="pdwDataLen">Length of the PDW data.</param>
        /// <returns>Used for Decrypting</returns>
        [DllImport("advapi32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool CryptDecrypt(IntPtr hKey, IntPtr hHash, [MarshalAs(UnmanagedType.Bool)]bool final, uint dwFlags, byte[] pbData, ref uint pdwDataLen);

        /// <summary>
        /// Crypts the destroy key.
        /// </summary>
        /// <param name="phKey">The ph key.</param>
        /// <returns>Destroy the key</returns>
        [DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool CryptDestroyKey(IntPtr phKey);

        /// <summary>
        /// Crypts the encrypt.
        /// </summary>
        /// <param name="hKey">The h key.</param>
        /// <param name="hHash">The h hash.</param>
        /// <param name="final">if set to <c>true</c> [final].</param>
        /// <param name="dwFlags">The dw flags.</param>
        /// <param name="pbData">The pb data.</param>
        /// <param name="dataLen">Length of the data.</param>
        /// <param name="bufferLen">Length of the buffer.</param>
        /// <returns>Encrypt</returns>
        [DllImport("advapi32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool CryptEncrypt(IntPtr hKey, IntPtr hHash, [MarshalAs(UnmanagedType.Bool)]bool final, uint dwFlags, byte[] pbData, ref uint dataLen, uint bufferLen);

        /// <summary>
        /// The cryp t_ verifycontext
        /// </summary>
        private const uint CRYPT_VERIFYCONTEXT = 4026531840;

        /// <summary>
        /// The cryp t_ newkeyset
        /// </summary>
        private const uint CRYPT_NEWKEYSET = 8;

        /// <summary>
        /// The cryp t_ machin e_ keyset
        /// </summary>
        private const uint CRYPT_MACHINE_KEYSET = 32;

        /// <summary>
        /// The al g_ clas s_ dat a_ encrypt
        /// </summary>
        private const uint ALG_CLASS_DATA_ENCRYPT = 24576;

        /// <summary>
        /// The al g_ typ e_ stream
        /// </summary>
        private const uint ALG_TYPE_STREAM = 2048;

        /// <summary>
        /// The al g_ si d_ r c4
        /// </summary>
        private const uint ALG_SID_RC4 = 26625;

        /// <summary>
        /// Encrypts the specified data.
        /// </summary>
        /// <param name="data">The data.</param>
        /// <returns></returns>
        public static string Encrypt(string data)
        {
            ////if (string.IsNullOrWhiteSpace(textBox3.Text))
            ////{
            ////    return "";
            ////}

            IntPtr hProv = IntPtr.Zero;

            if (string.IsNullOrWhiteSpace(data))
            {
                return "";
            }
            try
            {
                if (!CryptAcquireContext(out hProv, null, "Microsoft Enhanced RSA and AES Cryptographic Provider", 24, CRYPT_VERIFYCONTEXT))
                {
                    if (!CryptAcquireContext(out hProv, null, "Microsoft Enhanced RSA and AES Cryptographic Provider", 24, CRYPT_NEWKEYSET | CRYPT_VERIFYCONTEXT))
                    {
                        if (!CryptAcquireContext(out hProv, null, "Microsoft Enhanced RSA and AES Cryptographic Provider", 24, CRYPT_MACHINE_KEYSET | CRYPT_VERIFYCONTEXT))
                        {
                            if (!CryptAcquireContext(out hProv, null, "Microsoft Enhanced RSA and AES Cryptographic Provider", 24, CRYPT_NEWKEYSET | CRYPT_MACHINE_KEYSET | CRYPT_VERIFYCONTEXT))
                            {
                                return "";
                            }
                        }
                    }

                }
                byte[] key = Encoding.ASCII.GetBytes(KeyVaultHelper.EncryptionKey);
                byte[] dataBytes = Encoding.ASCII.GetBytes(data);

                IntPtr hHash = IntPtr.Zero;
                IntPtr hKey = IntPtr.Zero;
                if (!CryptCreateHash(hProv, (uint)32772, IntPtr.Zero, (uint)0, ref hHash))
                {
                    return "";
                }
                if (!CryptHashData(hHash, key, (uint)(key.Length), 0))
                {
                    return "";
                }
                if (!CryptDeriveKey(hProv, (uint)26126, hHash, (uint)1, ref hKey))
                {
                    return "";
                }
                CryptDestroyHash(hHash);
                uint len = (uint)dataBytes.Length;
                uint newLen = len;
                CryptEncrypt(hKey, IntPtr.Zero, true, (uint)0, null, ref newLen, len);
                byte[] encrypted = new byte[newLen];
                dataBytes.CopyTo(encrypted, 0);
                CryptEncrypt(hKey, IntPtr.Zero, true, (uint)0, encrypted, ref len, newLen);
                CryptDestroyKey(hKey);
                return System.Convert.ToBase64String(encrypted);
            }
            catch (Exception e)
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// Decrypts the specified data.
        /// </summary>
        /// <param name="data">The data.</param>
        /// <returns></returns>
        public static string Decrypt(string data)
        {
            IntPtr hProv = IntPtr.Zero;

            if (string.IsNullOrWhiteSpace(data))
            {
                return "";
            }
            try
            {
                if (!CryptAcquireContext(out hProv, null, "Microsoft Enhanced RSA and AES Cryptographic Provider", 24, CRYPT_VERIFYCONTEXT))
                {
                    if (!CryptAcquireContext(out hProv, null, "Microsoft Enhanced RSA and AES Cryptographic Provider", 24, CRYPT_NEWKEYSET | CRYPT_VERIFYCONTEXT))
                    {
                        if (!CryptAcquireContext(out hProv, null, "Microsoft Enhanced RSA and AES Cryptographic Provider", 24, CRYPT_MACHINE_KEYSET | CRYPT_VERIFYCONTEXT))
                        {
                            if (!CryptAcquireContext(out hProv, null, "Microsoft Enhanced RSA and AES Cryptographic Provider", 24, CRYPT_NEWKEYSET | CRYPT_MACHINE_KEYSET | CRYPT_VERIFYCONTEXT))
                            {
                                return "";
                            }
                        }
                    }

                }
                byte[] key = Encoding.ASCII.GetBytes(KeyVaultHelper.EncryptionKey);
                byte[] dataBytes = System.Convert.FromBase64String(data);
                byte[] decrypted = new byte[dataBytes.Length];
                dataBytes.CopyTo(decrypted, 0);
                IntPtr hHash = IntPtr.Zero;
                IntPtr hKey = IntPtr.Zero;
                if (!CryptCreateHash(hProv, (uint)32772, IntPtr.Zero, (uint)0, ref hHash))
                {
                    return "";
                }
                if (!CryptHashData(hHash, key, (uint)(key.Length), 0))
                {
                    return "";
                }
                if (!CryptDeriveKey(hProv, (uint)26126, hHash, (uint)1, ref hKey))
                {
                    return "";
                }
                CryptDestroyHash(hHash);
                uint len = (uint)dataBytes.Length;
                CryptDecrypt(hKey, IntPtr.Zero, true, 0, decrypted, ref len);
                CryptDestroyKey(hKey);
                return Encoding.Default.GetString(decrypted).Substring(0, (int)len);
            }
            catch (Exception e)
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// Decrypts the with salt.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="text">The text.</param>
        /// <param name="password">The password.</param>
        /// <param name="salt">The salt.</param>
        /// <returns></returns>
        public static string DecryptWithSalt<T>(string text, string password, string salt)
    where T : SymmetricAlgorithm, new()
        {
            DeriveBytes rgb = new Rfc2898DeriveBytes(password, Encoding.Unicode.GetBytes(salt));

            SymmetricAlgorithm algorithm = new T();

            byte[] rgbKey = rgb.GetBytes(algorithm.KeySize >> 3);
            byte[] rgbIV = rgb.GetBytes(algorithm.BlockSize >> 3);

            ICryptoTransform transform = algorithm.CreateDecryptor(rgbKey, rgbIV);

            using (MemoryStream buffer = new MemoryStream(Convert.FromBase64String(text)))
            {
                using (CryptoStream stream = new CryptoStream(buffer, transform, CryptoStreamMode.Read))
                {
                    using (StreamReader reader = new StreamReader(stream, Encoding.Unicode))
                    {
                        return reader.ReadToEnd();
                    }
                }
            }
        }
    }
}