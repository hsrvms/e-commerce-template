export function mapWarningsToI18nKeys(warnings: string[]): string[] {
  const warningKeyMap: { [key: string]: string } = {
    'The password must be at least 10 characters long.': 'password.MIN_LENGTH',

    'The password must contain at least one uppercase letter.':
      'password.UPPERCASE_REQUIRED',

    'The password must contain at least one number.':
      'password.NUMBER_REQUIRED',

    'The password must contain at least one special character.':
      'password.SPECIAL_CHAR_REQUIRED',
  };

  return warnings.map((warning) => warningKeyMap[warning] || warning);
}
