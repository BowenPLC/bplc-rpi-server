const ioModules = require('./ioModules');

class RPICore {
    constructor() {
        this.reset();
    }

    reset() {
        this.valid = false;
        this.config = undefined;
        this.ioMap = [];
    }

    setConfig(config) {
        this.reset();

        config.modules.forEach(mod => {
            if (!(mod.moduleType in ioModules.moduleMap)) {
                throw new Error(`Unsupported module type ${mod.moduleType}`);
            }

            if (!(mod.implType in ioModules.moduleMap[ mod.moduleType ])) {
                throw new Error(`Unsupported module implementation type ${mod.implType}`);
            }

            this.ioMap.push(ioModules.moduleMap[ mod.moduleType ][ mod.implType ](mod));
        });

        this.valid = true;
        this.config = config;
    }

    async setIO(mod, index, state) {
        if (typeof mod === 'number') {
            return await this.setIOByIndex(mod, index, state);
        }

        return await this.setIOByName(mod, index, state);
    }

    getStatus() {
        return { valid: this.valid, };
    }

    async dump() {
        const data = [];
        for (let i = 0; i < this.ioMap.length; i++) {
            let modData = await this.ioMap[ i ].getAll();
            data.push({
                type: this.ioMap[ i ].moduleType,
                name: this.ioMap[ i ].name,
                data: modData,
            });
        }

        return data;
    }

    async setIOByIndex(mod, index, state) {
        if (mod >= this.ioMap.length) {
            return {
                status: 417,
                error: { message: `No such module ${mod}`, },
            };
        }

        return await this.ioMap[ mod ].set(index, state);
    }

    async setIOByName(mod, index, state) {
        const foundMod = this.ioMap.filter(x => x.name === mod);

        if (foundMod.length !== 1) {
            return {
                status: 417,
                error: { message: `No such module ${mod}`, },
            };
        }

        return await foundMod[ 0 ].set(index, state);
    }
}

module.exports.RPICore = RPICore;
