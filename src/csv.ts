import { get as request, } from 'http';
import { get as requestHTTPS, } from 'https';
import { default as validURL, } from 'valid-url';
import { default as csv, } from 'csvtojson';

export type FilePath = String;
export type CSVOptions = {
  [index: string]: string|boolean;
};;
export type CSVJSONRow = {
  [index: string]: string;
};
export type CSVJSON = CSVJSONRow[];
/**
 * Asynchronously loads a CSV from a remote URL and returns an array of objects
 * @example
 * // returns [{header:value,header2:value2}]
 * loadCSVURI('https://raw.githubusercontent.com/repetere/modelscript/master/test/mock/data.csv').then(csvData).catch(console.error)
 * @param {string} filepath - URL to CSV path
 * @param {Object} [options] - options passed to csvtojson
 * @returns {Object[]} returns an array of objects from a csv where each column header is the property name  
 */
export async function loadCSVURI(filepath:string, options?:CSVOptions):Promise<CSVJSON> {
  const reqMethod = (filepath.search(/https/gi) > -1) ? requestHTTPS : request;
  return new Promise((resolve, reject) => {
    const csvData:CSVJSON = [];
    const config = Object.assign({ checkType: true, }, options);
    const req = reqMethod(filepath, res => {
      csv(config).fromStream(res)
        .subscribe((json:CSVJSONRow)=>{
          csvData.push(json);
        },
        //onError
        (err:Error) => {
          return reject(err);
        },
        //onComplete
        (error?:Error) => {
          if (error) {
            return reject(error);
          } else {
            return resolve(csvData);
          }
        }
        )
        // .on('data', jsonObj => {
        //   csvData.push(JSON.parse(jsonObj.toString()));
        // })
        // .on('json', (jsonObj:CSVJSONRow) => {
        //   csvData.push(jsonObj);
        // })
        // .on('error', )
        // .on('done', );
    });
    req.on('error', reject);
  });
}


/**
 * Asynchronously loads a CSV from either a filepath or remote URL and returns an array of objects
 * @example
 * // returns [{header:value,header2:value2}]
 * loadCSV('../mock/invalid-file.csv').then(csvData).catch(console.error)
 * @param {string} filepath - URL to CSV path
 * @param {Object} [options] - options passed to csvtojson
 * @returns {Object[]} returns an array of objects from a csv where each column header is the property name  
 */
export async function loadCSV(filepath:string, options?:CSVOptions):Promise<CSVJSON> {
  if (validURL.isUri(filepath)) {
    return loadCSVURI(filepath, options);
  } else {
    return new Promise((resolve, reject) => {
      const csvData:CSVJSON = [];
      const config = Object.assign({ checkType: true, }, options);
      csv(config).fromFile(filepath)
      .subscribe((json:CSVJSONRow,lineNumber:number)=>{
        csvData.push(json);
      },
        //onError
        (err:Error) => {
          return reject(err);
        },
        //onComplete
        (error?:Error) => {
          if (error) {
            return reject(error);
          } else {
            return resolve(csvData);
          }
        }
      )
    });
  }
}

/**
 * Asynchronously loads a TSV from either a filepath or remote URL and returns an array of objects
 * @example
 * // returns [{header:value,header2:value2}]
 * loadCSV('../mock/invalid-file.tsv').then(csvData).catch(console.error)
 * @param {string} filepath - URL to CSV path
 * @param {Object} [options] - options passed to csvtojson
 * @returns {Object[]} returns an array of objects from a csv where each column header is the property name  
 */
export async function loadTSV(filepath:string, options?:CSVOptions) {
  const tsvOptions = Object.assign({
    checkType: true,
  }, options, {
    delimiter: '\t',
  });
  return loadCSV(filepath, tsvOptions);
}
