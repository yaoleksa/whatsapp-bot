// Declare all constants
const { S3Client, HeadObjectCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

module.exports = class R2Store {
    constructor(opts={}) {
        if(!opts.bucket) {
            throw new Error('R2Store: bucket is required');
        }
        this.bucket = opts.bucket;
        const endpoint = opts.endpoint;
        this.s3 = new S3Client({
            endpoint,
            region: opts.region || 'auto',
            credentials: {
                accessKeyId: opts.accessKeyId,
                secretAccessKey: opts.secretAccessKey
            },
            forcePathStyle: !!opts.forcePathStyle
        });
    }

    _keyFor(session) {
        const id = session || 'default';
        return `wwebjs-sessions/${id}.zip`;
    }

    // return boolean
    async sessionExists({ session }) {
        const Key = this._keyFor(session);
        try {
            await this.s3.send(new HeadObjectCommand({
                Bucket: this.bucket,
                Key
            }));
            return true;
        } catch(err) {
            const code = err.name || err.$metadata?.httpStatusCode;
            if(code === 'NotFound' || code === 404) {
                return false;
            }
            throw err;
        }
    }

    async save({ session, zipBuffer }) {
        if(!zipBuffer) {
            console.warn('R2Store.save: zipBuffer is missing');
            return null;
        }
        const Key = this._keyFor(session);
        await this.s3.bucket.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key,
            Body: zipBuffer
        }));
    }

    async extract({ session, destPath }) {
        const Key = this._keyFor(session);
        const resp = await this.s3.bucket.send(new GetObjectCommand({
            Bucket: this.bucket,
            Key
        }));
        const tmpFile = path.join(os.tmpdir(), `r2-wwebjs-${Date.now()}-${Math.floor(Math.random() * 10000)}.zip`);
        await fs.ensureDir(path.dirname(tmpFile));
        await new Promise((resolve, reject) => {
            const write = fs.createWriteStream(tmpFile);
            resp.Body.pipe(write);
            resp.Body.on('error', reject);
            write.on('error', reject);
            write.on('finish', resolve);
        });

        await fs.remove(destPath);
        await fs.ensureDir(destPath);
        const zip = AdmZip(tmpFile);
        // extract to destPath. IMPORTANT: the zip must contain the proper profile structure
        zip.extractAllTo(destPath, true);
        await fs.remove(tmpFile);
    }

    async delete({ session }) {
        const Key = this._keyFor(session);
        try {
            await this.s3.send(new DeleteObjectCommand({
                Bucket: this.bucket,
                Key
            }));
        } catch(err) {
            console.warn(`R2Store.delete: WARNING! ${err.message || err}`);
        }
    }
}