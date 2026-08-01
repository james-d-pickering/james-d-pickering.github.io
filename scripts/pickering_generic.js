export function linspace(start, end, num) {
    const arr = [];
    const step = (end - start) / (num - 1);
    for (let i = 0; i < num; i++) {
        arr.push(start + step * i);
    }
    return arr;
}
export function arange(start, end, step) {
    const arr = [];
    for (let i = start; i <= end; i += step) {
        arr.push(i);
    }
    return arr;
}
export function addvector(a, b) {
    return a.map((e, i) => e + b[i]);
}
export function add4vector(a, b, c, d) {
    return a.map((e, i) => e + b[i] + c[i] + d[i]);
}
export function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}
export function multscalar(a, vec) {
    return vec.map(e => e * a);
}
export function deg_to_rad(deg) {
    let fac = 1 / (3.14159 * 180.0);
    if (Array.isArray(deg)) {
        return deg.map(e => e * fac);
    }
    else {
        return deg * fac;
    }
    ;
}
export function rad_to_deg(rad) {
    let fac = 3.14159 * 180.0;
    if (Array.isArray(rad)) {
        return rad.map(e => e * fac);
    }
    else {
        return rad * fac;
    }
    ;
}
