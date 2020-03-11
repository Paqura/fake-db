console.clear();

enum CacheOrder {
  Age,
  Value,
}

interface ILRUCache {
  [key: string]: [number, any];
}

class DB {
  static documents = {};
  static LRUCache: ILRUCache = {};

  private maxBufferSize: number = -2;
  
  add<T extends User>(document: string, element: T) {
    if (DB.documents[document] && 
      DB.documents[document][element.id]
    ) {
      throw new Error('User with this name already exists');
    }

    DB.documents[document] = {
      ...DB.documents[document],
      [element.id]: element,
    };
  }

  delete(document: string, elementId: number) {
    delete DB.documents[document][elementId];
  }  

  findById(document: string, id: number) {
    const cachedKey = `${document}-${id}`;

    if (!DB.LRUCache[cachedKey]) {
      DB.LRUCache[cachedKey] = [0, DB.documents[document][id]];
      return DB.documents[document][id]; 
    }

    const keys = Object.keys(DB.LRUCache);
    
    keys.forEach(key => {
      if (key !== cachedKey) {
        DB.LRUCache[key][CacheOrder.Age] = 
          DB.LRUCache[key][CacheOrder.Age] - 1;
      }
    });

    DB.LRUCache[cachedKey][CacheOrder.Age] = 
      DB.LRUCache[cachedKey][CacheOrder.Age] + 1;

    if (keys.length >= 3) {
      this.clearCache(keys);
    }

    return DB.LRUCache[cachedKey][CacheOrder.Value];
  }

  findAll(document: string) {
    return DB.documents;
  }

  clearCache(keys: string[]) {
    let smallIdx = 0;

    keys.forEach((key, idx) => {
      if (DB.LRUCache[keys[smallIdx]] > DB.LRUCache[keys[idx]]) {
        smallIdx = idx;
      }
    });

    if (DB.LRUCache[keys[smallIdx]][CacheOrder.Age] >= this.maxBufferSize) {
      delete DB.LRUCache[keys[smallIdx]];
    }
  }
}

type User = {
  id: number;
  name: string;
}

const db = new DB();

db.add('users', {
  id: 1,
  name: 'slava',
});

db.add('users', {
  id: 2,
  name: 'vasya',
});

db.add('users', {
  id: 3,
  name: 'gosha',
});

console.log(db.findById('users', 2));
console.log(db.findById('users', 2));
console.log(db.findById('users', 1));
console.log(db.findById('users', 1));
console.log(db.findById('users', 3));
console.log(db.findById('users', 3));
console.log(db.findById('users', 3));
console.log(db.findById('users', 3));

console.log(DB.LRUCache)
