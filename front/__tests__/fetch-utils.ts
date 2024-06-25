export function createFetchResponse<T>(data: T) {
    return { 
        json: () => new Promise((resolve) => resolve(data)),
        ok: true
    }
}

export function createFetchThrow404Error() {
    return {
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
    }
}