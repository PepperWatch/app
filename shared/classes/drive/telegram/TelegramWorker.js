import { Api, TelegramClient, sessions } from "telegram";

const StringSession = sessions.StringSession;
// import { StringSession } from "telegram/sessions";
const BigInteger = require("big-integer");
import CommonTelegramMethods from './CommonTelegramMethods.js';

class TelegramWorker extends CommonTelegramMethods {
    constructor() {
        super();

        this._isConnecting = false;
        this._isConnected = false;

        this._client = null;
        this._apiId = null;
        this._apiHash = null;
        this._connectionRetries = 2;

        this._phoneNumber = null;
        this._password = null;
        this._code = null;

        this.waitingFor = {

        };

        this._uploadingFilesChunk = {
        };
        this._uploadingFilesChunks = {
        };
        this._uploadingFilesIds = {
        };
        this._uploadedFilesChunksCount = {
        };
        this._uploadChunkSize = 128 * 1024;


        this._LARGE_FILE_THRESHOLD = 10 * 1024 * 1024;
        this._debug = true;
    }

    async uploadFilePart(fileId, bytes, isLarge, totalParts) {
        let filePart = 0;
        if (!this._uploadedFilesChunksCount[fileId]) {
            this._uploadedFilesChunksCount[fileId] = 0;
        } else {
            filePart = this._uploadedFilesChunksCount[fileId];
        }
        this._uploadedFilesChunksCount[fileId]++;

        let query;
        if (isLarge) {
            query = new this.Api.upload.SaveBigFilePart({
                                fileId: this._uploadingFilesIds[fileId],
                                filePart: filePart,
                                fileTotalParts: totalParts,
                                bytes: Buffer(bytes),
                            });
        } else {
            query = new this.Api.upload.SaveFilePart({
                                fileId: this._uploadingFilesIds[fileId],
                                filePart: filePart,
                                bytes: Buffer(bytes),
                            });
        }
        const resp = await this.invoke(query);

        let progress = (filePart / totalParts);
        this.dispatchEvent('progress', {
            fileId: fileId,
            progress: progress,
        });

        return resp;
    }

    async endFile(options = {}) {
        options.end = true;

        let fileId = options.fileId;
        if (!fileId) {
            throw new Error('fileId required');
        }

        let fileName = options.fileName;
        if (!fileName) {
            throw new Error('fileName required');
        }

        const photoExts = ['png', 'jpg', 'jpeg'];
        const videoExts = ['mp4', 'mpeg', 'avi', 'mov', 'webm'];
        const re = /(?:\.([^.]+))?$/;
        const extension = (''+re.exec(fileName)[1]).toLowerCase();

        let fileType = null;
        if (photoExts.indexOf(extension) !== -1) {
            fileType =  'photo';
        } else if (videoExts.indexOf(extension) !== -1) {
            fileType =  'video';
        }

        if (!fileType) {
            throw new Error('Invalid fileName');
        }

        if (this._uploadingFilesChunks[fileId] && this._uploadingFilesChunks[fileId].length) {
            // there're chunks waiting to be uploaded
            let length = 0;
            this._uploadingFilesChunks[fileId].forEach(item => {
                length += item.length;
            });

            this._uploadingFilesChunk[fileId] = new Uint8Array(length);
            let offset = 0;
            this._uploadingFilesChunks[fileId].forEach(item => {
                this._uploadingFilesChunk[fileId].set(item, offset);
                offset += item.length;
            });

            if (options.bytes) {
                length = length + (options.bytes.length  || options.bytes.byteLength);
            }

            options.totalSize = length;
        } else if (options.bytes) {
            options.totalSize = options.bytes.length || options.bytes.byteLength;
        }

        await this.writeFile(options);

        if (!options.send) {
            return true;
        }

        const totalSize = options.totalSize;
        const isLarge = totalSize > this._LARGE_FILE_THRESHOLD;
        const totalParts = Math.ceil(totalSize / this._uploadChunkSize);

        let inputFile;

        if (isLarge) {
            inputFile = new this.Api.InputFileBig({
                id: this._uploadingFilesIds[fileId],
                parts: totalParts,
                name: fileName,
            });
        } else {
            inputFile = new this.Api.InputFile({
                id: this._uploadingFilesIds[fileId],
                parts: totalParts,
                name: fileName,
                md5Checksum: "", // This is not a "flag", so not sure if we can make it optional.
            });
        }


        const entity = await this._client.getInputEntity(options.destination);

        let media;
        if (fileType == 'photo') {
            media = new this.Api.InputMediaUploadedPhoto({
                file: inputFile,
            });
        } else {
            const documentStruct = {
                file: inputFile,
                mimeType: 'video/mp4',
                attributes: [],
            };

            if (options.thumb) {
                if (this._uploadingFilesIds[options.thumb]) {
                    const thumbInputFile = new this.Api.InputFile({
                        id: this._uploadingFilesIds[options.thumb],
                        parts: this._uploadedFilesChunksCount[options.thumb],
                        name: 'image.png',
                        md5Checksum: "", // This is not a "flag", so not sure if we can make it optional.
                    });

                    documentStruct.thumb = thumbInputFile;
                }
            }

            if (options.width && options.height && options.duration) {
                const attr = new this.Api.DocumentAttributeVideo({
                    duration: options.duration,
                    h: options.height,
                    w: options.width,
                    roundMessage: false,
                    supportsStreaming: true,
                });

                documentStruct.attributes.push(attr);
            }

            media = new this.Api.InputMediaUploadedDocument(documentStruct);
        }

        const request = new this.Api.messages.SendMedia({
            peer: entity,
            media: media,
            message: 'https://pepperwatch.com',
        });
        const result = await this._client.invoke(request);

        const message = await this._client._getResponseMessage(request, result, entity);

        return message;
    }

    async writeFile(options = {}) {

        let fileId = options.fileId;
        if (!fileId) {
            throw new Error('fileId required');
        }
        // normalize fileId to bigint
        if (!this._uploadingFilesIds[fileId]) {
            this._uploadingFilesIds[fileId] = BigInteger(Math.floor(Number. MAX_SAFE_INTEGER * Math.random()));
        }
        // fileId = this._uploadingFilesIds[fileId];

        let bytes = options.bytes;
        if (bytes instanceof ArrayBuffer) {
            bytes = new Uint8Array(bytes);
        }

        if (!this._uploadingFilesChunk[fileId]) {
            this._uploadingFilesChunk[fileId] = null;
            this._uploadingFilesChunks[fileId] = [];

            if (!options.totalSize) {
                this._uploadingFilesChunks[fileId].push(bytes);
            }
        } else {
            if (options.totalSize) {
                // we already know the size, so we can start uploading
                if (bytes) {
                    const mergedBytes = new Uint8Array(this._uploadingFilesChunk[fileId].length + bytes.length);
                    mergedBytes.set(this._uploadingFilesChunk[fileId]);
                    mergedBytes.set(bytes, this._uploadingFilesChunk[fileId].length);
                    bytes = mergedBytes;
                } else {
                    bytes = this._uploadingFilesChunk[fileId];
                }
            } else {
                // we don't know size yet, so lets gather all chunks first and upload them on .endFile()
                this._uploadingFilesChunks[fileId].push(bytes);
            }
        }

        if (!options.totalSize) {
            // stored, going to upload on .endFile()
            return true;
        }

        const totalSize = options.totalSize;
        const isLarge = totalSize > this._LARGE_FILE_THRESHOLD;
        const totalParts = Math.ceil(totalSize / this._uploadChunkSize);

        let i = 0;
        while ((bytes.length - i) > this._uploadChunkSize) {
            const subBytes = bytes.subarray(i, i + this._uploadChunkSize);
            i += this._uploadChunkSize;
            await this.uploadFilePart(fileId, subBytes, isLarge, totalParts);
        }

        if (options.end) {
            // send the last part if there's any
            const subBytes = bytes.subarray(i);
            await this.uploadFilePart(fileId, subBytes, isLarge, totalParts);
        } else {
            this._uploadingFilesChunk[fileId] = bytes.subarray(i);
            if (!this._uploadingFilesChunk[fileId].length) {
                this._uploadingFilesChunk[fileId] = null;
            }
        }


        return true;
    }

    get me() {
        return this._me;
    }

    get Api() {
        return Api;
    }

    get client() {
        return this._client;
    }

    async invoke(q) {
        this.log(q);
        const result = await this._client.invoke(q);
        this.log(result);

        return result;
    }

    async checkAuthorization() {
        return await this._client.checkAuthorization();
    }

    async getDialogs(params) {
        return await this._client.getDialogs(params);
    }

    async getMessages(options = {}) {
        if (options.entity && options.entity.id) {
            options.entity = options.entity.id;
        }
        if (options.params && options.params.filter) {
            if (options.params.filter == 'InputMessagesFilterPhotoVideo') {
                options.params.filter = this.Api.InputMessagesFilterPhotoVideo;
            }
        }

        return await this._client.getMessages(options.entity, options.params);
    }

    async downloadProfilePhoto(options = {}) {
        if (options.entity && options.entity.id) {
            options.entity = options.entity.id;
        }
        return await this._client.downloadProfilePhoto(options.entity, options.fileParams);
    }

    async downloadMedia(options = {}) {
        if (options.entity && options.entity.className) {
            if (options.entity.className == 'MessageMediaPhoto') {
                // download photo
                options.entity.photo.fileReference = Buffer(options.entity.photo.fileReference);
                options.entity = new this.Api.Photo(options.entity.photo);
            } else if (options.entity.className == 'MessageMediaDocument') {
                // download media document
                options.entity.document.fileReference = Buffer(options.entity.document.fileReference);
                options.entity = new this.Api.Document(options.entity.document);
                if (options.entity.size) {
                    options.entity.size = BigInteger(options.entity.size);
                }
            }
        }

        return await this._client.downloadMedia(options.entity, options.downloadParams);
    }

    async downloadFile(options = {}) {
        let dcId = null;

        if (options.entity && options.entity.className) {
            if (options.entity.className == 'MessageMediaPhoto') {
                // download photo
                options.entity.photo.fileReference = Buffer(options.entity.photo.fileReference);
                options.entity.photo.thumbSize = 'y';
                dcId = options.entity.photo.dcId;

                options.entity = new this.Api.InputPhotoFileLocation(options.entity.photo);

            } else if (options.entity.className == 'MessageMediaDocument') {
                // download media document
                options.entity.document.fileReference = Buffer(options.entity.document.fileReference);
                options.entity.document.thumbSize = '';
                dcId = options.entity.document.dcId;

                options.entity = new this.Api.InputDocumentFileLocation(options.entity.document);

            }
        }

        if (options.offset && typeof(options.offset.value) == 'bigint') {
            options.offset = BigInteger(options.offset.value);
        }
        if (options.limit && options.limit.value) {
            options.limit = Number(options.limit.value);
        }


        // const updateReferenceResult = await this._client.getMessages(options.folder, {ids: options.message});
        // if (updateReferenceResult && updateReferenceResult[0]) {
        //     if (updateReferenceResult[0].media) {
        //         if (updateReferenceResult[0].media.document) {
        //             options.entity.fileReference = Buffer(updateReferenceResult[0].media.document.fileReference);
        //         }
        //         if (updateReferenceResult[0].media.photo) {
        //             console.error('accessHash', updateReferenceResult[0].media.photo.accessHash);
        //             options.entity.fileReference = updateReferenceResult[0].media.photo.fileReference;
        //             // options.entity.fileReference = Buffer(updateReferenceResult[0].media.photo.fileReference);
        //         }
        //     }
        // }
        // console.error('updateReferenceResult', updateReferenceResult);



        try {
            let sender = null;
            if (dcId) {
                sender = await this._client.getSender(dcId);
            }

            const result = await this._client.invoke(new this.Api.upload.GetFile({
                precise: false,
                location: options.entity,
                offset: options.offset,
                limit: options.limit,
                thumbSize: '',
            }), sender);

            return result.bytes;
        } catch(e) {
            console.error(e);
        }
    }

    async getMe() {
        // const cacheId = 'telegram_session_me';
        // const cacheLifetime = 1000;

        // const cached = this.getCached(cacheId, cacheLifetime);
        // if (cached) {
        //  return JSON.parse(cached);
        // }

        const me = await this.invoke(new this.Api.users.GetUsers({id: ['me']}));
        if (me && me[0] && me[0].id) {
            // this.setCache(cacheId, JSON.stringify(me[0]));
            return me[0];
        }
    }

    dispatchEvent(eventName, data) {
        const payload = {
            id: 'event',
            data: {
                event: eventName,
                detail: data,
            },
        };
        postMessage(payload);
    }

    async setApiId(apiId) {
        this._apiId = apiId;
        this.resolveWaiter();
    }

    async setApiHash(apiHash) {
        this._apiHash = apiHash;
        this.resolveWaiter();
    }

    async setPhoneNumber(phoneNumber) {
        this._phoneNumber = phoneNumber;
        this.resolveWaiter();
    }

    async setPassword(password) {
        this._password = password;
        this.resolveWaiter();
    }

    async setCode(code) {
        this._code = code;
        this.resolveWaiter();
    }

    async setSession(session) {
        this._session = session;
        this.resolveWaiter();
    }

    async waitForPhoneNumber() {
        return await this.waitFor('phoneNumber');
    }

    async waitForCode() {
        return await this.waitFor('code');
    }

    async waitForPassword() {
        return await this.waitFor('password');
    }

    async waitForQR() {
        return await this.waitFor('qr');
    }

    resolveWaiter() {
        if (this.__waitForPromise) {
            this.__waitForPromiseResolver();
            this.__waitForPromise = null;
            this.__waitForPromiseResolver = null;
        }
    }

    async waitFor(propertyName) {
        this.waitingFor[propertyName] = true;
        this.isWaiting = true;

        if (this['_'+propertyName]) {
            this.waitingFor[propertyName] = false;
            this.isWaiting = false;
            return this['_'+propertyName];
        }
        if (this.__waitForPromise) {
            await this.__waitForPromise;
            this.waitingFor[propertyName] = false;
            this.isWaiting = false;
            return this['_'+propertyName];
        }

        this.__waitForPromiseResolver = null;
        this.__waitForPromise = new Promise((res)=>{
            this.__waitForPromiseResolver = res;
        });

        this.dispatchEvent('wait', {what: propertyName});

        await this.__waitForPromise;
        this.waitingFor[propertyName] = false;
        this.isWaiting = false;
        return this['_'+propertyName];
    }

    async initialize(options = {}) {
        const qr = options.qr || false;

        if (this.__initializationPromise) {
            return await this.__initializationPromise;
        }

        this.__initializationPromiseResolver = null;
        this.__initializationPromise = new Promise((res)=>{
            this.__initializationPromiseResolver = res;
        });

        let apiId = await this.waitFor('apiId');
        let apiHash = await this.waitFor('apiHash');

        if (!apiId || !apiHash) {
            this.isConnected = false;
        } else {
            apiId = parseInt(apiId, 10);

            let stringSession = await this.waitFor('session');
            if (!stringSession) {
                stringSession = '';
            }

            try {
                this._stringSession = new StringSession(stringSession);
            } catch(e) {
                this._stringSession = new StringSession('');
            }
            try {
                this._client = new TelegramClient(this._stringSession, apiId, apiHash, {
                    connectionRetries: this._connectionRetries,
                });

                if (qr) {
                    await this._client.connect();
                    await this._client.signInUserWithQrCode({
                                apiId,
                                apiHash,
                            },
                            {
                                password: async()=>{ return await this.waitForPassword() },
                                onError: (err) => { console.error(err); this.log(err) },
                                qrCode: async(code) => {
                                    const url = `tg://login?token=${Buffer(code.token).toString('base64').replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_")}`;
                                    // src: https://github.com/rmw-lib/buffer.base64url/blob/master/src/index.coffee
                                    this.dispatchEvent('qr', {url: url});
                                },
                            });

     // * const user = await client.signInUserWithQrCode({ apiId, apiHash },
     // * {
     // *       onError: async function(p1: Error) {
     // *           console.log("error", p1);
     // *           // true = stop the authentication processes
     // *           return true;
     // *       },
     // *       qrCode: async (code) => {
     // *           console.log("Convert the next string to a QR code and scan it");
     // *           console.log(
     // *               `tg://login?token=${code.token.toString("base64url")}`
     // *           );
     // *       },
     // *       password: async (hint) => {
     // *           // password if needed
     // *           return "1111";
     // *       }
     // *   }
     // * );
                } else {
                    await this._client.start({
                        phoneNumber: async()=>{ return await this.waitForPhoneNumber() },
                        password: async()=>{ return await this.waitForPassword() },
                        phoneCode: async()=>{ return await this.waitForCode() },
                        onError: (err) => { console.error(err); this.log(err) },
                    });
                }


                if (await this._client.checkAuthorization()){
                    this.isConnected = true;
                    this.log("You should now be connected.");

                    this._me = await this.getMe();

                    if (this._me) {
                        this.log('Connected');
                        this.dispatchEvent('me', this._me);
                        this.dispatchEvent('session', {session: this._client.session.save()});
                    } else {
                        this.log('Can not get ME from TG');
                        this.dispatchEvent('session', {session: null});
                    }
                } else {
                    this.isConnected = false;
                    this.log("Error conencting.");
                    this.dispatchEvent('session', {session: null});
                }
            } catch(e) {
                this.isConnected = false;

                this.log("Error conencting.");
                this.log(e);
            }
        }

        this.__initializationPromiseResolver(this.isConnected);

        if (this.isConnected) {
            this.dispatchEvent('connected');
            // this.dispatchEvent(new CustomEvent('connected'));
        } else {
            this.dispatchEvent('disconnected');
            // this.dispatchEvent(new CustomEvent('disconnected'));
        }

        return this.isConnected;
    }


    async disconnect() {
        const resp = await this.invoke(new this.Api.auth.LogOut({}));
        if (resp) {
            await this._client.disconnect();
        }
        return resp;
    }
}

const telegramWorker = new TelegramWorker();

function removeProps(obj,keys){
  if(Array.isArray(obj)){
    obj.forEach(function(item){
      removeProps(item,keys)
    });
  }
  else if(typeof obj === 'object' && obj != null && !ArrayBuffer.isView(obj)){
    try {
        Object.getOwnPropertyNames(obj).forEach(function(key){
            if (obj[key] && obj[key].value && typeof(obj[key].value) == 'bigint') {
                // console.error('found bigint', key, obj[key]);
                obj[key] = obj[key].value;
            } else {
                if (key.indexOf('_') !== 0) { // ignore private methods
                    removeProps(obj[key], keys);
                } else {
                    // remove private methods
                    delete obj[key];
                }
            }
        });
    } catch(e) {
        console.error(e);
        console.error(obj);
    }
  }
}


onmessage = function(e) {
    const {id, method, options} = e.data;

    if (telegramWorker[method]) {
        telegramWorker[method](options)
            .then((data)=>{
                removeProps(data);

                const payload = {
                    data: data,
                    success: true,
                    id: id,
                };
                postMessage(payload);
            })
            .catch((e)=>{
                console.error(e);
                const payload = {
                    id: id,
                    data: e,
                    success: false,
                };
                postMessage(payload);
            });
    }
}