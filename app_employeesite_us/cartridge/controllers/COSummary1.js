'use strict';
let ISML = require('dw/template/ISML');
function ShowTemp()
{
    ISML.renderTemplate('myTemplate'); 
  
}

ShowTemp.public = true;
module.exports.ShowTemp= ShowTemp;