exports.pick = (obj, keys) => keys.reduce((a, k) => { if (obj && k in obj) a[k] = obj[k]; return a; }, {});
