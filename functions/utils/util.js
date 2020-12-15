// createReponse
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

  // [START delete_collection]
  // [START firestore_data_delete_collection]
  module.exports.deleteCollection = async (db, collectionPath, batchSize)=> {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }
  
  async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }
  
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve);
    });
  }
  
  // [END firestore_data_delete_collection]
  // [END delete_collection]
  