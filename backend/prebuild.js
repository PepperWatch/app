const settings = require('./settings/settings.js');
const DB = require('./includes/DB.js');

const run = async()=>{
    const db = new DB(settings);

    settings.db = await db.init();
    // if we are on Heroku:
    // check if current deploy is updated and create notification if it is
    const deployChecker = settings.db.Setting.getDeployChecker();
    await deployChecker.notifyOfBuildStart();

    process.exit(1);
};

run();