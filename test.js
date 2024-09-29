const nanoid_1 = await import("nanoid");
class NanoCustomerIdGenerator {
    nanoid;
    constructor() {
        const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        this.nanoid = (0, nanoid_1.customAlphabet)(alphabet, 10);
    }
    generate() {
        return this.nanoid.apply(this);
    }
}

let b = new NanoCustomerIdGenerator()
console.log(b.generate())