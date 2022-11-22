module.exports = {
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        {name: '@storybook/preset-scss'},
        {name: '@storybook/addon-knobs'},
        {
            name: '@storybook/addon-essentials',
            options: {
                controls: true,
                actions: false,
            },
        },
    ],
    typescript: {
        check: true,
        checkOptions: {},
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            setDisplayName: false,
            shouldExtractLiteralValuesFromEnum: true,
            compilerOptions: {
                allowSyntheticDefaultImports: true,
                esModuleInterop: true,
            },
        },
    },
};
