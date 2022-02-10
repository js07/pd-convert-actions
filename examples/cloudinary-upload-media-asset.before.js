//See the API docs: https://cloudinary.com/documentation/image_upload_api_reference#upload_method

if (!params.file) {
  throw new Error("Must provide file parameter.")
}

//Imports and sets up the Cloudinary SDK
const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: auths.cloudinary.cloud_name, 
  api_key: auths.cloudinary.api_key, 
  api_secret: auths.cloudinary.api_secret 
});

//A simple callback to throw an error or return the result 
var upload_response;
const callback = function(error, result) { 
  if(error){    
    const error_content = JSON.stringify(error);
    console.log(error_content);
    throw new Error(error_content);
  }
  upload_response = result;
};

//Populates optional parameters to the request
const options = {
  public_id: params.public_id,
  folder: params.folder,
  use_filename: params.use_filename,
  unique_filename: params.unique_filename,
  resource_type: params.resource_type,
  type: params.type,
  access_control: params.access_control,
  access_mode: params.access_mode,
  discard_original_filename: params.discard_original_filename,
  overwrite: params.overwrite,
  tags: params.tags,
  context: params.context,  
  colors: params.colors,
  faces: params.faces,
  quality_analysis: params.quality_analysis,
  accessibility_analysis: params.accessibility_analysis,
  cinemagraph_analysis: params.cinemagraph_analysis,
  image_metadata: params.image_metadata,
  phash: params.phash,
  responsive_breakpoints: params.responsive_breakpoints,
  auto_tagging: params.auto_tagging,
  categorization: params.categorization,
  detection: params.detection,
  ocr: params.ocr,
  eager: params.eager,
  eager_async: params.eager_async,
  eager_notification_url: params.eager_notification_url,
  transformation: params.transformation,
  format: params.format,
  custom_coordinates: params.custom_coordinates,
  face_coordinates: params.face_coordinates,
  background_removal: params.background_removal,
  raw_convert: params.raw_convert,
  allowed_formats: params.allowed_formats,
  'async': params.async,
  backup: params.backup,
  eval: params.eval,
  headers: params.headers,
  invalidate: params.invalidate,
  moderation: params.moderation,
  notification_url: params.notification_url,
  proxy: params.proxy,
  return_delete_token: params.return_delete_token
};

//Sends the request against Cloudinary to upload a media asset, with given configuration options
await cloudinary.uploader.upload(params.file, options, callback);
return upload_response;