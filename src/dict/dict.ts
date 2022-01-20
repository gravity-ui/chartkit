const keysets: any = {
    ru: {
        error: 'Ошибка',
        'error-unknown-extension': 'Неизвестный тип чарта',
        'tooltip-sum': 'Сумма',
        'tooltip-rest': 'Остальные',
    },
    en: {
        error: 'Error',
        'error-unknown-extension': 'Unknown chart type',
        'tooltip-sum': 'Sum',
        'tooltip-rest': 'Rest',
    },
};

export const dict = (lang: 'en' | 'ru', keyset: any) => {
    if (!['en', 'ru'].includes(lang)) {
        return '';
    }

    return keysets[lang][keyset] || '';
};
