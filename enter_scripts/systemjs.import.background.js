if (typeof SystemJS !== 'undefined')
    SystemJS.import('back/background');
if (typeof module === 'undefined')
    var exports = {};
export function getBundle() {
    return 'back/background.js';
}
//# sourceMappingURL=systemjs.import.background.js.map