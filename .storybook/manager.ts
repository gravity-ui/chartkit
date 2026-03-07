import {addons} from 'storybook/manager-api';
import {themes} from './theme';
import './theme-addon/register';

addons.setConfig({
    theme: themes.light,
});
