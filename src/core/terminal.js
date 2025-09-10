const nowISO = () => new Date().toISOString();
const deepClone = obj => JSON.parse(JSON.stringify(obj));

export { nowISO, deepClone};