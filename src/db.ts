import * as mongoDB from 'mongodb';
import { MongoClient } from 'mongodb';

let client: mongoDB.MongoClient;

export const initializeDbConnection = async () => {
  client = await MongoClient.connect(
    'mongodb+srv://mohamed:IU3w1ojlXjbHGE6K@next-auth-sample.xzumf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
  );
};

export const getDbConnection = (dbName: string) => {
  const db = client.db(dbName);
  return db;
};
