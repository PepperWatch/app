

class StorageBucket {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this.db = params.db || null;
        this.client = params.client || null;
        this.bucketName = params.bucketName || null;

        this.settings = params.settings || {};

        this.domain = this.settings.domain;
        if (this.domain) {
            this.domain = this.domain.split('https://').join('');
            this.domain = this.domain.split('/').join('');
        }
	}

    get id() {
        return this.settings.id;
    }

    isPublic() {
        return !!this.settings.isPublic;
    }

    get levelToList() {
        return this.settings.levelToList;
    }
    get levelToGet() {
        return this.settings.levelToGet;
    }
    get levelToPut() {
        return this.settings.levelToPut;
    }

    hasAccessToList(user) {
        return user.hasLevelOf(this.settings.levelToList);
    }

    hasAccessToGet(user) {
        return user.hasLevelOf(this.settings.levelToGet);
    }

    hasAccessToPut(user) {
        return user.hasLevelOf(this.settings.levelToPut);
    }

    async list(prefix = '') {
        // const client = await this.getBucketClient();
        const data = [];
        const stream = this.client.listObjects(this.bucketName, prefix, false);

        await new Promise((res, rej)=>{
            stream.on('data', function(obj) { data.push(obj) } )
            stream.on("end", function(obj) { res(obj); })
            stream.on('error', function(err) { rej(err); } )
        });

        if (this.isPublic()) {
            data.forEach((item)=>{
                if (item.name) {
                    item.url = 'https://'+this.settings.domain+'/'+item.name;
                }
            });
        }

        return data;
    }

    async presignedPost(path) {
        const policy = this.client.newPostPolicy();
        policy.setBucket(this.bucketName);
        policy.setKey(path);

        const expires = new Date();
        expires.setSeconds(24 * 60 * 60 * 1);
        // Policy expires in 1 days.
        policy.setExpires(expires)

        if (this.isPublic()) {
            policy.policy.conditions.push(['eq', '$acl', 'public-read']);
            policy.formData.acl = 'public-read';
        }

        const data = await new Promise((res,rej)=>{
            this.client.presignedPostPolicy(policy, function(err, data) {
                if (err) {
                    return rej(err);
                }

                return res(data);
            });
        });

        return data;
    }

    async presignedPutObject(path) {
        const url = await new Promise((res,rej)=>{
            this.client.presignedPutObject(this.bucketName, path, 24*60*60, function(err, presignedUrl) {
                if (err) {
                    return rej(err);
                }

                return res(presignedUrl);
            });
        });

        return url;
    }

    async presignedGetObject(path, download = true) {
        const url = await new Promise((res,rej)=>{
            const respHeaders = {};
            if (download) {
                let fileName = path.split('/').pop();
                respHeaders['response-content-disposition'] = "attachment; filename=\""+fileName+"\"";
            }

            this.client.presignedGetObject(this.bucketName, path, 24*60*60, respHeaders, function(err, presignedUrl) {
                if (err) {
                    return rej(err);
                }

                return res(presignedUrl);
            });
        });

        return url;
    }
}

module.exports = StorageBucket;