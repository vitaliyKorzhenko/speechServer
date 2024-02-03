import API from './index';


export const createEntity = async (path, data) => {
    return API.post(path, data, {headers: { "Content-type": "application/json; charset=UTF-8"}});
}


export const getDataEntity = async (path, data) => {
    return API.get(path, data, {headers: { "Content-type": "application/json; charset=UTF-8"}});
}


export const findDataEntity = async (path, data) => {
    return API.post(path, data, {headers: { "Content-type": "application/json; charset=UTF-8"}});
}

export const editEntity = async (path, data) => {
    return API.post(path + '/edit', data, {headers: { "Content-type": "application/json; charset=UTF-8"}});
}

export const deleteEntity = async (path, data) => {
    return API.post(path + '/delete', data, {headers: { "Content-type": "application/json; charset=UTF-8"}});
}