/**
 * 생체 인증 유틸리티
 * Web Authentication API (WebAuthn) 기반
 * 모바일 브라우저에서 지문/얼굴 인증 지원
 */

export interface BiometricAuthOptions {
  userId: string
  username: string
  displayName: string
}

export interface BiometricCredential {
  id: string
  publicKey: string
  counter: number
}

/**
 * WebAuthn 지원 여부 확인
 */
export function isBiometricSupported(): boolean {
  if (typeof window === 'undefined') return false
  
  return !!(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
  )
}

/**
 * 플랫폼 인증기(지문/얼굴) 사용 가능 여부 확인
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) return false
  
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

/**
 * 생체 인증 등록 (Register)
 */
export async function registerBiometric(options: BiometricAuthOptions): Promise<PublicKeyCredential> {
  if (!isBiometricSupported()) {
    throw new Error('생체 인증을 지원하지 않는 브라우저입니다.')
  }

  const available = await isPlatformAuthenticatorAvailable()
  if (!available) {
    throw new Error('생체 인증을 사용할 수 없습니다. 기기 설정에서 지문/얼굴 인증을 활성화해주세요.')
  }

  // 서버에서 challenge 생성 요청
  const challengeResponse = await fetch('/api/auth/biometric/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: options.userId,
      username: options.username,
    }),
  })

  if (!challengeResponse.ok) {
    const error = await challengeResponse.json().catch(() => ({}))
    throw new Error(error.message || '생체 인증 등록에 실패했습니다.')
  }

  const { challenge, rp, user } = await challengeResponse.json()

  // WebAuthn 등록 요청
  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge: Uint8Array.from(atob(challenge), (c) => c.charCodeAt(0)),
    rp: {
      name: rp.name || '여우스킨 CRM',
      id: rp.id || window.location.hostname,
    },
    user: {
      id: Uint8Array.from(user.id, (c: string) => c.charCodeAt(0)),
      name: options.username,
      displayName: options.displayName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // 플랫폼 인증기만 사용 (지문/얼굴)
      userVerification: 'required',
    },
    timeout: 60000,
    attestation: 'direct',
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential

    if (!credential) {
      throw new Error('생체 인증 등록이 취소되었습니다.')
    }

    // 서버에 등록 정보 전송
    const response = await credential.response as AuthenticatorAttestationResponse
    const registrationData = {
      id: credential.id,
      rawId: Array.from(new Uint8Array(credential.rawId)),
      response: {
        clientDataJSON: Array.from(new Uint8Array(response.clientDataJSON)),
        attestationObject: Array.from(new Uint8Array(response.attestationObject)),
      },
      type: credential.type,
    }

    const verifyResponse = await fetch('/api/auth/biometric/verify-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    })

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json().catch(() => ({}))
      throw new Error(error.message || '생체 인증 등록 검증에 실패했습니다.')
    }

    return credential
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('생체 인증이 거부되었습니다. 다시 시도해주세요.')
      }
      if (error.name === 'InvalidStateError') {
        throw new Error('이미 등록된 생체 인증이 있습니다.')
      }
      throw error
    }
    throw new Error('생체 인증 등록 중 오류가 발생했습니다.')
  }
}

/**
 * 생체 인증 로그인 (Authenticate)
 */
export async function authenticateBiometric(userId: string): Promise<{ credential: PublicKeyCredential; token: string }> {
  if (!isBiometricSupported()) {
    throw new Error('생체 인증을 지원하지 않는 브라우저입니다.')
  }

  // 서버에서 challenge 생성 요청
  const challengeResponse = await fetch('/api/auth/biometric/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (!challengeResponse.ok) {
    const error = await challengeResponse.json().catch(() => ({}))
    throw new Error(error.message || '생체 인증 로그인에 실패했습니다.')
  }

  const { challenge, allowCredentials } = await challengeResponse.json()

  // WebAuthn 인증 요청
  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: Uint8Array.from(atob(challenge), (c) => c.charCodeAt(0)),
    allowCredentials: allowCredentials?.map((cred: { id: string }) => ({
      id: Uint8Array.from(atob(cred.id), (c) => c.charCodeAt(0)),
      type: 'public-key',
    })),
    userVerification: 'required',
    timeout: 60000,
  }

  try {
    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    }) as PublicKeyCredential

    if (!credential) {
      throw new Error('생체 인증이 취소되었습니다.')
    }

    // 서버에 인증 정보 전송
    const response = await credential.response as AuthenticatorAssertionResponse
    const authenticationData = {
      id: credential.id,
      rawId: Array.from(new Uint8Array(credential.rawId)),
      response: {
        clientDataJSON: Array.from(new Uint8Array(response.clientDataJSON)),
        authenticatorData: Array.from(new Uint8Array(response.authenticatorData)),
        signature: Array.from(new Uint8Array(response.signature)),
        userHandle: response.userHandle ? Array.from(new Uint8Array(response.userHandle)) : null,
      },
      type: credential.type,
    }

    const verifyResponse = await fetch('/api/auth/biometric/verify-authentication', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        ...authenticationData,
      }),
    })

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json().catch(() => ({}))
      throw new Error(error.message || '생체 인증 검증에 실패했습니다.')
    }

    const { token } = await verifyResponse.json()

    return { credential, token }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('생체 인증이 거부되었습니다.')
      }
      if (error.name === 'InvalidStateError') {
        throw new Error('생체 인증 정보가 유효하지 않습니다.')
      }
      throw error
    }
    throw new Error('생체 인증 중 오류가 발생했습니다.')
  }
}

/**
 * 생체 인증 등록 여부 확인
 */
export async function isBiometricRegistered(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/auth/biometric/check?userId=${encodeURIComponent(userId)}`)
    if (!response.ok) return false
    const data = await response.json()
    return data.registered === true
  } catch {
    return false
  }
}

/**
 * 생체 인증 등록 해제
 */
export async function removeBiometric(userId: string): Promise<void> {
  const response = await fetch('/api/auth/biometric/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || '생체 인증 해제에 실패했습니다.')
  }
}

