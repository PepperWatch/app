const settings = require('./settings/settings.js');
const DB = require('./includes/DB.js');

const ensureThereIsAnAdminUser = async()=>{
	// @todo: check the env to be sure we are not on prod
	const dbInterface = new DB(settings);
	const db = await dbInterface.init();

    let adminUser = await db.User.findOne();
    if (!adminUser) {
		// if there's no users at all
		// create one
		//
        adminUser = new db.User;
        adminUser.username = 'admin';
        adminUser.password = 'admin';

        await adminUser.save();

        console.log('Admin user created');
    } else {
		console.log('There re users in database already');
    }
};

ensureThereIsAnAdminUser();