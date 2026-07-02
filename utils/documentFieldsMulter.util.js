// 📁 middleware/config/countryDocument.js
const CountryDocument = [
  {
    field: 'flag',
    docTypeName: 'Country Flag',
    extensions: ['.ico', '.webp', '.jpg', '.jpeg', '.png', '.svg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    maxCount: 1
  }
];


module.exports = {
  CountryDocument
};