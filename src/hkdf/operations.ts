import { webcrypto } from 'one-webcrypto';
import { HashAlg, SymmKeyOpts, ExportKeyFormat, SymmKey } from '../types';
import {
  DEFAULT_HASH_ALG,
  DEFAULT_SYMM_ALG,
  DEFAULT_SYMM_KEY_LENGTH,
} from '../constants';

/**
 * Derive a symmetric key from an input keying material (IKM) using HKDF.
 * @param ikm Input keying material. This must be key material with high entropy. Passwords are not recommended or safe.
 * @param salt  Salt value (a non-secret random value). Make sure to use a unique salt for each key you derive, and use an appropriate length.
 * @param infoStr Optional context and application specific information.
 * @param hashAlg Hash algorithm to use. Default is SHA-256.
 * @param uses Key usage. Default is encrypt/decrypt.
 * @param opts Optional symmetric key options.
 * @returns A promise that resolves to a CryptoKey
 */
export async function deriveKey(
  ikm: ArrayBuffer,
  salt: ArrayBuffer,
  infoStr = 'default-info',
  hashAlg: HashAlg = DEFAULT_HASH_ALG,
  uses: KeyUsage[] = ['encrypt', 'decrypt'],
  opts?: Partial<SymmKeyOpts>
): Promise<SymmKey> {
  const enc = new TextEncoder();
  return await webcrypto.subtle
    .importKey(ExportKeyFormat.RAW, ikm, 'HKDF', false, ['deriveBits'])
    .then((baseKey) =>
      webcrypto.subtle.deriveBits(
        {
          name: 'HKDF',
          hash: hashAlg,
          salt,
          info: enc.encode(infoStr),
        },
        baseKey,
        opts?.length || DEFAULT_SYMM_KEY_LENGTH
      )
    )
    .then((bits) =>
      webcrypto.subtle.importKey(
        ExportKeyFormat.RAW,
        bits,
        opts?.alg || DEFAULT_SYMM_ALG,
        true,
        uses
      )
    );
}

export default {
  deriveKey,
};
