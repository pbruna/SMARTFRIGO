declare var SystemJS: any
if (typeof SystemJS !== 'undefined') SystemJS.import('back/background');


if (typeof module === 'undefined') var exports = {}
export function getBundle(): string {
    return 'back/background.js'
}
