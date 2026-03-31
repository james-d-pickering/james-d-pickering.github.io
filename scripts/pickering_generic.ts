export function linspace(start: number, end: number, num: number): number[] {
    const arr: number[] = [];
    const step = (end - start) / (num - 1);
    for (let i = 0; i < num; i++) {
        arr.push(start + step * i);
    }
    return arr;
}

export function arange(start: number, end: number, step: number): number[] {
    const arr: number[] = [];
    for (let i = start; i <= end; i += step) {
        arr.push(i);
    }
    return arr;
}

export function addvector(a: number[],b:number[]) : number[] {
    return a.map((e,i) => e + b[i]);
}

export function add4vector(a: number[],b:number[], c:number[], d:number[]) : number[] {
    return a.map((e,i) => e + b[i]+c[i]+d[i]);
}

export function transpose<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

export function multscalar(a: number, vec: number[]) : number[] {
    return vec.map(e => e*a);
}

export function deg_to_rad(deg: number | number[] ): number | number[] { 
    let fac: number = 1/(3.14159*180.0);
    if (Array.isArray(deg)) {
        return deg.map(e => e * fac);
    } else 
    {   return deg * fac};
}

export function rad_to_deg(rad: number | number[] ): number | number[] { 
    let fac: number = 3.14159*180.0;
    if (Array.isArray(rad)) {
        return rad.map(e => e * fac);
    } else 
    {   return rad * fac};
}


