import config from '@/config';
import {Config} from '@/model/Planning';

export const getConfig = (): Config => {
    const _config = localStorage.getItem(config.LOCAL_STORAGE.CONFIG_KEY);

    try {
        return _config ? JSON.parse(_config) : {};
    } catch (e) {
        return {};
    }
}

export const setConfig = (value: Config): Config => {
    const currentConfig = getConfig();
    const updatedConfig = {...currentConfig, ...value};
    localStorage.setItem(config.LOCAL_STORAGE.CONFIG_KEY, JSON.stringify(updatedConfig));

    return getConfig();
}
