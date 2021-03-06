const Router = require('koa-router');
const path = require('path');
const fs = require('fs');
const methods = require('methods');

const router = new Router();
const controllerPath = path.join(__dirname, '../controller/');
const controllerFile = fs.readdirSync(controllerPath);

router.unless = { path: [] };

controllerFile.forEach(fileName => {
  const controller = require(path.join(controllerPath, fileName));
  Object.keys(controller).forEach(URL => {
    const group = controller[URL];
    methods.forEach(method => {
      const methodController = group[method.toUpperCase()];
      if (methodController) {
        router[method](URL, methodController);
        if (group.jwtUnless) {
          router.unless.path.push(URL);
        }
      }
    });
  });
});

module.exports = router;