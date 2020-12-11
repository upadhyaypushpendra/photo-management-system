module.exports.createResponse = (success,payload)=>{
    let response={};
    response.success = success;
    if(success){
        response.result = payload;
        response.error = null;
    } else {
        response.error = payload;
        response.result = null;
    }
};