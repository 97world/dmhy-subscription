process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const path = require('path');
const Koa = require('koa');
const mongoose = require('mongoose');
const koaBodyparser = require('koa-bodyparser');
const koaJWT = require('koa-jwt');
const koaViews = require('koa-views');

const log = require('common/log');
const config = require('common/config');
const spider = require('lib/spider');
const monitor = require('lib/monitor');
const router = require('middleware/router');
const onerror = require('middleware/onerror');

const server = new Koa();
const logger = log.loggers.get('server');
const { user, pwd, address, port, dbname } = config.database;

server.use(onerror(logger));
server.use(log.middleware);
server.use(koaBodyparser());
server.use(koaJWT({ secret: config.token.secret }).unless(router.unless));
server.use(koaViews(path.join(__dirname, 'view'), { map: { html: 'nunjucks' } }));
server.use(router.routes());
server.listen(config.server.port);

logger.info('start koa server success, port = %d', config.server.port);

mongoose.connect(`mongodb://${user}:${pwd}@${address}:${port}/${dbname}`);
mongoose.Promise = global.Promise;
mongoose.connection.on('connected', () => {
  logger.info('open database connection successfully.');
});
mongoose.connection.on('error', err => {
  logger.error('open database connection failed. Error=%s', err);
});

// spider('https://share.dmhy.org/topics/list?keyword=%E6%B5%B7%E8%B4%BC%E7%8E%8B&sort_id=0&team_id=34&order=date-desc');
// spider('https://share.dmhy.org/topics/list?keyword=%E5%8F%8C%E6%98%9F&sort_id=0&team_id=90&order=date-desc');

// let taskList = [
//   {
//     url: 'https://share.dmhy.org/topics/list?keyword=%E6%97%8F%E6%8B%BC%7C%E9%BE%8D%E8%BF%B7',  // 龙族拼图
//     checkedAt: null,
//     latestItemURL: '',
//     disabled: false,
//     episodeInfo: null,
//     isNotify4SameEpisode: false,
//   },
//   {
//     url: 'https://share.dmhy.org/topics/list?keyword=%E4%BA%94%E8%91%89%E8%8D%89',  // 黑色五叶草
//     checkedAt: null,
//     latestItemURL: '',
//     disabled: false,
//     episodeInfo: null,
//     isNotify4SameEpisode: true,
//   },
// ];
// monitor(taskList);

module.exports = server;