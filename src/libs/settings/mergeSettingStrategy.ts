import isObject from 'lodash/isObject';
import mergeWith from 'lodash/mergeWith';

import {ChartKitPlugin} from 'src/types';

// @ts-ignore
export function mergeSettingStrategy(objValue: any, srcValue: any, key: string): any {
    if (key === 'plugins') {
        const currentPlugins: ChartKitPlugin[] = [...objValue];
        const newPlugins: ChartKitPlugin[] = [...srcValue];
        // modify existing plugins
        let newSettingsPlugins = currentPlugins.map((currentPlugin) => {
            const newPluginIndex = newPlugins.findIndex(({type}) => type === currentPlugin.type);

            if (newPluginIndex !== -1) {
                const newPlugin = newPlugins[newPluginIndex];
                newPlugins.splice(newPluginIndex, 1);

                return {
                    type: currentPlugin.type,
                    renderer: newPlugin.renderer,
                };
            }

            return currentPlugin;
        });

        // add new plugins if it exist after modified
        if (newPlugins.length > 0) {
            newSettingsPlugins = [...newSettingsPlugins, ...newPlugins];
        }

        return newSettingsPlugins;
    }

    if (isObject(objValue)) {
        return mergeWith(objValue, srcValue, mergeSettingStrategy);
    }

    return srcValue;
}
