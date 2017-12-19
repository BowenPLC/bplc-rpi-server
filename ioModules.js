const constants = require('bplc-node-server').constants;
const gpio = require('onoff').Gpio;

const moduleImpls = {
    DigitalOutputs: {
        PiNative: "PiNative",
    },
};

class PiNativeOutputModule {
    constructor(config) {
        this.name = config.name;
        this.moduleType = constants.io.modules.DigitalOutput;
        this.outOfRangeError = {
            status: 417,
            error: { message: 'Module index out of range.', },
        };

        this.outputs = [
            new gpio(4, 'out'),
            new gpio(17, 'out'),
            new gpio(27, 'out'),
            new gpio(22, 'out'),
            new gpio(18, 'out'),
            new gpio(23, 'out'),
            new gpio(24, 'out'),
            new gpio(25, 'out'),
        ];

        outputs.forEach(output => {
            output.write(0, () => {});
        });
    }

    async get(index) {
        if (index >= this.outputs.length) {
            return this.outOfRangeError;
        }

        return await this.read(index);
    }

    async set(index, state) {
        if (index >= this.outputs.length) {
            return this.outOfRangeError;
        }

        const type = typeof state;
        if (type !== 'boolean') {
            return {
                status: 417,
                error: { message: `Type error: need state of type boolean, got ${type}.`, },
            };
        }

        try {
            await this.write(index, state);
        } catch (err) {
            return {
                status: 500,
                error: err,
            };
        }

        return undefined;
    }

    async getAll() {
        const outputs = new Array(this.outputs.length);
        for(let i = 0; i < outputs.length; i++) {
            outputs[ i ] = await this.read(i);
        }

        return outputs;
    }

    write(index, state) {
        return new Promise((resolve, reject) => {
            this.outputs[ index ].write(state ? 0 : 1, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }

            });
        })
    }

    read(index) {
        return new Promise((resolve, reject) => {
            this.outputs[ index ].read((err, value) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    }
}

module.exports.moduleMap = {
    [ constants.io.modules.DigitalOutput ]: {
        [ moduleImpls.DigitalOutputs.PiNative ]: config => new PiNativeOutputModule(config),
    }
};
