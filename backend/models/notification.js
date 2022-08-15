

module.exports = function(mongoose, connection, db) {
    var modelName = 'Notification';
    var schema = mongoose.Schema({
        user: { type : mongoose.Schema.Types.ObjectId, ref: 'User' },
        level: { type: String, }, // group notification
        template: { type : mongoose.Schema.Types.ObjectId, ref: 'NotificationTemplate' },
        email: { type: String, }, // may be notified without user created
        sent: { type: Boolean, default: false, }, // sent successfuly

        // subject: { type: String, }, // may be notified without user created
        // message: { type: String, }, // may be notified without user created

        tags: {type: Object},
    },
    { collection: 'notifications', timestamps: true });

    // schema.virtual('test').get(function () {  resturn 'test';  });  //// - item.test (available both on backend and on UI side)
    // schema.statics.getActive = function() {   };         ///// - db.Size.getActive()
    // schema.methods.updateSomething = function() {   };   ///// - item.updateSomething()
    //                                                      ///// more: http://mongoosejs.com/docs/guide.html

    // virtual will be available for models on client-side too!
    // Note! No arrow function for virtuals!
    schema.virtual('subject').get(function() {
        if (this.template && this.template.subject) {
            let subject = this.template.subject;

            for (let key in this.tags) {
                subject = subject.split('%'+key+'%').join(this.tags[key]);
            }

            return subject;
        }
        return '';
    });

    schema.statics.onListQuery = async function(query, request) {
        let mine = request.query.mine ? request.query.mine : null;

        if (mine || !request.user.hasLevelOf('admin')) {
            // force showing only related to user notificatons if she is not admin

            const allLevels = request.user.getAvailableAccessLevels();

            // direct notification to user
            const or = [
                {'user': request.user._id},
            ];

            // all levels of user + levels < then user's one
            for (let level of allLevels) {
                or.push({'level': level});
            }

            query = query.and({
                $or: or});
        }
    }

    schema.statics.apiPost = async function() {
        throw new Error('You dont have rights for this path');
    }
    schema.methods.apiPut = async function() {
        throw new Error('You dont have rights for this path');
    }
    schema.methods.apiDelete = async function() {
        throw new Error('You dont have rights for this path');
    }

    schema.statics.notify = async function(params = {}) {
        const templateName = params.templateName;
        const tags = params.tags;
        const user = params.user;
        let level = params.level;
        let channel = params.channel;
        const doNotSave = params.doNotSave;
        const silent = params.silent || false;

        try {
            const template = await db.NotificationTemplate.get(templateName);
            if (!template) {
                throw new Error('Invalid templateName');
            }

            let email = null;

            if (user && user.email) {
                email = user.email;
            } else if (mongoose.isValidObjectId(user)) {
                const fromDBUser = await db.User.findOne({_id: user});
                if (fromDBUser && fromDBUser.email) {
                    email = fromDBUser.email;
                }
            }

            if (!email && !level && !channel) {
                if (template.showInUI && template.defaultTargetLevel) {
                    level = template.defaultTargetLevel;
                }
                if (template.canSendToSlack && template.defaultTargetChannel) {
                    channel = template.defaultTargetChannel;
                }
            }

            if (!email && !level && !channel) {
                throw new Error('specify user, channel or notification level or set default ones for NotificationTemplate');
            }

            let sent = false;
            if (email && template.canSendAsEmail) {
                sent = await template.send({
                    email: email,
                    tags: tags,
                });
            }
            if (channel && template.canSendToSlack) {
                sent = await template.send({
                    channel: channel,
                    tags: tags,
                });
            }

            if (!doNotSave) {
                // need to check for common tags to save in notification objects
                const commonTags = await db.Setting.getMessageCommonTags();
                for (let key in commonTags) {
                    if (template.subject.indexOf('%'+key+'%') !== -1) {
                        tags[key] = commonTags[key];
                    }
                }
            }

            const notification = new db.Notification;
            notification.template = template;
            notification.tags = tags;

            if (email) {
                notification.email = email;
            }
            if (user) {
                notification.user = user;
            }
            if (level) {
                notification.level = level;
            }

            notification.sent = sent;

            if (!doNotSave) {
                await notification.save();
            }

            return notification;
        } catch(e) {
            if (!silent) {
                throw e;
            }
        }

        return null;
    }

    var model = connection.model(modelName, schema);
    return {
        'modelName': modelName,
        'model': model
    };
};