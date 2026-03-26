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

export function RK4_solver( func: Function, trange: number[], 
                     y0: number, h: number, verbose: boolean = false, ...restArgs: any) : number[] { 
    // ts implementation of an RK4 solver. how to enforce a function signature on func?
    let solution: number[] = [y0,];
    if (verbose == true) {console.log('Starting ODE solver...');}
    for (let t = 0;  t < trange[1] ;  t += h) { 
        if (verbose == true) {console.log('Time step', t);}
        let y = solution[solution.length - 1];
        let k1 = func(t, y, ...restArgs);
        let k2 = func(t+0.5*h, y+k1*h*0.5, ...restArgs);
        let k3 = func(t+0.5*h, y+k2*h*0.5, ...restArgs);
        let k4 = func(t+h, y+k3*h, ...restArgs);
        if (verbose == true) {console.log('ks are:', k1, k2, k3, k4);}
        let ynext = y + 0.16667*h * (k1 + 2*k2 + 2*k3 + k4);
        if (verbose == true) {console.log('y and ynext are', y, ynext);}
        solution.push(ynext);
    }
    return solution;
};

export function RK4_system_solver( func: Function, trange: number[], 
                     y0: number[], h: number, verbose: boolean = false, ...restArgs: any) : number[] { 
    // version of above for solving a system of ODEs
    let solution: any[] = [ y0 ]; //have to make this any[] to be an array of arrays?

    if (verbose == true) {console.log('Starting ODE solver...');}
    
    for (let t = 0;  t < trange[1] ;  t += h) { 
        if (verbose == true) {console.log('Time step', t);}

        let y = solution[solution.length - 1]; // this will be a vector
        if (verbose == true) {console.log('y is', y);}
        let k1 = func(t, y, ...restArgs);
        if (verbose == true) {console.log('k1 is', k1);}
        let k2 = func(t+0.5*h, addvector(y,multscalar(h*0.5,k1)), ...restArgs);

        let k3 = func(t+0.5*h, addvector(y, multscalar(h*0.5,k2)), ...restArgs);
        let k4 = func(t+h, addvector(y, multscalar(h,k3)), ...restArgs);
    
        let ynext = addvector(y, multscalar(0.16667*h, 
            add4vector(k1, multscalar(2, k2), multscalar(2, k3), k4)));
 
        if (verbose == true) {console.log('y and ynext are', y, ynext);}
        solution.push(ynext);
    }
    return solution;
};

export function kinetic_model_A_k1_B( t : number, yvec: number[], kvec: number[] ) {

    let output: number[] = []
    output.push( -kvec[0]*yvec[0])
    output.push(kvec[0]*yvec[0])
    // shape of output is [y0, y1, ..., yn]. the RHS of the equation.
    return output;
};

export function kinetic_model_A_k1_B_autocat( t : number, yvec: number[], kvec: number[] ) {

    let output: number[] = []
    output.push( -kvec[0]*yvec[0]*yvec[1])
    output.push(kvec[0]*yvec[0]*yvec[1])
    // shape of output is [y0, y1, ..., yn]. the RHS of the equation.
    return output;
};


export function kinetic_model_A_k1_B_k2_C( t : number, yvec: number[], kvec: number[] ) {

    let output: number[] = []
    output.push( -kvec[0]*yvec[0])
    output.push(kvec[0]*yvec[0]-kvec[1]*yvec[1])
    output.push(kvec[1]*yvec[1])
    // shape of output is [y0, y1, ..., yn]. the RHS of the equation.
    return output;
};

export function kinetic_model_A_B_k1_C( t : number, yvec: number[], kvec: number[] ) {

    let output: number[] = []
    output.push(-kvec[0]*yvec[0]*yvec[1])
    output.push(-kvec[0]*yvec[0]*yvec[1])
    output.push(kvec[0]*yvec[0]*yvec[1])
    // shape of output is [y0, y1, ..., yn]. the RHS of the equation.
    return output;
};

export function kinetic_model_A_k1_B_A_k2_C( t : number, yvec: number[], kvec: number[] ) {

    let output: number[] = []
    output.push(-kvec[0]*yvec[0] - kvec[1]*yvec[0])
    output.push(kvec[0]*yvec[0])
    output.push(kvec[1]*yvec[0])
    // shape of output is [y0, y1, ..., yn]. the RHS of the equation.
    return output;
};

export function kinetic_model_A_B_k12_C_k3_D( t : number, yvec: number[], kvec: number[] ) {

    let output: number[] = []
    output.push(-kvec[0]*yvec[0]*yvec[1] + kvec[1]*yvec[2])
    output.push(-kvec[0]*yvec[0]*yvec[1] + kvec[1]*yvec[2])
    output.push(kvec[0]*yvec[0]*yvec[1] - kvec[1]*yvec[2] - kvec[2]*yvec[2])
    output.push(kvec[2]*yvec[2])
    // shape of output is [y0, y1, ..., yn]. the RHS of the equation.
    return output;
};

export function kinetic_model_A_B_k12_C_k3_D_MM( t : number, yvec: number[], kvec: number[] ) {

    let output: number[] = []
    output.push(-kvec[0]*yvec[0]*yvec[1] + kvec[1]*yvec[2]+kvec[2]*yvec[2])
    output.push(-kvec[0]*yvec[0]*yvec[1] + kvec[1]*yvec[2])
    output.push(kvec[0]*yvec[0]*yvec[1] - kvec[1]*yvec[2] - kvec[2]*yvec[2])
    output.push(kvec[2]*yvec[2])
    // shape of output is [y0, y1, ..., yn]. the RHS of the equation.
    return output;
};


export function RK4_array_example_sol( t : number[], y0: number[], k: number ) {

    let exact: any[] = []
    for (let time of t) {
        let y1: number = y0[0]*Math.exp(-k*time);
        let y2: number = (y0[0] + y0[1])-y0[0]*Math.exp(-k*time);
        exact.push([y1, y2])
    }

    // shape of output is [y0, y1, ..., yn]. the RHS of the equation.
    return exact;
};

export function RK4_example_func( t : number, y: number, k: number = 1) {
    let output = -y*k;
    return output;
};

export function RK4_example_sol( t: number[], y0: number, k: number) : number[] {
    let exact: number[] = []
    for (let time of t) {
        exact.push(y0*Math.exp(-k*time))
    }
    return exact;
}



