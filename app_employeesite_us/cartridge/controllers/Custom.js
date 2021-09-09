'use strict';
let ISML = require('dw/template/ISML');
function showTemplate()
{
    ISML.renderTemplate('myTemplate'); 
  
}

showTemplate.public = true;
module.exports.showTemplate= showTemplate;
