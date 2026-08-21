import firebaseConfig from "../../firebase-applet-config.json";

// Helpers to parse Firestore REST API response fields
export function parseFirestoreValue(valueObj: any): any {
  if (!valueObj) return undefined;
  if ('stringValue' in valueObj) return valueObj.stringValue;
  if ('booleanValue' in valueObj) return valueObj.booleanValue;
  if ('integerValue' in valueObj) return parseInt(valueObj.integerValue, 10);
  if ('doubleValue' in valueObj) return parseFloat(valueObj.doubleValue);
  if ('nullValue' in valueObj) return null;
  if ('arrayValue' in valueObj) {
    const values = valueObj.arrayValue.values || [];
    return values.map((v: any) => parseFirestoreValue(v));
  }
  if ('mapValue' in valueObj) {
    const mapFields = valueObj.mapValue.fields || {};
    const parsedMap: any = {};
    for (const key of Object.keys(mapFields)) {
      parsedMap[key] = parseFirestoreValue(mapFields[key]);
    }
    return parsedMap;
  }
  return valueObj;
}

export function parseFirestoreFields(fieldsObj: any) {
  if (!fieldsObj) return {};
  const parsed: any = {};
  for (const key of Object.keys(fieldsObj)) {
    parsed[key] = parseFirestoreValue(fieldsObj[key]);
  }
  return parsed;
}

// Convert JS objects to Firestore REST API typed fields format
export function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (val instanceof Date) return { stringValue: val.toISOString() };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(v => toFirestoreValue(v))
      }
    };
  }
  if (typeof val === 'object') {
    const fields: any = {};
    for (const key of Object.keys(val)) {
      fields[key] = toFirestoreValue(val[key]);
    }
    return {
      mapValue: { fields }
    };
  }
  return { stringValue: String(val) };
}

export function toFirestoreFields(obj: any) {
  const fields: any = {};
  for (const key of Object.keys(obj)) {
    fields[key] = toFirestoreValue(obj[key]);
  }
  return { fields };
}

// REST API wrapper to GET a single Firestore document
export async function restGetDocument(collectionName: string, docId: string, idToken: string) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/${collectionName}/${docId}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    if (response.ok) {
      const data: any = await response.json();
      if (data && data.fields) {
        return parseFirestoreFields(data.fields);
      }
    }
  } catch (err: any) {
    console.error(`REST GET failed for ${collectionName}/${docId}:`, err.message || err);
  }
  return null;
}

// REST API wrapper to PATCH (upsert/set) a single Firestore document
export async function restSetDocument(collectionName: string, docId: string, data: any, idToken: string) {
  try {
    const fieldsPayload = toFirestoreFields(data);
    const queryParams = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/${collectionName}/${docId}?${queryParams}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fieldsPayload)
    });
    return response.ok;
  } catch (err: any) {
    console.error(`REST PATCH failed for ${collectionName}/${docId}:`, err.message || err);
    return false;
  }
}

// REST API wrapper to query community admins by tenantId
export async function restQueryAdmins(tenantId: string, idToken: string): Promise<any[]> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents:runQuery`;
    const payload = {
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: "tenantId" },
                  op: "EQUAL",
                  value: { stringValue: tenantId }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: "role" },
                  op: "IN",
                  value: {
                    arrayValue: {
                      values: [
                        { stringValue: "superadmin" },
                        { stringValue: "admin" },
                        { stringValue: "ketua" },
                        { stringValue: "bendahara" },
                        { stringValue: "sekretaris" }
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const results: any = await response.json();
      if (Array.isArray(results)) {
        const admins: any[] = [];
        for (const item of results) {
          if (item.document && item.document.fields) {
            admins.push(parseFirestoreFields(item.document.fields));
          }
        }
        return admins;
      }
    }
  } catch (err: any) {
    console.error("Firestore REST API runQuery failed:", err.message || err);
  }
  return [];
}
