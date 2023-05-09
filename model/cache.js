const axios = require("axios");
const db = require("../modules/db");
const minExpire = 600;

module.exports = class {
	static async fetchUrl(url) {
		let connection = await db.getConnection();
		const rows = await connection.query("SELECT data,timestampdiff(minute,`date`,now()) as minDiff from cache where url like ? and timestampdiff(minute,`date`,now()) <= ? order by `date` desc limit 1;", [url, minExpire]);

        if (rows.length > 0) {
            connection.end();
            let age = Number(rows[0].minDiff);
            let diff = minExpire- Number(rows[0].minDiff);
            console.log(diff);
           let data = JSON.parse(rows[0].data);
           data.cached = {age: age, expires: diff};
            return data;
        }

        let fetch = await axios.get(url);
        let data = fetch.data;

        await connection.query("INSERT INTO cache (url, data) VALUES (?, ?);", [url, JSON.stringify(data)]);
        data.cached = {age: 0, expires: minExpire};
        return data;

	}
};