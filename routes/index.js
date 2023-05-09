var express = require('express');
var router = express.Router();
const cache = require("../model/cache");

/* GET home page. */
router.get('/', async function(req, res, next) {

  let data = await cache.fetchUrl("https://services.arcgis.com/G6F8XLCl5KtAlZ2G/arcgis/rest/services/Public_Drinking_Water_Fountains/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson");

  console.log("data: ", data);
  res.render('index', { title: 'Express' });
});

router.get('/fountains', async function(req, res, next) {

  let data = await cache.fetchUrl("https://services.arcgis.com/G6F8XLCl5KtAlZ2G/arcgis/rest/services/Public_Drinking_Water_Fountains/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson");

  res.json(data);
});

module.exports = router;
