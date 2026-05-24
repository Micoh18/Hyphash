import type { Locale } from "@/lib/i18n";
import { getPreferredLocale } from "@/lib/i18n/locale";

type AuthErrorKey =
  | "generic"
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "emailAlreadyRegistered"
  | "weakPassword"
  | "resetEmailFailed"
  | "passwordTooShort"
  | "passwordsDoNotMatch"
  | "passwordUpdateFailed"
  | "expiredRecoveryLink";

type Messages = Record<AuthErrorKey, string>;

const MESSAGES: Record<Locale, Messages> = {
  en: {
    generic: "We couldn't complete that action. Please try again.",
    invalidCredentials: "We couldn't sign you in with those credentials.",
    emailNotConfirmed: "You need to confirm your account before signing in.",
    emailAlreadyRegistered: "That email is already registered. Try signing in instead.",
    weakPassword: "Please use a stronger password.",
    resetEmailFailed: "We couldn't send the recovery email. Please try again in a moment.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordsDoNotMatch: "Passwords do not match.",
    passwordUpdateFailed: "We couldn't update your password. Please request a new recovery link.",
    expiredRecoveryLink: "This recovery link is invalid or expired. Please request a new one.",
  },
  es: {
    generic: "No pudimos completar esa acción. Inténtalo nuevamente.",
    invalidCredentials: "No pudimos iniciar sesión con esas credenciales.",
    emailNotConfirmed: "Debes confirmar tu cuenta antes de iniciar sesión.",
    emailAlreadyRegistered: "Ese correo ya está registrado. Intenta iniciar sesión.",
    weakPassword: "Usa una contraseña más segura.",
    resetEmailFailed: "No pudimos enviar el correo de recuperación. Inténtalo de nuevo en un momento.",
    passwordTooShort: "La contraseña debe tener al menos 8 caracteres.",
    passwordsDoNotMatch: "Las contraseñas no coinciden.",
    passwordUpdateFailed: "No pudimos actualizar tu contraseña. Solicita un nuevo enlace de recuperación.",
    expiredRecoveryLink: "Este enlace de recuperación no es válido o expiró. Solicita uno nuevo.",
  },
  pt: {
    generic: "Não foi possível concluir essa ação. Tente novamente.",
    invalidCredentials: "Não foi possível entrar com essas credenciais.",
    emailNotConfirmed: "Você precisa confirmar sua conta antes de entrar.",
    emailAlreadyRegistered: "Esse email já está registrado. Tente entrar.",
    weakPassword: "Use uma senha mais segura.",
    resetEmailFailed: "Não foi possível enviar o email de recuperação. Tente novamente em instantes.",
    passwordTooShort: "A senha deve ter pelo menos 8 caracteres.",
    passwordsDoNotMatch: "As senhas não coincidem.",
    passwordUpdateFailed: "Não foi possível atualizar sua senha. Solicite um novo link de recuperação.",
    expiredRecoveryLink: "Este link de recuperação é inválido ou expirou. Solicite um novo.",
  },
  ru: {
    generic: "Не удалось выполнить действие. Попробуйте еще раз.",
    invalidCredentials: "Не удалось войти с этими учетными данными.",
    emailNotConfirmed: "Перед входом нужно подтвердить аккаунт.",
    emailAlreadyRegistered: "Этот email уже зарегистрирован. Попробуйте войти.",
    weakPassword: "Используйте более надежный пароль.",
    resetEmailFailed: "Не удалось отправить письмо для восстановления. Попробуйте позже.",
    passwordTooShort: "Пароль должен содержать не менее 8 символов.",
    passwordsDoNotMatch: "Пароли не совпадают.",
    passwordUpdateFailed: "Не удалось обновить пароль. Запросите новую ссылку восстановления.",
    expiredRecoveryLink: "Эта ссылка восстановления недействительна или устарела. Запросите новую.",
  },
};

function messages(): Messages {
  return MESSAGES[getPreferredLocale()] ?? MESSAGES.en;
}

export function authErrors(): Messages {
  return messages();
}

export function translateAuthError(error: unknown): string {
  const msg = String(error instanceof Error ? error.message : error ?? "").toLowerCase();
  const m = messages();

  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return m.invalidCredentials;
  }
  if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
    return m.emailNotConfirmed;
  }
  if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user already registered")) {
    return m.emailAlreadyRegistered;
  }
  if (msg.includes("weak password") || msg.includes("password") && msg.includes("weak")) {
    return m.weakPassword;
  }

  return m.generic;
}

export function translatePasswordUpdateError(error: unknown): string {
  const msg = String(error instanceof Error ? error.message : error ?? "").toLowerCase();
  const m = messages();

  if (msg.includes("expired") || msg.includes("invalid") || msg.includes("token")) {
    return m.expiredRecoveryLink;
  }
  if (msg.includes("weak") || msg.includes("short")) {
    return m.weakPassword;
  }

  return m.passwordUpdateFailed;
}
