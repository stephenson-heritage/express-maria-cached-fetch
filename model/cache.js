const axios = require("axios");
const db = require("../modules/db");
const minExpire = 600;

module.exports = class {
    static async fetchUrl(url) {
        let connection = await db.getConnection();
        // find 1 db entry for the fetch url with a timestamp less than minExpire minutes old
        const rows = await connection.query("SELECT data,timestampdiff(minute,`date`,now()) as age from cache where url like ? and timestampdiff(minute,`date`,now()) <= ? order by `date` desc limit 1;", [url, minExpire]);

        // if there are any rows, return the data
        if (rows.length > 0) {
            connection.end();

            // provide cache information in result
            let age = Number(rows[0].age); // cast BigInt as Number
            let diff = minExpire - age; // provide how many minutes until new copy is fetched
            let data = JSON.parse(rows[0].data); // parse the JSON string from the db
            data.cached = { age: age, expires: diff }; // add cache information to the data
            return data;
        }

        // cache is too old or doesn't exist, fetch new data
        let fetch = await axios.get(url);
        let data = fetch.data;

        // save the data to the db (for future requests)
        await connection.query("INSERT INTO cache (url, data) VALUES (?, ?);", [url, JSON.stringify(data)]);
        // provide cache information in result (to maintain data structure used on cache hit)
        data.cached = { age: 0, expires: minExpire };
        connection.end();
        return data;

    }
};