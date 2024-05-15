import json
from pymongo import MongoClient
from bson import ObjectId

def save(entity:str, obj:object):
    client = MongoClient('localhost', 27017)
    db = client['brv']
    collection = db[entity]

    if not obj.get('_id') is None:
        result = collection.update_one({"_id": ObjectId(obj["_id"])}, {"$set": dict(obj)}, upsert=True)
    else:
        result = collection.insert_one(dict(obj))
    return json.dumps(result, default=str)

def get(entity:str):
    client = MongoClient('localhost', 27017)
    db = client['brv']
    collection = db[entity]
    return json.dumps(list(collection.find()), default=str)

def get_query(entity:str, query:dict):
    client = MongoClient('localhost', 27017)
    db = client['brv']
    collection = db[entity]
    return  json.dumps(list(collection.find_one(query)), default=str)


